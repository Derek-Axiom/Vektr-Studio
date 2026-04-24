# Project 80853603: Code vs. Reality Audit & Restoration Plan

> [!CAUTION]
> **AUDIT RESULT:** The UI implies that the OmniRack DSP (Compressor, Saturation, Reverb, Filters) actively processes the real-time microphone signal and that recordings inherit these effects. **This is architecturally false.** The live microphone records a completely flat, un-processed signal. The OmniRack is wired strictly to the global playback `<audio>` tracker and completely ignores the live `MediaRecorder`.

## 1. Deep Audit: Real vs. Mock Breakdown

### MobileStudio.tsx (Recorder & Tuner)
* **Live Microphone UI / Analyser**: **MOCK / DISCONNECTED**
  The `getUserMedia` microphone signal is passed through a basic `GainNode=1.5` and fed directly to `MediaRecorder` and a dedicated `AnalyserNode`. It **bypasses the `useOmniRack` DSP chain entirely.**
* **OmniRack UI (Dynamics, Space, Mod tabs)**: **DISCONNECTED**
  When UI sliders are moved, they update `rackParams` in `ProfileContext`. However, `ProfileContext` only applies `rackParams` to the global `<audio>` playback tracker. **The sliders have zero effect on active recordings or the live microphone feed.**
* **Metronome**: **DISCONNECTED**
  The metronome uses `const osc = ctx.createOscillator()` and writes directly to `ctx.destination` (speaker), bypassing both the `MediaRecorder` track and any active DSP logic. It spins up a redundant AudioContext reference loop.
* **Tuner**: **REAL (but Isolated)**
  The Tuner uses autocorrelation on the microphone, but it repeatedly spawns new `AudioContext` structures fallback (`new window.AudioContext()`), risking AudioContext connection exhaustion.

### ProfileContext.tsx & useOmniRack.ts
* **globalCtxRef Integration**: **BROKEN** 
  `ProfileContext` creates a singleton `globalCtxRef` via `useOmniRack`, but `useOmniRack` forces the input source to be an `HTMLAudioElement`. Because the hook hard-binds to an `HTMLAudioElement`, `MobileStudio.tsx` cannot pipe its `MediaStreamSource` (live microphone) into the OmniRack. 

### VektrLabContext.ts
* **FFT Visualization Heuristics**: **MOCK** 
  Lines explicitly state: `// For the sake of zero-latency UX in this module context, we map to a mock heuristic...`. The visual pipelines guess or fake realtime FFT density rather than performing actual spectral analysis against the live global Analyser node.

---

## 2. The Restoration Plan (Blueprint)

### Phase 1: Infrastructure (Global Audio Context sync)
> [!IMPORTANT]
> AudioContext exhaustion must be eliminated. We must guarantee a Single-Source-of-Truth audio graph.

#### [MODIFY] `src/lib/useOmniRack.ts`
1. Re-architect the `useOmniRack` signature to accept a polymorphic `sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null` instead of an `HTMLAudioElement`.
2. Allow `ctxRef` to be injected globally rather than instantiated blindly. 

#### [MODIFY] `src/lib/ProfileContext.tsx`
1. Standardize `globalCtxRef`. Guarantee it mounts at the absolute root and initializes exactly once.
2. Abstract the live `MediaStreamDestination` out of `MobileStudio.tsx` and place it in the global context, allowing any component to capture the master mixed/processed pipeline.

### Phase 2: Logic Wiring (Connecting UI sliders to Core DSP nodes)

#### [MODIFY] `src/pages/MobileStudio.tsx`
1. **Reroute the Microphone**: Disconnect `source -> gain -> destination` in `initRecorderDSP()`.
2. Wire the `MediaStreamSource` directly into the `useOmniRack` global routing chain.
3. **Capture the Wet Signal**: Point the `MediaRecorder` to the output `MediaStreamDestination` at the very end of the `useOmniRack` chain, ensuring that Chorus, Saturation, and EQ are physically printed into the `Blob` saved to the vault.
4. Purge redundant `new window.AudioContext()` calls from Tuner and Metronome. Route them strictly through `globalCtxRef.current`.

### Phase 3: Feature Completion (Replacing heuristics with real math)

#### [MODIFY] `src/lib/VektrLabContext.ts`
1. Strip out the faked heuristic mock code.
2. Import `globalAnalyserRef` from `useProfile()`.
3. Directly call `globalAnalyserRef.current.getByteFrequencyData()` on Mount to drive all real-time visualizers, ensuring the UI 1:1 matches the mathematical audio output.

## User Review Required
This teardown requires decoupling the `useOmniRack` from the HTML5 `<audio>` element so it can process raw Microphone streams. Implementing this will momentarily disable playback while the WebAudio graph is rewired. Do you approve this structural refactor?
