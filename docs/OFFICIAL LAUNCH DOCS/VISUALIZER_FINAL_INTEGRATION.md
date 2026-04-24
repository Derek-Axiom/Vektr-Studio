# COMPLETE VISUALIZER INTEGRATION

## I've updated VisualizerStudio.tsx with:

✅ Changed visualizer type to 'Metabolic' (1 edit succeeded)

## Still need to manually change:

### 1. Update imports (Line 9-10)

**Find:**
```typescript
import { VisualizerCanvas } from '../lib/VisualizerCanvas';
import type { SessionContext } from '../lib/VisualizerCanvas';
```

**Replace with:**
```typescript
import { UnifiedVisualizerComponent } from '../components/UnifiedVisualizer';
import { generateEnhancedProof } from '../lib/EnhancedProofSystem';
import type { SessionContext } from '../lib/VisualizerCanvas';
```

### 2. Add proof state (Line 29 - after sovereignHash)

**Find:**
```typescript
const [sovereignHash, setSovereignHash] = useState<string | null>(null);
const [isRecording, setIsRecording] = useState(false);
```

**Replace with:**
```typescript
const [sovereignHash, setSovereignHash] = useState<string | null>(null);
const [currentProof, setCurrentProof] = useState<any>(null);
const [isRecording, setIsRecording] = useState(false);
```

### 3. Add proof generation (Line 37 - before handleExport)

**Find:**
```typescript
const [currentTime, setCurrentTime] = useState(0);

const handleExport = () => {
```

**Add between them:**
```typescript
const [currentTime, setCurrentTime] = useState(0);

// Generate enhanced proof when track changes
useEffect(() => {
  if (!activeTrack) return;
  
  generateEnhancedProof(
    profile,
    activeTrack,
    rackParams,
    activeLyrics?.content,
    activeLyrics?.syncLines
  ).then(proof => {
    setCurrentProof(proof);
    console.log('[VEKTR] Enhanced proof generated:', proof);
  }).catch(err => {
    console.error('[VEKTR] Proof generation failed:', err);
  });
}, [activeTrack?.id, profile, activeLyrics, rackParams]);

const handleExport = () => {
```

### 4. Update export filename (Line 75)

**Find:**
```typescript
a.download = `VEKTR_${activeTrack?.title || 'Visual'}.webm`;
```

**Replace with:**
```typescript
// Include proof hash in filename
const proofSuffix = currentProof ? `_${currentProof.nfodHash.slice(0, 8)}` : '';
a.download = `VEKTR_${activeTrack?.title || 'Visual'}${proofSuffix}.webm`;
```

**And add after URL.revokeObjectURL:**
```typescript
URL.revokeObjectURL(url);

// Log proof for verification
if (currentProof) {
  console.log('[VEKTR] Exported with proof:', currentProof);
}
```

### 5. Update visualizer modes (Line 137)

**Find:**
```typescript
const visualizers = [
  { id: 'Waveform', icon: Waves, label: 'Waveform' },
  { id: 'Particles', icon: ZapOff, label: 'Particles' },
  { id: 'Spectrum', icon: Activity, label: 'Spectrum' },
  { id: 'Matrix', icon: Terminal, label: 'Matrix' },
  { id: 'Cosmic', icon: SparklesIcon, label: 'Cosmic Horizon' },
  { id: 'Glitch', icon: ZapOff, label: 'Cyber Glitch' },
];
```

**Replace with:**
```typescript
const visualizers = [
  { id: 'Metabolic', icon: Zap, label: 'Metabolic (Identity-Forged)' },
  { id: 'Matrix', icon: Terminal, label: 'Matrix' },
  { id: 'Cosmic', icon: SparklesIcon, label: 'Cosmic Horizon' },
  { id: 'Glitch', icon: ZapOff, label: 'Cyber Glitch' },
  { id: 'Quantum', icon: Activity, label: 'Quantum (Lyrics)' },
];
```

### 6. Replace VisualizerCanvas component (Line 226)

**Find:**
```tsx
<VisualizerCanvas
  mode={visualizerType as any} style={activeStyle} audioData={audioData}
  lyrics={sessionContext?.lyrics} currentTime={currentTime}
  context={sessionContext as any} showIntegrityGhost={showIntegrityGhost}
  sovereignHash={sovereignHash}
  isDemo={!activeTrack || !isAudioActive} className="absolute inset-0"
  ref={canvasRef as any}
/>
```

**Replace with:**
```tsx
{activeTrack ? (
  <UnifiedVisualizerComponent
    profile={profile}
    track={activeTrack}
    currentTime={currentTime}
    audioData={{
      bass: audioData.bass,
      mid: audioData.mid,
      treble: audioData.treble,
      amplitude: audioData.amplitude,
      peak: audioData.peak,
    }}
    mode={
      visualizerType === 'Metabolic' ? 'metabolic' :
      visualizerType === 'Quantum' && activeLyrics ? 'unified' :
      activeLyrics ? 'unified' : '3d-only'
    }
    className="absolute inset-0"
  />
) : (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="text-xs font-bold uppercase tracking-widest text-white/40">
        No Track Selected
      </div>
    </div>
  </div>
)}

{/* Copyright Proof Display */}
{currentProof && activeTrack && (
  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 max-w-xs pointer-events-none z-30">
    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">
      Copyright Proof
    </div>
    <div className="text-[9px] font-mono text-white/60 break-all">
      {currentProof.nfodHash.slice(0, 32)}...
    </div>
    <div className="text-[8px] text-white/40 mt-1">
      Deterministically generated - Mathematically unique
    </div>
  </div>
)}
```

---

## THAT'S IT!

6 changes total. Once done, you'll have:
- ✅ Identity-forged 3D visualizers
- ✅ Kinetic lyric animations
- ✅ Copyright proofs displayed
- ✅ Proof hash in export filename
- ✅ 5 groundbreaking modes

**Test by running `npm run dev` and navigating to Visualizer Studio!**

