# VISUALIZER INTEGRATION PATCH

## What We Built vs What's Integrated

### ✅ BUILT (Ready to Use):
- `UnifiedVisualizer.ts` - Complete 3D + lyric engine
- `UnifiedVisualizer.tsx` - React component
- `MetabolicVisualizer.ts` - Identity-forged 3D
- `KineticLyricSyncopator.ts` - 5 animation modes
- `DeterministicPRNG.ts` - Deterministic generation
- `ProofOfDeterminism.ts` - Copyright proofs

### ❌ NOT INTEGRATED:
- VisualizerStudio.tsx still uses old `VisualizerCanvas`
- New visualizers not wired up
- Proof system not connected

---

## INTEGRATION STEPS

### Step 1: Replace VisualizerCanvas with UnifiedVisualizer

**File:** `src/pages/VisualizerStudio.tsx`

**Line 9 - Change import:**
```typescript
// OLD:
import { VisualizerCanvas } from '../lib/VisualizerCanvas';

// NEW:
import { UnifiedVisualizerComponent } from '../components/UnifiedVisualizer';
import { generateVisualParameters } from '../lib/EnhancedProofSystem';
```

**Line 200+ - Replace canvas rendering:**

Find this section (around line 200):
```tsx
<VisualizerCanvas
  ref={canvasRef}
  sessionContext={sessionContext}
  visualizerType={visualizerType}
  aspectRatio={aspectRatio}
  activeStyle={activeStyle}
  audioData={audioData}
  isPlaying={isPlaying}
  logoUrl={logoUrl}
  currentTime={currentTime}
/>
```

Replace with:
```tsx
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
  mode={visualizerType === 'Matrix' ? 'metabolic' : 
        visualizerType === 'Cosmic' ? '3d-only' :
        activeLyrics ? 'unified' : '3d-only'}
  className="absolute inset-0"
/>
```

---

### Step 2: Update Visualizer Type Options

**File:** `src/pages/VisualizerStudio.tsx`

**Line 25 - Update visualizer types:**
```typescript
// OLD:
const [visualizerType, setVisualizerType] = useState<'Waveform' | 'Particles' | 'Spectrum' | 'Matrix' | 'Cosmic' | 'Glitch'>('Matrix');

// NEW:
const [visualizerType, setVisualizerType] = useState<'Matrix' | 'Cosmic' | 'Glitch' | 'Metabolic' | 'Quantum'>('Metabolic');
```

**Update the visualizer mode buttons:**
```tsx
{['Metabolic', 'Matrix', 'Cosmic', 'Glitch', 'Quantum'].map(mode => (
  <button
    key={mode}
    onClick={() => setVisualizerType(mode as any)}
    className={cn(
      "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
      visualizerType === mode
        ? "bg-amber-500 text-black"
        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
    )}
  >
    {mode}
  </button>
))}
```

---

### Step 3: Add Proof Display

**File:** `src/pages/VisualizerStudio.tsx`

**Add state for proof:**
```typescript
const [currentProof, setCurrentProof] = useState<any>(null);
```

**Add proof generation on track change:**
```typescript
useEffect(() => {
  if (!activeTrack) return;
  
  // Generate enhanced proof
  import('../lib/EnhancedProofSystem').then(({ generateEnhancedProof }) => {
    generateEnhancedProof(
      profile,
      activeTrack,
      {}, // rackParams (get from context if needed)
      activeLyrics?.content,
      activeLyrics?.syncLines
    ).then(proof => {
      setCurrentProof(proof);
      console.log('[VEKTR] Enhanced proof generated:', proof);
    });
  });
}, [activeTrack?.id]);
```

**Add proof display in UI:**
```tsx
{currentProof && (
  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 max-w-xs">
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

### Step 4: Update Export to Include Proof

**File:** `src/pages/VisualizerStudio.tsx`

**In the `handleExport` function, add proof to filename:**
```typescript
recorder.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  // Include proof hash in filename
  const proofSuffix = currentProof ? `_${currentProof.nfodHash.slice(0, 8)}` : '';
  a.href = url;
  a.download = `VEKTR_${activeTrack?.title || 'Visual'}${proofSuffix}.webm`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Log proof for verification
  if (currentProof) {
    console.log('[VEKTR] Exported with proof:', currentProof);
  }
};
```

---

## WHAT THIS GIVES YOU

### Before (Current):
- Generic visualizer canvas
- No identity forging
- No copyright proofs
- Random generation

### After (Integrated):
- ✅ Identity-forged 3D geometry
- ✅ Kinetic lyric syncopation
- ✅ 5 animation modes (Explode, Spiral, Quantum, Fractal, Wave)
- ✅ Deterministic generation (same identity = same visual)
- ✅ Copyright proofs (SHA-256 hashes)
- ✅ Proof display in UI
- ✅ Proof included in export filename

---

## TESTING

After integration:

1. **Navigate to Visualizer Studio**
2. **Select a track**
3. **Choose "Metabolic" mode**
4. **Press play**
5. **Should see:**
   - 3D identity-forged geometry
   - Audio-reactive motion
   - Copyright proof in bottom-left
   - Signature ring (visual DNA)
6. **Export video**
7. **Check filename** - should include proof hash

---

## VISUALIZER MODES EXPLAINED

### **Metabolic** (NEW - Identity Forged)
- Geometry derived from your user ID
- Colors from deterministic PRNG
- Motion based on track DNA
- Particle system with signature pattern
- **This is the groundbreaking one**

### **Matrix** (Enhanced)
- Wireframe geometry
- Digital aesthetic
- Sharp angular forms

### **Cosmic** (Enhanced)
- Smooth organic shapes
- Space vibes
- Flowing motion

### **Glitch** (Enhanced)
- Cyberpunk aesthetic
- Sharp edges
- Rapid transitions

### **Quantum** (NEW - Lyric Mode)
- Superposition collapse on beat
- Words exist in multiple states
- Collapses to single position on beat

---

## NEXT STEPS

1. **Apply this patch** (5 minutes)
2. **Test Metabolic mode** (see if 3D renders)
3. **Test with lyrics** (see if kinetic animations work)
4. **Export a video** (verify proof in filename)
5. **Check console** (should see proof generation logs)

---

**Want me to create the exact code changes with line numbers?**

