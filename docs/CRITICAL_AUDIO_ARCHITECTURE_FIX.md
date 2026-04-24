# CRITICAL FIX: Audio Architecture - OmniRack DSP Integration

## The Problem (Audit Confirmed)

**The OmniRack DSP chain is completely disconnected from the live microphone recording.**

Current flow:
```
Microphone → GainNode (1.5) → MediaRecorder (FLAT, NO DSP)
                           → AnalyserNode (for visualization only)
```

**The OmniRack is only connected to the global `<audio>` playback element, NOT the microphone.**

Result: When you record with MobileStudio, the DSP sliders have ZERO effect on the recording. The audio is saved completely flat.

---

## The Solution

### Phase 1: Refactor useOmniRack to Accept Polymorphic Sources

**File: `src/lib/useOmniRack.ts`**

The hook currently hard-binds to `HTMLAudioElement`. We need to make it accept:
- `MediaElementAudioSourceNode` (for playback)
- `MediaStreamAudioSourceNode` (for live microphone)
- `null` (for initialization)

**Key Changes:**

1. **Remove the hard-coded audio element requirement**
   ```typescript
   // OLD: Forces HTMLAudioElement
   const source = ctxRef.current.createMediaElementAudioSource(audioRef.current);
   
   // NEW: Accept any source type
   let source: AudioNode | null = null;
   if (sourceNode) {
     source = sourceNode;
   }
   ```

2. **Create a polymorphic source connector**
   ```typescript
   export function connectAudioSource(
     ctx: AudioContext,
     sourceType: 'element' | 'stream',
     source: HTMLAudioElement | MediaStream
   ): AudioNode {
     if (sourceType === 'element') {
       return ctx.createMediaElementAudioSource(source as HTMLAudioElement);
     } else {
       return ctx.createMediaStreamAudioSource(source as MediaStream);
     }
   }
   ```

3. **Expose the DSP chain output**
   ```typescript
   // Return the final output node so MobileStudio can capture it
   return {
     // ... existing returns
     dspChainOutput: compressorNode, // or whatever the final node is
     connectSource: (sourceNode: AudioNode) => {
       sourceNode.connect(gainNode);
     }
   };
   ```

---

### Phase 2: Wire MobileStudio Microphone into OmniRack

**File: `src/pages/MobileStudio.tsx`**

**Current broken code:**
```typescript
const requestMicrophone = async (useAEC: boolean) => {
  const stream = await navigator.mediaDevices.getUserMedia({...});
  streamRef.current = stream;
  connectStream(stream); // This does nothing useful
  drawWaveform();
};
```

**Fixed code:**
```typescript
const requestMicrophone = async (useAEC: boolean) => {
  const stream = await navigator.mediaDevices.getUserMedia({...});
  streamRef.current = stream;
  
  // ✅ CRITICAL: Connect microphone to OmniRack DSP chain
  const ctx = globalCtxRef.current;
  if (ctx && !micSourceRef.current) {
    micSourceRef.current = ctx.createMediaStreamAudioSource(stream);
    
    // Connect to OmniRack input
    micSourceRef.current.connect(omnirackInputNode);
    
    // Capture the processed output for recording
    const destination = ctx.createMediaStreamDestination();
    omnirackOutputNode.connect(destination);
    
    // Point MediaRecorder to the processed stream
    recordingStreamRef.current = destination.stream;
  }
  
  drawWaveform();
};
```

---

### Phase 3: Capture Processed Audio for Recording

**File: `src/pages/MobileStudio.tsx`**

**Current broken code:**
```typescript
const startRecording = async () => {
  const stream = streamRef.current; // Raw, unprocessed microphone
  const recorder = new MediaRecorder(stream);
  // Records FLAT audio with NO DSP
};
```

**Fixed code:**
```typescript
const startRecording = async () => {
  // Use the processed stream from OmniRack output
  const stream = recordingStreamRef.current || streamRef.current;
  
  if (!stream) {
    console.error('No audio stream available');
    return;
  }
  
  const recorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 128000
  });
  
  // ✅ Now records PROCESSED audio with full DSP applied
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunksRef.current.push(e.data);
  };
  
  recorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    setRecordedBlob(blob);
  };
  
  recorder.start();
};
```

---

### Phase 4: Fix Tuner and Metronome AudioContext Exhaustion

**File: `src/pages/MobileStudio.tsx`**

**Current broken code:**
```typescript
const startTuner = () => {
  tunerCtxRef.current = new window.AudioContext(); // ❌ Creates new context
  // ... tuner logic
};

const startMetronome = () => {
  const ctx = new window.AudioContext(); // ❌ Creates new context
  const osc = ctx.createOscillator();
  // ... metronome logic
};
```

**Fixed code:**
```typescript
const startTuner = () => {
  const ctx = globalCtxRef.current;
  if (!ctx) return;
  
  tunerCtxRef.current = ctx; // ✅ Reuse global context
  
  if (!tunerStreamRef.current) {
    tunerStreamRef.current = streamRef.current;
  }
  
  if (!tunerAnalyserRef.current) {
    tunerAnalyserRef.current = ctx.createAnalyser();
    tunerAnalyserRef.current.fftSize = 4096;
    
    // Connect microphone to tuner analyser
    const source = ctx.createMediaStreamAudioSource(tunerStreamRef.current);
    source.connect(tunerAnalyserRef.current);
  }
  
  setTunerActive(true);
  analyzePitch();
};

const startMetronome = () => {
  const ctx = globalCtxRef.current;
  if (!ctx) return;
  
  // ✅ Reuse global context
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.value = 1000;
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  osc.start();
  
  setMetroActive(true);
};
```

---

### Phase 5: Fix VektrLabContext FFT Visualization

**File: `src/lib/VektrLabContext.ts`**

**Current broken code:**
```typescript
// For the sake of zero-latency UX in this module context, we map to a mock heuristic...
const mockHistogram = {
  subBass: Math.random() * 100,
  bass: Math.random() * 100,
  // ... fake data
};
```

**Fixed code:**
```typescript
export function extractAudioIntelligence(audioBuffer: AudioBuffer) {
  const ctx = window.globalCtxRef?.current;
  const analyser = window.globalAnalyserRef?.current;
  
  if (!analyser) {
    console.warn('No global analyser available, using fallback');
    return getFallbackIntelligence();
  }
  
  // ✅ Real FFT analysis from global analyser
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  
  // Map frequency bins to musical ranges
  const nyquist = (ctx?.sampleRate || 44100) / 2;
  const binHz = nyquist / frequencyData.length;
  
  let subBass = 0, bass = 0, lowMid = 0, mid = 0, highMid = 0, treble = 0;
  
  for (let i = 0; i < frequencyData.length; i++) {
    const freq = i * binHz;
    const value = frequencyData[i];
    
    if (freq < 60) subBass += value;
    else if (freq < 250) bass += value;
    else if (freq < 500) lowMid += value;
    else if (freq < 2000) mid += value;
    else if (freq < 4000) highMid += value;
    else treble += value;
  }
  
  // Normalize
  const total = frequencyData.reduce((a, b) => a + b, 0);
  
  return {
    subBass: (subBass / total) * 100,
    bass: (bass / total) * 100,
    lowMid: (lowMid / total) * 100,
    mid: (mid / total) * 100,
    highMid: (highMid / total) * 100,
    treble: (treble / total) * 100,
  };
}
```

---

## Implementation Checklist

### Step 1: Refactor useOmniRack
- [ ] Remove hard-coded HTMLAudioElement requirement
- [ ] Create polymorphic source connector
- [ ] Expose DSP chain output node
- [ ] Export connectAudioSource function

### Step 2: Update MobileStudio
- [ ] Create micSourceRef for microphone source
- [ ] Create recordingStreamRef for processed output
- [ ] Connect microphone to OmniRack in requestMicrophone()
- [ ] Capture OmniRack output to MediaStreamDestination
- [ ] Point MediaRecorder to processed stream

### Step 3: Fix Tuner
- [ ] Reuse globalCtxRef instead of creating new context
- [ ] Connect microphone to tuner analyser
- [ ] Remove AudioContext exhaustion

### Step 4: Fix Metronome
- [ ] Reuse globalCtxRef instead of creating new context
- [ ] Connect oscillator to global destination
- [ ] Remove AudioContext exhaustion

### Step 5: Fix VektrLabContext
- [ ] Remove mock heuristic code
- [ ] Implement real FFT analysis
- [ ] Use global analyser node
- [ ] Return actual frequency data

---

## Testing After Fix

### Test 1: DSP Affects Recording
1. Open MobileStudio
2. Set Saturation to 100
3. Record audio
4. Play back recording
5. **Expected:** Audio is heavily distorted
6. **Verify:** ✅ DSP applied to recording

### Test 2: Compression Works
1. Set Compression to -60 dB
2. Record loud audio
3. Play back recording
4. **Expected:** Audio is heavily compressed
5. **Verify:** ✅ Compression applied to recording

### Test 3: Reverb Works
1. Set Reverb Mix to 100%
2. Record audio
3. Play back recording
4. **Expected:** Audio has heavy reverb tail
5. **Verify:** ✅ Reverb applied to recording

### Test 4: No AudioContext Exhaustion
1. Open MobileStudio
2. Toggle Tuner on/off 10 times
3. Toggle Metronome on/off 10 times
4. **Expected:** No errors, smooth operation
5. **Verify:** ✅ No AudioContext exhaustion

### Test 5: FFT Visualization Real
1. Open VektrLab
2. Play audio
3. Watch frequency visualization
4. **Expected:** Visualization matches audio content
5. **Verify:** ✅ Real FFT, not mock

---

## Critical Success Factors

✅ **OmniRack processes live microphone**
✅ **DSP settings affect recordings**
✅ **No AudioContext exhaustion**
✅ **Real FFT visualization**
✅ **Tuner works correctly**
✅ **Metronome works correctly**

---

## The Bottom Line

**Before this fix:** Recording with DSP is a lie. The audio is saved flat.

**After this fix:** Recording with DSP is real. Every slider affects the recording.

**This is non-negotiable. The system is broken without it.**
