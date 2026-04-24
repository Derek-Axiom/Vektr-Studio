# Transcription Integration Patch

## File: src/lib/ProfileContext.tsx

### Change 1: Add import (Line 9)
```typescript
import { transcribeAudioSmart } from './TranscriptionEngine';
```

### Change 2: Update ingest pipeline (Line 394-420)

**FIND:**
```typescript
      processIngestion(file, id)
        .then((result) => {
          const autoTags = buildAutoTags(result);
          // Persist analysisData (onset arrays, histogram) to IndexedDB - NOT localStorage.
          // localStorage has a ~5MB limit; onset arrays for long tracks easily overflow it silently.
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
                  analysisData: result, // In-memory only; persisted to IDB above
                }
              : item
          ));
        })
        .catch(() => {
          setVault(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'ready' as const } : item
          ));
        });
```

**REPLACE WITH:**
```typescript
      Promise.all([
        processIngestion(file, id),
        transcribeAudioSmart(file).catch(() => null) // Transcription is optional
      ])
        .then(([analysisResult, transcriptionResult]) => {
          const autoTags = buildAutoTags(analysisResult);
          // Persist analysisData (onset arrays, histogram) to IndexedDB - NOT localStorage.
          // localStorage has a ~5MB limit; onset arrays for long tracks easily overflow it silently.
          saveAnalysisData(id, analysisResult).catch(() => {});
          
          // Save transcription to lyric book if available
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
              return existing ? prev.map(b => b.trackId === id ? lyricBook : b) : [lyricBook, ...prev];
            });
          }
          
          setVault(prev => prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  status: 'ready' as const,
                  bpm: analysisResult.bpm,
                  key: analysisResult.key,
                  duration: analysisResult.duration,
                  tags: autoTags,
                  analysisData: analysisResult, // In-memory only; persisted to IDB above
                }
              : item
          ));
        })
        .catch(() => {
          setVault(prev => prev.map(item =>
            item.id === id ? { ...item, status: 'ready' as const } : item
          ));
        });
```

## Environment Setup

Add to `.env`:
```
VITE_OPENAI_API_KEY=your_api_key_here
```

Or copy `.env.example` and fill in your OpenAI API key.

## Testing

1. Upload an audio file with vocals
2. Wait for processing to complete
3. Navigate to LyricBook
4. Transcribed lyrics should appear automatically
5. Sync calibration button should work with onset data

## Status

✅ Import added
✅ Transcription integrated into upload pipeline
✅ Lyrics auto-saved to LyricBook
✅ Fallback to browser speech recognition if API unavailable

