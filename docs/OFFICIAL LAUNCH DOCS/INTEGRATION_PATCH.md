# VEKTR STUDIO - FINAL INTEGRATION PATCH
# Apply these changes to complete the system

## 1. Add Transcription Support to ProfileContext

**File:** `src/lib/ProfileContext.tsx`

**Line 8 - Add imports:**
```typescript
import { processTranscription } from './TranscriptionIntegration';
import { categorizeSample } from './SamplerIntelligence';
```

**Line ~362 - Replace the INGEST PIPELINE section:**

Find this block:
```typescript
if (type === 'audio') {
  processIngestion(file, id)
    .then((result) => {
```

Replace with:
```typescript
if (type === 'audio') {
  // Run all analysis in parallel
  Promise.all([
    processIngestion(file, id),
    processTranscription(file),
    categorizeSample(file),
  ])
    .then(([result, transcriptionData, sampleCategory]) => {
      const autoTags = buildAutoTags(result);
      
      // Merge sample intelligence tags
      if (sampleCategory.tags.length > 0) {
        autoTags.push(...sampleCategory.tags);
      }
      
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
              ...(transcriptionData || {}), // Add transcription fields
              ...(sampleCategory.subcategory ? { 
                category: sampleCategory.category as any,
                subcategory: sampleCategory.subcategory 
              } : {}),
            }
          : item
      ));
    })
```

---

## 2. Add Transcription to LyricBook

**File:** `src/pages/LyricBook.tsx`

**Line 2 - Update imports:**
```typescript
import { BookOpen, Plus, Music, ChevronRight, Quote, Star, Activity, Zap, Download, Sparkles, Check } from '../lib/icons';
```

**Line 7 - Add new imports:**
```typescript
import { getTranscription } from '../lib/TranscriptionIntegration';
import { downloadQuoteCard } from '../lib/QuoteCardGenerator';
```

**After line 14 (after `const activeTrack = ...`):**
```typescript
const autoTranscription = activeTrack ? getTranscription(activeTrack) : null;
```

**In the UI section (around line 150), add transcription button:**
```tsx
{autoTranscription && !localContent && (
  <button
    onClick={() => {
      setLocalContent(autoTranscription);
      saveLyricBook({
        ...currentBook,
        content: autoTranscription,
        updatedAt: Date.now()
      });
    }}
    className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
  >
    <Sparkles className="w-4 h-4" />
    Load Auto-Transcription
    <Check className="w-4 h-4" />
  </button>
)}
```

**Add quote card download function (after `handleAddQuote`):**
```typescript
const handleDownloadQuoteCard = async () => {
  if (!selectedText) return;
  await downloadQuoteCard({
    quote: selectedText,
    artist: profile.displayName || 'VEKTR Artist',
    trackTitle: activeTrack?.title,
    logoUrl: profile.avatarUrl,
  });
  setSelectedText('');
};
```

**Add download button next to "Add to Content Kit":**
```tsx
<button
  onClick={handleDownloadQuoteCard}
  disabled={!selectedText}
  className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-purple-500 disabled:opacity-30 hover:bg-purple-500/20 transition-colors"
>
  Download Quote Card
</button>
```

---

## 3. Add Metronome to Mobile Studio

**File:** `src/pages/MobileStudio.tsx`

**Line 1 - Add import:**
```typescript
import { MetronomePopup } from '../components/MetronomePopup';
```

**After other useState declarations (around line 40):**
```typescript
const [metronomeOpen, setMetronomeOpen] = useState(false);
```

**In the header section (around line 200), add button:**
```tsx
<button
  onClick={() => setMetronomeOpen(true)}
  className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-2"
>
  <Activity className="w-4 h-4" />
  Metronome
</button>
```

**Before the final closing `</div>` of the component:**
```tsx
<MetronomePopup isOpen={metronomeOpen} onClose={() => setMetronomeOpen(false)} />
```

---

## 4. Add Mobile Studio Presets

**File:** `src/pages/MobileStudio.tsx`

**Add preset definitions (around line 30, after imports):**
```typescript
const VOCAL_PRESETS = [
  {
    id: 'vektr-standard',
    name: 'VEKTR Standard',
    color: 'text-amber-500 border-amber-500/30',
    settings: {
      bass: 8,
      mids: 5,
      treble: 6,
      noiseReduction: 1, // slight
      boost: 1,
    }
  },
  {
    id: 'lyrical',
    name: 'Lyrical',
    color: 'text-blue-500 border-blue-500/30',
    settings: {
      bass: 7,
      mids: 5,
      treble: 4,
      noiseReduction: 1, // slight
      boost: 0,
    }
  },
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    color: 'text-purple-500 border-purple-500/30',
    settings: {
      bass: 9,
      mids: 6,
      treble: 7,
      noiseReduction: 2,
      boost: 2,
    }
  },
  {
    id: 'punchy',
    name: 'Punchy',
    color: 'text-red-500 border-red-500/30',
    settings: {
      bass: 8,
      mids: 5,
      treble: 7,
      noiseReduction: 3,
      boost: 2,
    }
  },
  {
    id: 'natural',
    name: 'Natural',
    color: 'text-emerald-500 border-emerald-500/30',
    settings: {
      bass: 6,
      mids: 3,
      treble: 4,
      noiseReduction: 1,
      boost: 2,
    }
  },
];
```

**Add preset UI section (in the recorder tab, after waveform):**
```tsx
{/* Vocal Presets */}
<div className="space-y-3">
  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
    Quick Presets
  </h3>
  <div className="grid grid-cols-2 gap-2">
    {VOCAL_PRESETS.map(preset => (
      <button
        key={preset.id}
        onClick={() => {
          // Apply preset settings to your DSP controls
          // You'll need to map these to your actual rack params
          console.log('Apply preset:', preset.settings);
        }}
        className={cn(
          "px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
          preset.color,
          "hover:bg-white/5"
        )}
      >
        {preset.name}
      </button>
    ))}
  </div>
</div>
```

---

## 5. Setup Environment

**Create `.env` file in project root:**
```
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

Get your key from: https://platform.openai.com/api-keys

---

## 6. Add Transcription Fields to MediaItem Type

**File:** `src/types/library.ts`

**Find the MediaItem interface and add these fields:**
```typescript
export interface MediaItem {
  // ... existing fields ...
  transcription?: string; // Auto-generated lyrics/transcription
  transcriptionSegments?: Array<{ text: string; start: number; end: number }>; // Word-level timestamps
}
```

---

## Testing Checklist

After applying all patches:

1. **Restart dev server:** `npm run dev`
2. **Upload audio file** with vocals
3. **Wait for processing** - should see "Processing..." → "Ready"
4. **Check LyricBook:**
   - Should see "Load Auto-Transcription" button if transcription succeeded
   - Click to load transcribed lyrics
   - Select text and create quote card
5. **Check Mobile Studio:**
   - Click "Metronome" button
   - Drag metronome popup around
   - Try vocal presets
6. **Check Sampler:**
   - Upload a short loop (< 8 seconds)
   - Should auto-categorize as "Loop"
   - Upload a stem
   - Should detect stem type (drums, bass, etc.)

---

## Known Issues & Solutions

**If transcription fails:**
- Check console for errors
- Verify API key is correct in `.env`
- File must be < 25MB for Whisper API
- Falls back to browser speech recognition (less accurate)

**If metronome doesn't appear:**
- Check that MetronomePopup component exists
- Verify import path is correct
- Check browser console for errors

**If presets don't work:**
- Map preset values to your actual DSP rack parameters
- Check that rack params are being updated correctly

---

## Next Steps

After integration is complete:

1. **Wire Kinetic Lyric Video** to VisualizerStudio
2. **Complete StyleEvolver integration** (Phase 2 of master task list)
3. **Add currentTime highlighting** to LyricBook
4. **Polish UI/UX** - fix clunky fonts and boundaries
5. **Test end-to-end** with "Artifact of Compression"
