# Apply These Fixes Manually

## Fix 1: VisualizerStudio.tsx - Wire Play Button

Find line ~200 where play button is and replace:

```typescript
// FIND:
<button onClick={() => { /* some logic */ }} className="ui-button">
  <Play className="w-4 h-4" />
  Play
</button>

// REPLACE WITH:
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
  {isPlaying ? 'Pause' : 'Play'}
</button>
```

## Fix 2: VektrLab.tsx - Wire Play Button

Add to imports:
```typescript
const { togglePlay, isPlaying, activeTrackId } = useProfile();
```

Find play button and replace with:
```typescript
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
</button>
```

## Fix 3: MobileStudio.tsx - Wire Play Button

Add to imports:
```typescript
const { togglePlay, isPlaying, activeTrackId } = useProfile();
```

Find play button and replace with:
```typescript
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
</button>
```

## Fix 4: ContentLibrary.tsx - Add Quick Actions

After each audio item, add:
```typescript
{item.status === 'ready' && item.type === 'audio' && (
  <div className="flex gap-2 mt-2 flex-wrap">
    <button 
      onClick={() => {
        setActiveMediaId(item.id);
        navigate('/lyrics');
      }}
      className="text-xs ui-button-secondary"
    >
      📝 Edit Lyrics
    </button>
    <button 
      onClick={() => {
        setActiveMediaId(item.id);
        navigate('/visualizer');
      }}
      className="text-xs ui-button-secondary"
    >
      🎨 Create Visual
    </button>
    <button 
      onClick={() => {
        setActiveMediaId(item.id);
        navigate('/content');
      }}
      className="text-xs ui-button-secondary"
    >
      🎴 Quote Cards
    </button>
  </div>
)}
```

## Fix 5: LyricBook.tsx - Add Quick Actions

After lyric editor, add:
```typescript
{currentBook.content && (
  <div className="flex gap-2 mt-6 flex-wrap">
    <button 
      onClick={() => navigate('/visualizer')}
      className="ui-button"
    >
      🎬 Create Kinetic Video
    </button>
    <button 
      onClick={() => navigate('/content')}
      className="ui-button-secondary"
    >
      🎴 Generate Quote Cards
    </button>
    <button 
      onClick={() => navigate('/vektr-lab')}
      className="ui-button-secondary"
    >
      🎚️ Add Effects
    </button>
  </div>
)}
```

## Fix 6: VisualizerStudio.tsx - Add Quick Actions

After export button, add:
```typescript
{activeTrack && (
  <div className="flex gap-2 mt-4 flex-wrap">
    <button 
      onClick={() => navigate('/content')}
      className="ui-button-secondary"
    >
      📦 Add to Content Kit
    </button>
    <button 
      onClick={() => navigate('/links')}
      className="ui-button-secondary"
    >
      🔗 Add to Bio
    </button>
  </div>
)}
```

## Fix 7: ProfileContext.tsx - Update Ingest Pipeline

The transcription import is already added. Now update the ingest pipeline (around line 394).

Replace this:
```typescript
if (type === 'audio') {
  processIngestion(file, id)
    .then((result) => {
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

With this:
```typescript
if (type === 'audio') {
  Promise.all([
    processIngestion(file, id),
    transcribeAudioSmart(file).catch(() => null)
  ])
    .then(([analysisResult, transcriptionResult]) => {
      const autoTags = buildAutoTags(analysisResult);
      saveAnalysisData(id, analysisResult).catch(() => {});
      
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
              analysisData: analysisResult,
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

---

## After Applying All Fixes

Test the complete flow:

1. Upload audio in ContentHub
2. Wait for processing
3. Lyrics should auto-appear in LyricBook
4. Click "Create Visual" button
5. Navigate to Visualizer
6. Audio should still play
7. Play/pause buttons should work
8. Click "Add to Content Kit"
9. Navigate to ContentKit
10. Test on mobile - should be responsive
11. Test on tablet - should be responsive
12. Test on desktop - should work fully

All fixes are now ready to apply!
