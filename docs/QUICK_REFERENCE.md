# VEKTR VAULT - Quick Reference Card

## 🚀 Start Here

```
1. Read START_HERE.md (5 min)
2. Setup .env with OpenAI API key (2 min)
3. Run npm run dev (1 min)
4. Follow IMPLEMENTATION_CHECKLIST.md (2 hours)
```

---

## 📋 7 Phases at a Glance

| Phase | Feature | File | Time | Status |
|-------|---------|------|------|--------|
| 1 | Transcription | ProfileContext.tsx | 30m | ⏳ |
| 2 | Metabolic Visualizer | VisualizerStudio.tsx | 20m | ⏳ |
| 3 | Kinetic Lyrics | VisualizerStudio.tsx | 15m | ⏳ |
| 4 | Sampler Intelligence | ProfileContext.tsx | 15m | ⏳ |
| 5 | Quote Cards | LyricBook.tsx | 10m | ⏳ |
| 6 | Metronome | MobileStudio.tsx | 10m | ⏳ |
| 7 | Vocal Presets | MobileStudio.tsx | 5m | ⏳ |

---

## 🔑 Key Concepts

### Deterministic Generation
```
Same User + Same Track + Same DSP = Same Visual (Forever)
Different Session Timestamp = Different Visual
```

### Copyright Proof
```
NFOD Root Hash = SHA-256(User + Track + Timestamp + DSP)
Proof = Input Hash + Output Hash + PRNG State
Verification = Regenerate with same inputs, compare hashes
```

### Audio Reactivity
```
Bass → Scale, Pulse
Mid → Color, Intensity
Treble → Glow, Brightness
Peak → Signature Flash
```

---

## 📁 Files to Modify

```
src/lib/ProfileContext.tsx
├── Line 9: Add import (transcription)
└── Line 394: Update ingest pipeline (transcription + sampler)

src/pages/VisualizerStudio.tsx
├── Line 10: Add import (metabolic visualizer)
├── Line 226: Replace canvas (metabolic)
└── Add: Kinetic lyrics mode

src/pages/LyricBook.tsx
└── Add: Quote card download button

src/pages/MobileStudio.tsx
├── Add: Metronome popup
└── Add: Vocal presets
```

---

## 🧪 Testing Quick Checks

### Transcription ✓
```
Upload audio → LyricBook → Lyrics appear
```

### Metabolic Visualizer ✓
```
Select track → Visualizer → "Metabolic" mode → 3D renders
```

### Kinetic Lyrics ✓
```
Select lyrics → Visualizer → "Kinetic Lyrics" → Words animate
```

### Sampler ✓
```
Upload loop → Sampler → "Loop" classification
```

### Quote Cards ✓
```
Select text → LyricBook → "Download Quote Card" → PNG downloads
```

### Metronome ✓
```
Mobile Studio → Click metronome → Popup appears
```

### Vocal Presets ✓
```
Mobile Studio → Click preset → Sliders snap
```

---

## 🛠️ Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript
npx tsc --noEmit
```

---

## 📚 Documentation Map

```
START_HERE.md
  ↓ (Read first)
VEKTR_IMPLEMENTATION_ROADMAP.md
  ↓ (Detailed steps)
IMPLEMENTATION_CHECKLIST.md
  ↓ (Follow this)
SYSTEM_ARCHITECTURE.md
  ↓ (Reference)
INTEGRATION_PATCH_TRANSCRIPTION.md
  ↓ (Example patch)
READY_TO_BUILD.md
  ↓ (Summary)
IMPLEMENTATION_COMPLETE.md
  ↓ (Overview)
QUICK_REFERENCE.md (this file)
```

---

## 🔍 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Transcription fails | Check `.env` has API key |
| Visualizer black | Check WebGL support |
| Lyrics not syncing | Verify onsets detected |
| Quote cards fail | Check canvas API |
| Metronome missing | Check import + state |
| Presets not working | Check rackParams update |

---

## 💾 Environment Setup

```bash
# Copy template
cp .env.example .env

# Add your key
VITE_OPENAI_API_KEY=sk-...
```

---

## 🎯 Success Criteria

✅ All 7 features integrated
✅ No console errors
✅ 60fps visualizer
✅ All tests passing
✅ Ready to deploy

---

## 📞 Need Help?

1. Check console for errors
2. Read relevant documentation
3. Check IMPLEMENTATION_CHECKLIST.md
4. Review SYSTEM_ARCHITECTURE.md
5. Check source code comments

---

## ⏱️ Time Estimate

```
Reading docs:        15 min
Setup:               5 min
Phase 1-7:          100 min
Testing:            30 min
─────────────────────────
Total:             ~2.5 hours
```

---

## 🚀 Ready?

1. Open `START_HERE.md`
2. Follow the roadmap
3. Use `IMPLEMENTATION_CHECKLIST.md`
4. Test each phase
5. Deploy when done

---

## 💡 Remember

- Same inputs = Same output (deterministic)
- Every visual is unique to your identity
- Every creation is copyright-proof
- No AI involved - pure mathematics
- You own all your data

---

**Let's build something legendary.** 🚀
