# CRITICAL FIXES NEEDED

## Issue 1: Audio Not Persisting Across Screens

### Problem
- Audio plays in ContentHub but not in Visualizer, VektrLab, etc.
- Audio element is in ProfileContext but not properly connected to all pages
- Play/pause buttons exist but aren't functional

### Root Cause
The `<audio>` element is hidden in ProfileContext but:
1. Not all pages are using `globalAudioRef` correctly
2. Play/pause buttons aren't calling `togglePlay()`
3. Audio context might be suspended on navigation

### Solution

**File: `src/lib/ProfileContext.tsx`**

Add this to the return statement (make audio element visible and accessible):

```typescript
return (
  <ProfileContext.Provider value={contextValue}>
    {children}
    
    {/* GLOBAL AUDIO ELEMENT - Must be in DOM for all pages */}
    <audio
      ref={audioRef}
      crossOrigin="anonymous"
      onTimeUpdate={() => {
        // Update current time for visualizer
        if (globalAnalyserRef.current) {
          // Trigger any listeners
        }
      }}
      onEnded={() => {
        setIsPlaying(false);
      }}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  </ProfileContext.Provider>
);
```

**File: `src/pages/VisualizerStudio.tsx`**

Replace all play/pause buttons with:

```typescript
const { globalAudioRef, isPlaying, togglePlay, activeTrackId } = useProfile();

// In JSX:
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
  {isPlaying ? 'Pause' : 'Play'}
</button>
```

**File: `src/pages/VektrLab.tsx`**

Same fix - use `togglePlay()` from context:

```typescript
const { togglePlay, isPlaying, activeTrackId } = useProfile();

<button onClick={togglePlay} disabled={!activeTrackId}>
  {isPlaying ? 'Pause' : 'Play'}
</button>
```

**File: `src/pages/MobileStudio.tsx`**

Same fix:

```typescript
const { togglePlay, isPlaying, activeTrackId } = useProfile();

<button onClick={togglePlay} disabled={!activeTrackId}>
  {isPlaying ? 'Pause' : 'Play'}
</button>
```

---

## Issue 2: Auto-Transcription Not Working

### Problem
- Lyrics are not auto-transcribed when track is uploaded
- LyricBook is empty
- No transcription happening in background

### Root Cause
Transcription is not wired into the upload pipeline in ProfileContext

### Solution

**File: `src/lib/ProfileContext.tsx`**

Update the `uploadMedia` function to include transcription:

```typescript
const uploadMedia = async (file: File, category?: MediaItem['category'], subcategory?: string) => {
  const id = `media-${Date.now()}`;
  const title = file.name.replace(/\.[^/.]+$/, "");
  await saveAudioFile(id, file);
  
  let type: MediaItem['type'] = 'other';
  let autoCategory: MediaItem['category'] = category || 'Single';

  if (file.type.startsWith('audio/')) { type = 'audio'; }
  else if (file.type.startsWith('video/')) { type = 'video'; autoCategory = category || 'Videos'; }
  else if (file.type.startsWith('image/')) { type = 'image'; autoCategory = category || 'Photos'; }

  const thumbnailUrl = ART_CanvasHash(
    buildSovereignContext(
      { ownerId: profile.ownerId, displayName: profile.displayName || 'VEKTR' },
      { id, title, artist: profile.displayName || 'Vektr Elite', createdAt: Date.now() },
      rackParams,
      '',
      undefined,
      undefined,
      profile.avatarUrl
    )
  );
  
  const newItem: MediaItem = {
    id,
    title,
    artist: profile.displayName || 'Vektr Elite',
    type,
    category: autoCategory,
    subcategory,
    duration: 0,
    fileUrl: URL.createObjectURL(file),
    thumbnailUrl,
    createdAt: Date.now(),
    status: type === 'audio' ? 'processing' : 'ready',
  };
  setVault(prev => [newItem, ...prev]);
  if (type === 'audio') setActiveMediaId(id);

  // ── INGEST PIPELINE: Fire-and-forget background analysis ──────────────
  if (type === 'audio') {
    Promise.all([
      processIngestion(file, id),
      transcribeAudioSmart(file).catch(() => null) // Transcription is optional
    ])
      .then(([analysisResult, transcriptionResult]) => {
        const autoTags = buildAutoTags(analysisResult);
        saveAnalysisData(id, analysisResult).catch(() => {});
        
        // ✅ AUTO-SAVE TRANSCRIPTION TO LYRIC BOOK
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
};
```

**Add import at top of ProfileContext.tsx:**

```typescript
import { transcribeAudioSmart } from './TranscriptionEngine';
```

---

## Issue 3: UI Not Responsive

### Problem
- Layout breaks on mobile/tablet
- Sidebar doesn't collapse
- Content doesn't reflow

### Solution

**File: `src/components/Layout.tsx`**

The sidebar already has responsive code but needs to be verified:

```typescript
// This should already be there:
<aside className={cn("hidden md:flex w-[240px] flex-col border-r z-20 transition-colors duration-300", ...)}>
  {/* Desktop sidebar */}
</aside>

{/* Mobile nav */}
<div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/[0.06] bg-[var(--color-bg-panel)] z-50">
  {/* Mobile navigation */}
</div>
```

**File: `src/pages/Dashboard.tsx`**

Ensure grid is responsive:

```typescript
<div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
  {/* Stats cards */}
</div>
```

**File: `src/pages/VisualizerStudio.tsx`**

Ensure layout is responsive:

```typescript
<div className="flex flex-col lg:flex-row gap-[24px]">
  {/* Canvas on left, controls on right */}
</div>
```

---

## Issue 4: Unified Workflow Not Implemented

### Problem
- Upload → Processing → Transcription → Lyric Book → Visualizer flow is broken
- Quick actions not available
- Content Kit not integrated

### Solution

**File: `src/pages/ContentLibrary.tsx`**

Add quick actions after upload completes:

```typescript
{item.status === 'ready' && item.type === 'audio' && (
  <div className="flex gap-2 mt-2">
    <button 
      onClick={() => navigate('/lyrics')}
      className="text-xs ui-button-secondary"
    >
      Edit Lyrics
    </button>
    <button 
      onClick={() => navigate('/visualizer')}
      className="text-xs ui-button-secondary"
    >
      Create Visual
    </button>
    <button 
      onClick={() => navigate('/content')}
      className="text-xs ui-button-secondary"
    >
      Quote Cards
    </button>
  </div>
)}
```

**File: `src/pages/LyricBook.tsx`**

Add quick actions:

```typescript
{currentBook.content && (
  <div className="flex gap-2 mt-4">
    <button 
      onClick={() => navigate('/visualizer')}
      className="ui-button"
    >
      Create Kinetic Video
    </button>
    <button 
      onClick={() => navigate('/content')}
      className="ui-button-secondary"
    >
      Generate Quote Cards
    </button>
  </div>
)}
```

**File: `src/pages/VisualizerStudio.tsx`**

Add quick actions:

```typescript
{activeTrack && (
  <div className="flex gap-2 mt-4">
    <button 
      onClick={() => navigate('/content')}
      className="ui-button-secondary"
    >
      Add to Content Kit
    </button>
    <button 
      onClick={() => navigate('/links')}
      className="ui-button-secondary"
    >
      Add to Bio
    </button>
  </div>
)}
```

---

## Priority Order

1. **CRITICAL:** Fix audio persistence (Issue 1)
   - Audio must play on all screens
   - Play/pause buttons must work everywhere
   - Time: 30 min

2. **CRITICAL:** Wire transcription (Issue 2)
   - Auto-transcribe on upload
   - Save to LyricBook automatically
   - Time: 15 min

3. **IMPORTANT:** Fix responsive UI (Issue 3)
   - Verify breakpoints
   - Test on mobile/tablet
   - Time: 20 min

4. **IMPORTANT:** Implement unified workflow (Issue 4)
   - Add quick action buttons
   - Connect all pages
   - Time: 30 min

**Total: ~1.5 hours to fix all critical issues**

---

## Testing Checklist

After fixes:

- [ ] Upload audio in ContentHub
- [ ] Lyrics auto-appear in LyricBook
- [ ] Click "Create Visual" button
- [ ] Navigate to Visualizer
- [ ] Audio still plays
- [ ] Play/pause buttons work
- [ ] Visualizer is audio-reactive
- [ ] Click "Add to Content Kit"
- [ ] Navigate to ContentKit
- [ ] Quick actions available
- [ ] Test on mobile (responsive)
- [ ] Test on tablet (responsive)
- [ ] Test on desktop (responsive)

---

## Summary

The system is **architecturally sound** but needs:
1. Audio element properly exposed to all pages
2. Transcription wired into upload pipeline
3. Responsive design verified
4. Quick action buttons connecting pages

Once these are fixed, the entire workflow will work as intended:

**Upload → Process → Transcribe → Edit → Visualize → Export → Share**

All in one seamless flow.
