# Quick Integration Steps

## 1. Enable Transcription (2 minutes)

Open `src/lib/ProfileContext.tsx` and find line ~6:

**Add this import:**
```tsx
import { processTranscription } from './TranscriptionIntegration';
```

Find the section around line 360 that starts with `// ── INGEST PIPELINE:` and has:
```tsx
if (type === 'audio') {
  processIngestion(file, id)
```

**Replace the entire `if (type === 'audio') { ... }` block with:**
```tsx
if (type === 'audio') {
  Promise.all([
    processIngestion(file, id),
    processTranscription(file),
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
              ...(transcriptionData || {}),
            }
          : item
      ));
    })
    .catch(() => {
      setVault(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'ready' as const } : item
      ));
    });
}
```

## 2. Add Metronome to Mobile Studio (1 minute)

Open `src/pages/MobileStudio.tsx`:

**Add import at top:**
```tsx
import { MetronomePopup } from '../components/MetronomePopup';
```

**Add state after other useState declarations (around line 40):**
```tsx
const [metronomeOpen, setMetronomeOpen] = useState(false);
```

**Add button in the header section (around line 200, near the title):**
```tsx
<button
  onClick={() => setMetronomeOpen(true)}
  className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/20 transition-colors"
>
  Metronome
</button>
```

**Add popup before the final closing `</div>` of the component:**
```tsx
<MetronomePopup isOpen={metronomeOpen} onClose={() => setMetronomeOpen(false)} />
```

## 3. Setup Environment (30 seconds)

Create `.env` file in project root:
```
VITE_OPENAI_API_KEY=sk-your-key-here
```

Get your key from: https://platform.openai.com/api-keys

## 4. Test It

1. Restart dev server: `npm run dev`
2. Upload an audio file with vocals
3. Wait for processing to complete
4. Go to LyricBook - transcription should auto-populate
5. Click Metronome button in Mobile Studio
6. Drag the metronome popup around

## Optional: Quote Cards in LyricBook

Open `src/pages/LyricBook.tsx`:

**Add imports:**
```tsx
import { getTranscription } from '../lib/TranscriptionIntegration';
import { downloadQuoteCard } from '../lib/QuoteCardGenerator';
```

**Add after the `handleAddQuote` function:**
```tsx
const handleDownloadQuoteCard = async () => {
  if (!selectedText) return;
  await downloadQuoteCard({
    quote: selectedText,
    artist: profile.displayName || 'VEKTR Artist',
    trackTitle: activeTrack?.title,
  });
  setSelectedText('');
};
```

**Add button next to the existing "Add to Content Kit" button:**
```tsx
<button
  onClick={handleDownloadQuoteCard}
  className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs font-bold uppercase tracking-widest text-purple-500"
>
  Download Quote Card
</button>
```

Done! You now have:
✅ Auto-transcription on upload
✅ Floating metronome popup
✅ Quote card generator
