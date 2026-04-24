# VEKTR VAULT - Complete Implementation Roadmap

## 🎯 Mission
Integrate TheREV's deterministic mathematics with VEKTR's music production workflow to create copyright-proof, identity-forged visuals.

## 📊 Current System Status

### ✅ Core Systems (Ready)
- **ART_CanvasHasher** - NFOD proof-of-creation (SHA-256 + bitwise hash)
- **DeterministicPRNG** - xoshiro256** algorithm (ported from TheREV)
- **IngestEngine** - Audio analysis (BPM, key, onsets, energy)
- **ProfileContext** - Global state + IndexedDB persistence
- **OmniRack** - 29-parameter DSP chain
- **Storage Layer** - IndexedDB with analysis data
- **Audio Context Singleton** - Shared AudioContext management

### 🔧 Integration Tasks

#### Phase 1: Transcription (30 min)
**Status:** Import added, needs pipeline integration

**Files:**
- `src/lib/TranscriptionEngine.ts` ✅ (ready)
- `src/lib/ProfileContext.tsx` ⚠️ (needs edit)
- `src/pages/LyricBook.tsx` ✅ (ready to display)

**What it does:**
- Auto-transcribes vocals on upload (Whisper API + browser fallback)
- Saves transcription to LyricBook automatically
- Provides word-level timestamps for sync

**Integration:**
```typescript
// In ProfileContext.tsx uploadMedia function:
// Add transcribeAudioSmart to Promise.all with processIngestion
// Save result to lyricBooks state
```

**Test:**
1. Upload audio with vocals
2. Check LyricBook for auto-populated lyrics
3. Verify sync calibration works with onsets

---

#### Phase 2: Metabolic Visualizer (20 min)
**Status:** Engine built, needs component integration

**Files:**
- `src/lib/MetabolicVisualizer.ts` ✅ (ready)
- `src/components/MetabolicVisualizer.tsx` ✅ (ready)
- `src/pages/VisualizerStudio.tsx` ⚠️ (needs import + swap)

**What it does:**
- Deterministic 3D visual generation from identity data
- Mathematical signature (NFOD root hash)
- Audio-reactive (bass/mid/treble control)
- Copyright-proof (unreproducible without session context)

**Integration:**
```typescript
// In VisualizerStudio.tsx:
// 1. Import MetabolicVisualizer component
// 2. Replace VisualizerCanvas with MetabolicVisualizer
// 3. Pass: profile, track, currentTime, audioData, rackParams
// 4. Add proof display in UI
```

**Test:**
1. Select a track
2. Switch to "Metabolic" visualizer mode
3. Verify 3D geometry renders
4. Check proof hash in bottom-left corner
5. Export video - filename should include proof hash

---

#### Phase 3: Kinetic Lyric Video (15 min)
**Status:** Engine built, needs VisualizerStudio integration

**Files:**
- `src/lib/KineticLyricSyncopator.ts` ✅ (ready)
- `src/lib/KineticLyricVideo.ts` ✅ (ready)
- `src/pages/VisualizerStudio.tsx` ⚠️ (needs mode + export)

**What it does:**
- Time-synced word animations (6 presets)
- Rhythm-locked to BPM
- Video export with audio
- Customizable colors, fonts, sizes

**Integration:**
```typescript
// In VisualizerStudio.tsx:
// 1. Add "Kinetic Lyrics" mode to visualizer types
// 2. When mode selected + lyrics exist:
//    - Use KineticLyricRenderer instead of 3D
//    - Render words with sync timing
// 3. Export includes audio track
```

**Test:**
1. Select track with transcribed lyrics
2. Switch to "Kinetic Lyrics" mode
3. Press play - words should animate to beat
4. Export video - should include audio + lyrics

---

#### Phase 4: Sampler Intelligence (15 min)
**Status:** Engine built, needs upload pipeline integration

**Files:**
- `src/lib/SamplerIntelligence.ts` ✅ (ready)
- `src/lib/ProfileContext.tsx` ⚠️ (needs integration)
- `src/pages/SamplerStudio.tsx` ✅ (ready to display)

**What it does:**
- Auto-detects sample type (one-shot, loop, stem, track)
- Classifies stems (drums, bass, vocals, melody, FX)
- Frequency analysis (low/mid/high distribution)
- Transient detection (percussion identification)
- Energy profiling (32-segment timeline)

**Integration:**
```typescript
// In ProfileContext.tsx uploadMedia:
// 1. Call categorizeSample(file) for audio files
// 2. Update MediaItem with category + classification
// 3. Display in SamplerStudio with auto-tags
```

**Test:**
1. Upload a loop (< 8 seconds)
2. Check SamplerStudio - should show "Loop" classification
3. Upload a stem (single instrument)
4. Check classification (drums/bass/vocals/etc)
5. Verify frequency analysis displays

---

#### Phase 5: Quote Card Generator (10 min)
**Status:** Engine built, needs LyricBook integration

**Files:**
- `src/lib/QuoteCardGenerator.ts` ✅ (ready)
- `src/pages/LyricBook.tsx` ⚠️ (needs button + handler)

**What it does:**
- Generates 1080x1080px PNG images
- 4 built-in styles (Minimal, Bold, Artistic, Modern)
- Artist branding with logo
- One-click download

**Integration:**
```typescript
// In LyricBook.tsx:
// 1. Add "Download Quote Card" button
// 2. On click: downloadQuoteCard(selectedText, style, profile)
// 3. Browser downloads PNG
```

**Test:**
1. Select text in LyricBook
2. Click "Download Quote Card"
3. Choose style
4. PNG downloads with artist branding

---

#### Phase 6: Metronome Popup (10 min)
**Status:** Component built, needs MobileStudio integration

**Files:**
- `src/components/MetronomePopup.tsx` ✅ (ready)
- `src/pages/MobileStudio.tsx` ⚠️ (needs import + state)

**What it does:**
- Draggable floating overlay
- Worker-based timing (drift-free)
- 40-240 BPM range
- Quick presets
- Visual beat indicator

**Integration:**
```typescript
// In MobileStudio.tsx:
// 1. Import MetronomePopup
// 2. Add state: [showMetronome, setShowMetronome]
// 3. Add button to toggle popup
// 4. Render <MetronomePopup /> when visible
```

**Test:**
1. Open Mobile Studio
2. Click metronome button
3. Popup appears and is draggable
4. Adjust BPM - should update in real-time
5. Click preset - should snap to BPM

---

#### Phase 7: Vocal Presets (5 min)
**Status:** Specs defined, needs MobileStudio UI

**Files:**
- `src/pages/MobileStudio.tsx` ⚠️ (needs preset buttons)

**Presets:**
```
VEKTR Standard:  Bass 8, Mids 5, Treble 6, Noise -1, Boost +1
Lyrical:         Bass 7, Mids 5, Treble 4, Noise -1, Boost 0
Bass Boost:      Bass 9, Mids 6, Treble 7, Noise -2, Boost +2
Punchy:          Bass 8, Mids 5, Treble 7, Noise -3, Boost +2
Natural:         Bass 6, Mids 3, Treble 4, Noise -1, Boost +2
```

**Integration:**
```typescript
// In MobileStudio.tsx:
// 1. Add preset buttons in UI
// 2. On click: apply preset values to DSP sliders
// 3. Update rackParams
```

**Test:**
1. Open Mobile Studio
2. Click "VEKTR Standard" preset
3. Sliders should snap to values
4. Record - should sound with preset applied

---

## 🚀 Implementation Order

### Day 1: Core Features (1 hour)
1. ✅ Transcription integration (30 min)
2. ✅ Metabolic visualizer swap (20 min)
3. ✅ Metronome popup (10 min)

### Day 2: Enhanced Features (45 min)
1. ✅ Kinetic lyric video (15 min)
2. ✅ Sampler intelligence (15 min)
3. ✅ Quote cards (10 min)
4. ✅ Vocal presets (5 min)

### Day 3: Polish & Testing (30 min)
1. Status indicators
2. Error handling
3. End-to-end testing
4. Performance optimization

---

## 📋 Detailed Integration Steps

### Step 1: Transcription Integration

**File:** `src/lib/ProfileContext.tsx`

**Line 9:** Add import
```typescript
import { transcribeAudioSmart } from './TranscriptionEngine';
```

**Line 394:** Update ingest pipeline
```typescript
// OLD:
processIngestion(file, id)
  .then((result) => {
    // ...
  })

// NEW:
Promise.all([
  processIngestion(file, id),
  transcribeAudioSmart(file).catch(() => null)
])
  .then(([analysisResult, transcriptionResult]) => {
    // Save transcription to lyric book
    if (transcriptionResult?.text) {
      const lyricBook: LyricBook = {
        id: `lyrics-${id}`,
        trackId: id,
        title: `${title} - Lyrics`,
        content: transcriptionResult.text,
        updatedAt: Date.now(),
      };
      setLyricBooks(prev => {
        const existing = prev.find(b => b.trackId === id);
        return existing 
          ? prev.map(b => b.trackId === id ? lyricBook : b) 
          : [lyricBook, ...prev];
      });
    }
    // ... rest of analysis
  })
```

**Environment:** Add to `.env`
```
VITE_OPENAI_API_KEY=sk-...
```

---

### Step 2: Metabolic Visualizer Integration

**File:** `src/pages/VisualizerStudio.tsx`

**Line 10:** Add import
```typescript
import { MetabolicVisualizer } from '../components/MetabolicVisualizer';
```

**Line 226:** Replace canvas
```typescript
// OLD:
<VisualizerCanvas
  mode={visualizerType as any}
  // ... other props
/>

// NEW:
{activeTrack ? (
  <MetabolicVisualizer
    profile={profile}
    track={activeTrack}
    currentTime={currentTime}
    audioData={audioData}
    rackParams={rackParams}
    className="absolute inset-0"
  />
) : (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center">
      <div className="text-xs font-bold uppercase tracking-widest text-white/40">
        No Track Selected
      </div>
    </div>
  </div>
)}

{/* Copyright Proof Display */}
{sovereignHash && activeTrack && (
  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 max-w-xs pointer-events-none z-30">
    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">
      Copyright Proof
    </div>
    <div className="text-[9px] font-mono text-white/60 break-all">
      {sovereignHash.slice(0, 32)}...
    </div>
    <div className="text-[8px] text-white/40 mt-1">
      Deterministically generated - Mathematically unique
    </div>
  </div>
)}
```

---

### Step 3: Kinetic Lyric Video Integration

**File:** `src/pages/VisualizerStudio.tsx`

**Add mode option:**
```typescript
// Add to visualizer types
const visualizers = [
  { id: 'Metabolic', label: 'Metabolic (Identity-Forged)' },
  { id: 'Kinetic Lyrics', label: 'Kinetic Lyrics' },
  // ... others
];
```

**Add rendering logic:**
```typescript
{visualizerType === 'Kinetic Lyrics' && activeLyrics ? (
  <KineticLyricRenderer
    lyrics={activeLyrics.syncLines || []}
    currentTime={currentTime}
    audioData={audioData}
    className="absolute inset-0"
  />
) : (
  // Metabolic or other visualizer
)}
```

---

### Step 4: Sampler Intelligence Integration

**File:** `src/lib/ProfileContext.tsx`

**Add import:**
```typescript
import { categorizeSample } from './SamplerIntelligence';
```

**In uploadMedia function:**
```typescript
// After processIngestion
if (type === 'audio') {
  categorizeSample(file)
    .then(classification => {
      setVault(prev => prev.map(item =>
        item.id === id
          ? {
              ...item,
              sampleType: classification.type,
              sampleClass: classification.class,
              frequency: classification.frequency,
            }
          : item
      ));
    })
    .catch(() => {});
}
```

---

### Step 5: Quote Card Integration

**File:** `src/pages/LyricBook.tsx`

**Add import:**
```typescript
import { downloadQuoteCard } from '../lib/QuoteCardGenerator';
```

**Add button:**
```typescript
<button
  onClick={() => {
    if (!selectedText) return;
    downloadQuoteCard(selectedText, 'Minimal', profile);
  }}
  className="px-4 py-2 bg-amber-500 text-black rounded-lg font-bold"
>
  Download Quote Card
</button>
```

---

### Step 6: Metronome Integration

**File:** `src/pages/MobileStudio.tsx`

**Add import:**
```typescript
import { MetronomePopup } from '../components/MetronomePopup';
```

**Add state:**
```typescript
const [showMetronome, setShowMetronome] = useState(false);
```

**Add button:**
```typescript
<button
  onClick={() => setShowMetronome(!showMetronome)}
  className="px-4 py-2 bg-white/10 rounded-lg"
>
  🎵 Metronome
</button>
```

**Render popup:**
```typescript
{showMetronome && (
  <MetronomePopup
    onClose={() => setShowMetronome(false)}
    defaultBPM={activeTrack?.bpm || 120}
  />
)}
```

---

### Step 7: Vocal Presets

**File:** `src/pages/MobileStudio.tsx`

**Add presets:**
```typescript
const VOCAL_PRESETS = [
  {
    name: 'VEKTR Standard',
    params: { bass: 8, mids: 5, treble: 6, noiseReduction: 1, boost: 1 }
  },
  {
    name: 'Lyrical',
    params: { bass: 7, mids: 5, treble: 4, noiseReduction: 1, boost: 0 }
  },
  // ... others
];
```

**Add buttons:**
```typescript
{VOCAL_PRESETS.map(preset => (
  <button
    key={preset.name}
    onClick={() => applyPreset(preset.params)}
    className="px-3 py-1 bg-white/10 rounded text-xs"
  >
    {preset.name}
  </button>
))}
```

---

## ✅ Testing Checklist

### Transcription
- [ ] Upload audio with vocals
- [ ] Lyrics appear in LyricBook
- [ ] Sync calibration works
- [ ] SRT export works

### Metabolic Visualizer
- [ ] 3D geometry renders
- [ ] Audio-reactive (bass/mid/treble)
- [ ] Proof hash displays
- [ ] Export includes proof in filename

### Kinetic Lyric Video
- [ ] Words animate to beat
- [ ] All 6 animation modes work
- [ ] Video exports with audio
- [ ] Timing is accurate

### Sampler Intelligence
- [ ] Loops detected correctly
- [ ] Stems classified (drums/bass/vocals)
- [ ] Frequency analysis displays
- [ ] Energy profile shows

### Quote Cards
- [ ] Download button works
- [ ] PNG generates correctly
- [ ] Artist branding displays
- [ ] All 4 styles work

### Metronome
- [ ] Popup appears/disappears
- [ ] Draggable
- [ ] BPM adjusts
- [ ] Presets snap to BPM

### Vocal Presets
- [ ] Presets apply to sliders
- [ ] DSP parameters update
- [ ] Recording uses preset

---

## 🎯 Success Criteria

✅ **Transcription:** Auto-transcribe on upload, lyrics in LyricBook
✅ **Metabolic Visualizer:** Identity-forged 3D, copyright-proof
✅ **Kinetic Lyrics:** Time-synced word animations
✅ **Sampler:** Auto-classify loops/stems
✅ **Quote Cards:** One-click social media graphics
✅ **Metronome:** Floating, draggable, drift-free
✅ **Presets:** One-click vocal EQ

---

## 📞 Support

If any integration fails:
1. Check console for errors
2. Verify imports are correct
3. Check environment variables (.env)
4. Review file paths
5. Test with simple audio first

---

**Ready to implement? Start with Phase 1 (Transcription) and work through in order.**

