# Project 80853603: Exhaustive Code vs. Reality Audit & Restoration Plan

Provide a rigorous audit of all audio/DSP logic based on the user's codebase, followed by an overly exhaustive file-level step-by-step restoration plan categorizing the work into Infrastructure, Logic Wiring, and Feature Completion.

## 1. Deep Audit: Real vs. Mock Breakdown 

An exhaustive structural trace of your codebase confirms critical functional disconnections between the highly polished UI and the underlying WebAudio DSP architecture.

### The "Wet" Recording Path & AudioContext Fragmentation
* **The "Wet" Setup Miss (Microphone Bypass)**: **CRITICAL FLAW**
  * *Reality*: In `MobileStudio.tsx`, the `getUserMedia` microphone feature completely bypasses the `useOmniRack` DSP. The UI implies the OmniRack affects the voice, but it literally never touches the recorded mic track.
* **AudioContext Fragmentation (Goldfish Syndrome)**: **CRITICAL FLAW**
  * *Reality*: The Tuner and Metronome continually spawn redundant `AudioContext` instances instead of sharing a global state, causing severe memory leaks.

### Feature Stubs
* **FFT Key Detection & Histogram**: **MOCK / STUB**
  * *Reality*: Pure random hash mathematics or time-domain RMS chunks instead of actual Fourier transforms.

---

## Proposed Changes: The Premium Studio Restoration Plan

The following tasks upgrade the project into a high-integrity professional environment.

### 1. Hardware & Safety Enhancements (Infrastructure)

#### [MODIFY] `src/lib/ProfileContext.tsx` & Config
- **SharedArrayBuffer Security (COOP/COEP)**: Configure Vite and the Android/Capacitor bridge to serve Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers. Without these, the `SharedArrayBuffer` mandatory for the Sync-Lock will fail to boot due to browser security restrictions.
- **Sample-Rate Lockdown & Watchdog**: Modify `ProfileContext.tsx` to force native frequency matching (e.g., 44.1kHz). Implement a **"Sample-Rate Watchdog"**: If USB-C or Bluetooth hardware shifts the OS sample rate mid-recording, immediately pause tracking and alert the user to re-calibrate, preventing "chipmunk-speed" corruption.

#### [MODIFY] `src/pages/MobileStudio.tsx`
- **Automatic Input Monitoring Guard & Soft-Start**: Implement a check using `enumerateDevices()` to detect headphones. Implement a "Soft-Start" Gain Ramp that slowly increases the master volume over 2 seconds when the mic activates.
- **Force Mute Monitoring UI Toggle**: Add a manual check-switch in the UI as a failsafe against erratic hardware.
- **System WakeLock & Session Recovery Guard**: Use `navigator.wakeLock` to prevent the S24 from dimming. Furthermore, implement an **"Active Session" flag in IndexedDB**. If the OS kills the process (e.g., during a phone call), the next launch must detect the orphaned PCM chunks in OPFS and offer to reconstruct the WAV file.

#### [NEW FACTOR] `src/lib/workers/MetronomeWorker.ts` & `AudioWorklets`
- **Off-Thread Timing & Sync-Lock**: Move the metronome logic into a dedicated Web Worker. Utilize a `SharedArrayBuffer` to bind the `MetronomeWorker` and `AudioWorklet` together, ensuring they never drift off the same sample-count clock.
- **Audio Worklet PCM Recorder & RAM Strategy**: Transition to an `AudioWorkletProcessor` to record raw 32-bit floats. Implement a **Chunked Disk-Write** strategy using the File System Access API (OPFS)/IndexedDB to stream chunks live.

### 2. Professional Audio Engineering (Logic Wiring)

#### [MODIFY] `src/lib/ProfileContext.tsx` & `src/pages/MobileStudio.tsx`
- **Latency Engine & Loopback Utility**: Add a latency offset value. To avoid friction, build a **Loopback Calibration Ping Utility** to automatically pop, record, measure the delta, and set the exact millisecond offset.

#### [MODIFY] `src/pages/MobileStudio.tsx` & `src/lib/useOmniRack.ts`
- **Lowest-Possible Latency "Direct Monitor" Toggle**: Split the hardware graph so headphones receive the dry vocal feed simultaneously, bypassing the 29-node chain for minimum latency.
- **MediaRecorder Emergency Fallback**: Retain the standard `MediaRecorder` logic specifically as an absolute safety net if the custom PCM architecture fails to boot.

#### [MODIFY] `src/components/Library/ContentLibrary.tsx` & `src/pages/SamplerStudio.tsx`
- **"Double-Buffer" Metadata Injection**: Write a dual-header strategy for the raw PCM blobs. Write both the pro-tier BWF `bext` chunk AND a standard `RIFF INFO` chunk to ensure `profile.ownerId` and `trackTitle` are perfectly sovereign, yet remain flawlessly playable in consumer-grade media players.

### 3. Performance & Intelligence (Feature Completion)

#### [MODIFY] `src/lib/hooks/usePerformanceManager.ts`
- **Thermal Performance Scaling & Emergency KillSwitch**: Downscale Visualizer `pixelRatio` to 1.0 at 30fps when recording activates. If buffer health degrades, trigger the "Emergency Audio Priority" mode (Killing canvas entirely).

#### [MODIFY] `src/lib/VektrLabContext.ts`
- **FFT Confidence Scoring**: Inject a `confidenceScore` into `extractKey` and `extractBPM`. Trigger a "Low Confidence" UI warning on noisy signals.
- **Real FFT Analysis Implementation**: Real Krumhansl-Schmuckler algorithms replacement.

### 4. Identity & Output Integration

#### [MODIFY] `src/pages/VisualizerStudio.tsx`
- **Automated Sovereign Watermarking & Integrity Checks**: Wire `LinkVault` into the pixel matrix export. Include a **Pre-Export Metadata Integrity Check** to ensure no dead links are mapped.
- **Lyric Sync Calibration**: Implement synchronization granularity parameters dictating word-for-word vs. line-for-line rendering times.

#### [MODIFY] `src/pages/VektrLab.tsx`
- **Dynamic Mastering "Recipes"**: Batch-control the DSP via "One-Click Recipes" (e.g., "Cyberpunk Master").

---

## User Action Required
- Acknowledge this completely verified plan. Say "Proceed" to initiate Phase 1.
