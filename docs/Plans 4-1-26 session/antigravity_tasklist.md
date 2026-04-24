# VEKTR STUDIO Premium Studio Restoration Task List

- `[x]` **Phase 1: Hardware & Safety Enhancements**
  - `[x]` **Audio Engine Arch**: Configure Vite / Bridge for COOP/COEP Headers to enable `SharedArrayBuffer` security standard.
  - `[x]` **Audio Engine Arch**: Implement **"Sample-Rate Lockdown"** and the **"Sample-Rate Watchdog"** (to pause on unexpected hardware clock shifts).
  - `[x]` Modify `src/lib/useOmniRack.ts` to accept polymorphic `MediaStream` and `HTMLAudioElement` inputs.
  - `[x]` **Audio Engine Arch**: Implement Custom `AudioWorklet` for uncompressed float recording (**primary path**) with native `MediaRecorder` retained strictly as an **Emergency Fallback** if the Worklet fails to boot.
  - `[x]` **Audio Engine Arch**: Implement **Chunked Disk-Write Strategy** using OPFS/IndexedDB.
  - `[x]` **Hardware Safety**: Implement `enumerateDevices()` Headphone check and 2-second **Soft-Start Gain Ramp**.
  - `[x]` **Hardware Safety**: Add manual **Force Mute Monitoring UI Toggle**.
  - `[x]` Implement **System WakeLock**: Use `navigator.wakeLock.request('screen')`.
  - `[x]` Implement **"State Persistence" Guard**: IndexedDB generic tracking to offer WAV reconstruction if the OS kills the process.
  - `[x]` Lock `globalCtxRef` as absolute singleton to eradicate Context Fragmentation.
  - `[x]` **Off-Thread Timing**: Implement `MetronomeWorker.ts` connected via `SharedArrayBuffer` sync-lock to the AudioWorklet.

- `[x]` **Phase 2: Professional Audio Engineering**
  - `[x]` Reroute `getUserMedia` microphone through OmniRack to fix the **"Wet" Recording Path**.
  - `[x]` **Engineering**: Implement Latency Engine mapping and the automated **"Loopback" Calibration Ping Utility**.
  - `[x]` **Engineering**: Implement **"Double-Buffer" Metadata Injection** (Pro-tier BWF `bext` chunk + Standard `RIFF INFO` chunk) in `ContentLibrary` and `SamplerStudio`.
  - `[x]` Implement **Lowest-Possible Latency "Direct Monitor" Toggle** in `MobileStudio.tsx`.

- `[ ]` **Phase 3: Performance, Intelligence & Identity Integration**
  - `[x]` **Performance**: Implement **Thermal Scaling and Emergency Audio Priority (Canvas Kill-Switch)**.
  - `[x]` Implement **FFT Confidence Scoring**: Signal-to-noise ratio warning checks.
  - `[x]` **Identity**: Implement **Automated Sovereign Watermarking** and Pre-validation Integrity check.
  - `[x]` **Identity**: Implement **Lyric Sync Calibration** (Word-for-word vs Line-for-line math).
  - `[x]` Replace `extractKey` mock with real K-S algorithms.
  - `[x]` Replace `extractBPM` mock with accurate onset detection algorithm.
  - `[x]` Implement **Dynamic Mastering "Recipes"**.
