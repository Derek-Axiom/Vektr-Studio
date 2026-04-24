# VEKTR STUDIO - Implementation Guide

## What's Been Built

### 1. Transcription Engine (`src/lib/TranscriptionEngine.ts`)
- **OpenAI Whisper API integration** for professional transcription
- **Fallback browser speech recognition** for offline use
- **Word-level timestamps** for precise lyric sync
- **Smart routing** - tries Whisper first, falls back to browser

**Setup Required:**
1. Create `.env` file in project root
2. Add: `VITE_OPENAI_API_KEY=sk-your-key-here`
3. Get key from: https://platform.openai.com/api-keys

### 2. Metronome Popup (`src/components/MetronomePopup.tsx`)
- **Draggable floating overlay** - works anywhere in Mobile Studio
- **Worker-based timing** - drift-free, immune to tab throttling
- **Visual beat indicator** - 4/4 time signature display
- **BPM presets** - 60, 80, 100, 120, 140, 160, 180
- **Smooth slider** - 40-240 BPM range

**Integration:**
```tsx
import { MetronomePopup } from '../components/MetronomePopup';

// In your component:
const [metronomeOpen, setMetronomeOpen] = useState(false);

// Add button to open:
<button onClick={() => setMetronomeOpen(true)}>Metronome</button>

// Add popup:
<MetronomePopup isOpen={metronomeOpen} onClose={() => setMetronomeOpen(false)} />
```

### 3. Quote Card Generator (`src/lib/QuoteCardGenerator.ts`)
- **High-quality PNG export** - 1080x1080px default
- **4 built-in styles** - Minimal, Bold, Artistic, Modern
- **Artist branding** - Logo overlay support
- **Social-ready** - Optimized for Instagram/Twitter/Facebook

**Usage:**
```tsx
import { downloadQuoteCard } from '../lib/QuoteCardGenerator';

await downloadQuoteCard({
  quote: "Your lyric text here",
  artist: "Artist Name",
  trackTitle: "Song Title",
  logoUrl: "https://...",
});
```

### 4. Transcription Integration (`src/lib/TranscriptionIntegration.ts`)
- **Type-safe helpers** for accessing transcription data
- **Automatic processing** hook for upload pipeline
- **Null-safe getters** for transcription text and segments

## What Needs Integration

### Immediate Tasks:

#### 1. Add Transcription to Upload Pipeline
**File:** `src/lib/ProfileContext.tsx`
**Location:** Line ~360 (INGEST PIPELINE section)

**Current code:**
```tsx
if (type === 'audio') {
  processIngestion(file, id)
    .then((result) => {
      // ... existing code
    });
}
```

**Replace with:**
```tsx
if (type === 'audio') {
  Promise.all([
    processIngestion(file, id),
    processTranscription(file), // NEW
  ])
    .then(([result, transcriptionData]) => {
      const autoTags = buildAutoTags(result);
      saveAnalysisData(id, result).catch(() => {});
      setVault(prev => prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'ready' as const,
              bpm: result.bpm,
              key: result.key,
              duration: result.duration,
              tags: autoTags,
              analysisData: result,
              ...transcriptionData, // NEW - adds transcription & transcriptionSegments
            }
          : item
      ));
    });
}
```

**Add import:**
```tsx
import { processTranscription } from './TranscriptionIntegration';
```

#### 2. Add Metronome Button to Mobile Studio
**File:** `src/pages/MobileStudio.tsx`
**Location:** Top of the page, near the header

**Add state:**
```tsx
const [metronomeOpen, setMetronomeOpen] = useState(false);
```

**Add button in header:**
```tsx
<button
  onClick={() => setMetronomeOpen(true)}
  className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/20"
>
  <Activity className="w-4 h-4 inline mr-2" />
  Metronome
</button>
```

**Add popup at end of component:**
```tsx
<MetronomePopup isOpen={metronomeOpen} onClose={() => setMetronomeOpen(false)} />
```

**Add import:**
```tsx
import { MetronomePopup } from '../components/MetronomePopup';
```

#### 3. Update LyricBook with Transcription
**File:** `src/pages/LyricBook.tsx`

**Add imports:**
```tsx
import { getTranscription } from '../lib/TranscriptionIntegration';
import { downloadQuoteCard } from '../lib/QuoteCardGenerator';
```

**After `const activeTrack = ...` line:**
```tsx
const autoTranscription = activeTrack ? getTranscription(activeTrack) : null;
```

**Add "Load Transcription" button if transcription exists:**
```tsx
{autoTranscription && !localContent && (
  <button
    onClick={() => setLocalContent(autoTranscription)}
    className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-emerald-500"
  >
    <Sparkles className="w-4 h-4 inline mr-2" />
    Load Auto-Transcription
  </button>
)}
```

**Add Quote Card download to selection handler:**
```tsx
const handleDownloadQuoteCard = async () => {
  if (!selectedText) return;
  await downloadQuoteCard({
    quote: selectedText,
    artist: profile.displayName || 'VEKTR Artist',
    trackTitle: activeTrack?.title,
  });
};
```

## Next Steps (Priority Order)

### 1. Metabolic Visualizer Engine
**What it needs:**
- Deterministic 3D generation based on:
  - User ID hash
  - Track metadata hash
  - Session timestamp
  - DSP settings hash
- Mathematical signature that can't be reproduced
- Visual mapping of the identity data

**File to create:** `src/engine-core/MetabolicVisualizer.ts`

### 2. Kinetic Lyric Video Generator
**What it needs:**
- Time-synced word animations
- Uses transcriptionSegments for precise timing
- Export to video with audio
- Multiple animation presets

**File to create:** `src/lib/KineticLyricVideo.ts`

### 3. Sampler Intelligence
**What it needs:**
- Loop detection (short duration, repetitive waveform)
- Stem detection (sparse frequency data)
- Auto-categorization
- BPM-matched playback

**File to create:** `src/lib/SamplerIntelligence.ts`

### 4. Preset System
**What it needs:**
- Your exact EQ values:
  - VEKTR Standard: bass 8, mids 5, treble 6, noise reduce slight, boost 1
  - Lyrical: bass 7, mids 5, treble 4, noise reduce slight, no boost
  - Bass Boost: bass 9, mids 6, treble 7, boost 2, noise reduce 2
  - Punchy: bass 8, treble 7, mids 5, boost 2, noise reduce 3
  - Natural: bass 6, mids 3, treble 4, boost 2, noise reduce 1

**File to update:** `src/pages/MobileStudio.tsx` (add presets to the UI)

## Testing Checklist

- [ ] Upload audio file
- [ ] Wait for "Processing..." to change to "Ready"
- [ ] Check if transcription appears in LyricBook
- [ ] Open metronome popup in Mobile Studio
- [ ] Drag metronome around screen
- [ ] Select lyric text and create quote card
- [ ] Download quote card as PNG
- [ ] Verify quote card has artist name and branding

## Environment Setup

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Restart dev server: `npm run dev`

## Known Limitations

1. **Transcription requires API key** - Falls back to browser speech recognition without it
2. **Browser speech recognition is less accurate** - Chrome/Edge only
3. **Quote cards are 1080x1080** - Can be customized in QuoteCardGenerator.ts
4. **Metronome is visual only** - Audio click track coming in next update

## Support

If transcription fails:
1. Check console for errors
2. Verify API key is correct
3. Check file format (MP3, WAV, M4A supported)
4. Try smaller file (<25MB for Whisper API)
