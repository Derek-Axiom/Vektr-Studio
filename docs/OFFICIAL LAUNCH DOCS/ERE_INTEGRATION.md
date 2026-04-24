# ERE Integration - Lightweight & Crash-Proof

## What Was Extracted

From the Euclidean Recursion Engine, I extracted **only** the CreativeCanvas 3D renderer and stripped it down to essentials:

### ✅ Kept:
- THREE.js procedural geometry generation
- Deterministic seeding from track identity
- Audio-reactive vertex manipulation
- Performance monitoring & adaptive quality
- Mouse interaction

### ❌ Removed:
- DreamEngine / Gemini AI integration
- SovereignIngestor (cache metabolism)
- NeuralPathway event bus (too heavy for mobile)
- PersistenceVault (you already have IndexedDB)
- All external API calls

## File Size Impact

**Original ERE:** ~500KB (full system)
**VEKTR Integration:** ~15KB (just the canvas)

**Dependencies:**
- THREE.js (already in your project via CDN or npm)
- No new dependencies added

## Performance Safeguards

1. **Adaptive Quality:**
   - Monitors FPS every second
   - Drops to low quality if FPS < 30
   - Reduces pixel ratio automatically

2. **Mobile Optimization:**
   - Lower geometry detail on mobile
   - Reduced particle count
   - Conditional antialiasing

3. **Memory Management:**
   - Proper cleanup on unmount
   - Geometry/material disposal
   - Animation frame cancellation

## Integration Steps

### 1. Install THREE.js (if not already installed)

```bash
npm install three
```

### 2. Add to VisualizerStudio

**File:** `src/pages/VisualizerStudio.tsx`

**Add import:**
```typescript
import { VektrCanvas } from '../components/VektrCanvas';
```

**Replace the existing VisualizerCanvas with:**
```tsx
<VektrCanvas
  config={{
    trackId: activeTrack.id,
    bpm: activeTrack.bpm || 120,
    key: activeTrack.key || 'C',
    energy: activeTrack.analysisData?.energy || 0.5,
    complexity: 0.7, // 0-1
    wireframe: visualizerType === 'Matrix',
    colorPalette: ['#f59e0b', '#8b5cf6', '#06b6d4'], // Amber, Purple, Cyan
    bassResponse: 0.8,
    midResponse: 0.6,
    trebleResponse: 0.4,
  }}
  audioData={{
    bass: audioData.bass,
    mid: audioData.mid,
    treble: audioData.treble,
    amplitude: audioData.amplitude,
  }}
  className="absolute inset-0"
/>
```

### 3. Map Visualizer Types to Geometry

**Update the config based on visualizerType:**

```typescript
const getCanvasConfig = () => {
  const baseConfig = {
    trackId: activeTrack.id,
    bpm: activeTrack.bpm || 120,
    key: activeTrack.key || 'C',
    energy: activeTrack.analysisData?.energy || 0.5,
    bassResponse: 0.8,
    midResponse: 0.6,
    trebleResponse: 0.4,
  };
  
  switch (visualizerType) {
    case 'Matrix':
      return {
        ...baseConfig,
        complexity: 0.9,
        wireframe: true,
        colorPalette: ['#00ff00', '#00aa00'],
      };
    case 'Cosmic':
      return {
        ...baseConfig,
        complexity: 0.7,
        wireframe: false,
        colorPalette: ['#8b5cf6', '#ec4899', '#f59e0b'],
      };
    case 'Glitch':
      return {
        ...baseConfig,
        complexity: 0.5,
        wireframe: true,
        colorPalette: ['#ff0000', '#00ff00', '#0000ff'],
      };
    default:
      return {
        ...baseConfig,
        complexity: 0.6,
        wireframe: false,
        colorPalette: ['#f59e0b', '#8b5cf6'],
      };
  }
};
```

## Testing Checklist

- [ ] Upload track with BPM/key metadata
- [ ] Open Visualizer Studio
- [ ] Verify 3D geometry appears
- [ ] Play audio - verify bass affects scale
- [ ] Move mouse - verify rotation follows
- [ ] Switch visualizer types - verify geometry changes
- [ ] Check FPS counter in console
- [ ] Test on mobile (should auto-reduce quality)

## Crash Prevention

**If THREE.js fails to load:**
- Canvas shows fallback message
- No app crash
- Console warning only

**If FPS drops below 20:**
- Automatically switches to 2D fallback
- Logs warning to console
- User can manually disable 3D in settings

**If memory leak detected:**
- Cleanup runs on component unmount
- All geometries/materials disposed
- Animation frames cancelled

## Known Limitations

1. **No particle system** - Removed for performance (can add back if needed)
2. **No network graph** - Not needed for music visualization
3. **No AI vibe generation** - Uses deterministic track metadata instead

## Next Steps

After integration:

1. **Test with "Artifact of Compression"**
2. **Verify no performance degradation**
3. **Add user controls** (complexity slider, color picker)
4. **Wire to export** (capture canvas frames for video)

## Rollback Plan

If integration causes issues:

1. Remove `VektrCanvas` import
2. Restore original `VisualizerCanvas`
3. Delete `src/lib/VektrAudioCanvas.ts`
4. Delete `src/components/VektrCanvas.tsx`

No other files affected - clean rollback.
