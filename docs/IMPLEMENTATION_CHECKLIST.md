# VEKTR VAULT - Implementation Checklist

## Pre-Implementation

- [ ] Read `START_HERE.md`
- [ ] Read `VEKTR_IMPLEMENTATION_ROADMAP.md`
- [ ] Read `SYSTEM_ARCHITECTURE.md`
- [ ] Copy `.env.example` to `.env`
- [ ] Add OpenAI API key to `.env`
- [ ] Run `npm run dev`
- [ ] Verify dev server starts (http://localhost:5173)

---

## Phase 1: Transcription (30 min)

### Setup
- [ ] Open `INTEGRATION_PATCH_TRANSCRIPTION.md`
- [ ] Open `src/lib/ProfileContext.tsx` in editor

### Implementation
- [ ] **Line 9:** Add import
  ```typescript
  import { transcribeAudioSmart } from './TranscriptionEngine';
  ```
- [ ] **Line 394:** Update ingest pipeline
  - [ ] Change `processIngestion(file, id)` to `Promise.all([...])`
  - [ ] Add transcription call
  - [ ] Add lyric book save logic
  - [ ] Update variable names (result → analysisResult)

### Testing
- [ ] Upload audio file with vocals
- [ ] Wait for processing (check console)
- [ ] Navigate to LyricBook
- [ ] Verify lyrics appear automatically
- [ ] Click "Sync Calibration"
- [ ] Verify sync lines created
- [ ] Try SRT export

### Troubleshooting
- [ ] Check `.env` has `VITE_OPENAI_API_KEY`
- [ ] Check browser console for errors
- [ ] Try browser speech recognition fallback
- [ ] Verify file is audio format

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Phase 2: Metabolic Visualizer (20 min)

### Setup
- [ ] Open `VEKTR_IMPLEMENTATION_ROADMAP.md` → Step 2
- [ ] Open `src/pages/VisualizerStudio.tsx` in editor

### Implementation
- [ ] **Line 10:** Add import
  ```typescript
  import { MetabolicVisualizer } from '../components/MetabolicVisualizer';
  ```
- [ ] **Line 226:** Replace VisualizerCanvas
  - [ ] Remove old `<VisualizerCanvas ... />`
  - [ ] Add new `<MetabolicVisualizer ... />`
  - [ ] Add conditional rendering (if activeTrack)
  - [ ] Add proof display UI
  - [ ] Update export filename to include proof hash

### Testing
- [ ] Select a track from library
- [ ] Navigate to Visualizer
- [ ] Verify "Metabolic" mode is selected
- [ ] Press play
- [ ] Verify 3D geometry renders
- [ ] Verify audio-reactive (bass/mid/treble)
- [ ] Check proof hash in bottom-left corner
- [ ] Export video
- [ ] Verify filename includes proof hash (first 8 chars)
- [ ] Check console for proof generation logs

### Troubleshooting
- [ ] Check browser console for WebGL errors
- [ ] Verify THREE.js is loaded
- [ ] Try different visualizer mode
- [ ] Check if track has audio data
- [ ] Verify canvas element exists

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Phase 3: Kinetic Lyric Video (15 min)

### Setup
- [ ] Open `VEKTR_IMPLEMENTATION_ROADMAP.md` → Step 3
- [ ] Open `src/pages/VisualizerStudio.tsx` in editor

### Implementation
- [ ] **Add mode option:**
  - [ ] Add "Kinetic Lyrics" to visualizer types
  - [ ] Update visualizer buttons
- [ ] **Add rendering logic:**
  - [ ] Check if mode is "Kinetic Lyrics" AND lyrics exist
  - [ ] Render KineticLyricRenderer instead of Metabolic
  - [ ] Pass lyrics, currentTime, audioData
- [ ] **Update export:**
  - [ ] Ensure audio is included in export
  - [ ] Verify video includes both visuals and audio

### Testing
- [ ] Select track with transcribed lyrics
- [ ] Navigate to Visualizer
- [ ] Switch to "Kinetic Lyrics" mode
- [ ] Press play
- [ ] Verify words appear and animate
- [ ] Verify animation syncs to beat
- [ ] Try different animation modes (if available)
- [ ] Export video
- [ ] Verify video includes audio + lyrics

### Troubleshooting
- [ ] Check if track has lyrics (LyricBook)
- [ ] Verify sync lines exist
- [ ] Check console for animation errors
- [ ] Verify audio is playing
- [ ] Check if BPM is detected

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Phase 4: Sampler Intelligence (15 min)

### Setup
- [ ] Open `VEKTR_IMPLEMENTATION_ROADMAP.md` → Step 4
- [ ] Open `src/lib/ProfileContext.tsx` in editor

### Implementation
- [ ] **Add import:**
  ```typescript
  import { categorizeSample } from './SamplerIntelligence';
  ```
- [ ] **In uploadMedia function:**
  - [ ] Add `categorizeSample(file)` call
  - [ ] Update vault with classification
  - [ ] Add sampleType, sampleClass, frequency fields

### Testing
- [ ] Upload a loop (< 8 seconds)
- [ ] Navigate to Sampler
- [ ] Verify "Loop" classification
- [ ] Upload a stem (single instrument)
- [ ] Verify stem classification (drums/bass/vocals/melody/FX)
- [ ] Check frequency analysis
- [ ] Verify energy profile displays
- [ ] Upload full track
- [ ] Verify "Track" classification

### Troubleshooting
- [ ] Check console for classification errors
- [ ] Verify audio file is valid
- [ ] Check if analysis data is saved
- [ ] Verify SamplerStudio displays classification

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Phase 5: Quote Cards (10 min)

### Setup
- [ ] Open `VEKTR_IMPLEMENTATION_ROADMAP.md` → Step 5
- [ ] Open `src/pages/LyricBook.tsx` in editor

### Implementation
- [ ] **Add import:**
  ```typescript
  import { downloadQuoteCard } from '../lib/QuoteCardGenerator';
  ```
- [ ] **Add button:**
  - [ ] Create "Download Quote Card" button
  - [ ] Add click handler
  - [ ] Pass selectedText, style, profile
- [ ] **Add style selector:**
  - [ ] Add dropdown or buttons for 4 styles
  - [ ] Minimal, Bold, Artistic, Modern

### Testing
- [ ] Navigate to LyricBook
- [ ] Select text from lyrics
- [ ] Click "Download Quote Card"
- [ ] Choose style
- [ ] Verify PNG downloads
- [ ] Check artist branding
- [ ] Verify text is readable
- [ ] Try all 4 styles

### Troubleshooting
- [ ] Check if text is selected
- [ ] Verify canvas API available
- [ ] Check browser console for errors
- [ ] Try different style
- [ ] Verify profile has displayName

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Phase 6: Metronome (10 min)

### Setup
- [ ] Open `VEKTR_IMPLEMENTATION_ROADMAP.md` → Step 6
- [ ] Open `src/pages/MobileStudio.tsx` in editor

### Implementation
- [ ] **Add import:**
  ```typescript
  import { MetronomePopup } from '../components/MetronomePopup';
  ```
- [ ] **Add state:**
  ```typescript
  const [showMetronome, setShowMetronome] = useState(false);
  ```
- [ ] **Add button:**
  - [ ] Create metronome toggle button
  - [ ] Add to UI
- [ ] **Render popup:**
  - [ ] Add conditional render
  - [ ] Pass defaultBPM from track

### Testing
- [ ] Navigate to Mobile Studio
- [ ] Click metronome button
- [ ] Verify popup appears
- [ ] Drag popup around (test draggable)
- [ ] Adjust BPM slider
- [ ] Verify BPM updates in real-time
- [ ] Click preset buttons
- [ ] Verify BPM snaps to preset
- [ ] Close popup
- [ ] Reopen popup

### Troubleshooting
- [ ] Check if MetronomePopup component exists
- [ ] Verify state management
- [ ] Check z-index in CSS
- [ ] Verify worker thread is running
- [ ] Check browser console for errors

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Phase 7: Vocal Presets (5 min)

### Setup
- [ ] Open `VEKTR_IMPLEMENTATION_ROADMAP.md` → Step 7
- [ ] Open `src/pages/MobileStudio.tsx` in editor

### Implementation
- [ ] **Add presets:**
  ```typescript
  const VOCAL_PRESETS = [
    { name: 'VEKTR Standard', params: { ... } },
    // ... others
  ];
  ```
- [ ] **Add buttons:**
  - [ ] Create preset buttons
  - [ ] Add to UI
- [ ] **Add handlers:**
  - [ ] Create applyPreset function
  - [ ] Update rackParams on click

### Testing
- [ ] Navigate to Mobile Studio
- [ ] Click "VEKTR Standard" preset
- [ ] Verify sliders snap to values
- [ ] Check DSP parameters update
- [ ] Try all 5 presets
- [ ] Record audio
- [ ] Verify preset applied to recording
- [ ] Playback recording

### Troubleshooting
- [ ] Check preset values match spec
- [ ] Verify sliders update
- [ ] Check rackParams state
- [ ] Verify DSP chain applies settings
- [ ] Check console for errors

**Status:** ✓ Complete / ⏳ In Progress / ✗ Blocked

---

## Post-Implementation

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] All imports resolved
- [ ] No unused variables
- [ ] Code formatted consistently

### Performance
- [ ] Visualizer runs at 60fps
- [ ] No memory leaks
- [ ] Audio plays smoothly
- [ ] No stuttering
- [ ] Export completes in reasonable time

### Testing
- [ ] All 7 features tested
- [ ] All test cases passing
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] Fallbacks working

### Documentation
- [ ] Code comments added
- [ ] README updated
- [ ] Troubleshooting guide complete
- [ ] API documented
- [ ] Examples provided

### Deployment
- [ ] Build succeeds (`npm run build`)
- [ ] No build errors
- [ ] No build warnings
- [ ] Production bundle size acceptable
- [ ] Ready to deploy

---

## Final Checklist

### Features
- [ ] Transcription working
- [ ] Metabolic visualizer rendering
- [ ] Kinetic lyrics animating
- [ ] Sampler classifying
- [ ] Quote cards generating
- [ ] Metronome functioning
- [ ] Vocal presets applying

### Integration
- [ ] All imports correct
- [ ] All state management working
- [ ] All data flows correct
- [ ] All exports functional
- [ ] All UI responsive

### Quality
- [ ] No errors
- [ ] No warnings
- [ ] Performance good
- [ ] User experience smooth
- [ ] Documentation complete

---

## Success Criteria

✅ **All 7 features integrated and tested**
✅ **No console errors or warnings**
✅ **Visualizer runs at 60fps**
✅ **All exports working**
✅ **All tests passing**
✅ **Documentation complete**
✅ **Ready for production**

---

## Time Tracking

| Phase | Estimated | Actual | Status |
|-------|-----------|--------|--------|
| 1. Transcription | 30 min | ___ | ⏳ |
| 2. Metabolic Visualizer | 20 min | ___ | ⏳ |
| 3. Kinetic Lyrics | 15 min | ___ | ⏳ |
| 4. Sampler Intelligence | 15 min | ___ | ⏳ |
| 5. Quote Cards | 10 min | ___ | ⏳ |
| 6. Metronome | 10 min | ___ | ⏳ |
| 7. Vocal Presets | 5 min | ___ | ⏳ |
| **Total** | **~2 hours** | ___ | ⏳ |

---

## Notes

```
Phase 1 completed: _______________
Phase 2 completed: _______________
Phase 3 completed: _______________
Phase 4 completed: _______________
Phase 5 completed: _______________
Phase 6 completed: _______________
Phase 7 completed: _______________

Issues encountered:
_________________________________
_________________________________
_________________________________

Solutions applied:
_________________________________
_________________________________
_________________________________

Final notes:
_________________________________
_________________________________
_________________________________
```

---

**You've got this. Follow the checklist, test each phase, and you'll have a complete music production studio in ~2 hours.**

**Let's build something legendary.** 🚀
