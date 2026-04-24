# Step-by-Step Fixes

## Fix 1: Audio Persistence (30 min)

### Step 1.1: Expose Audio Element in ProfileContext

**File: `src/lib/ProfileContext.tsx`**

Find the return statement at the end of the component and update it:

```typescript
// FIND THIS:
return (
  <ProfileContext.Provider value={contextValue}>
    {children}
  </ProfileContext.Provider>
);

// REPLACE WITH THIS:
return (
  <ProfileContext.Provider value={contextValue}>
    {children}
    
    {/* GLOBAL AUDIO ELEMENT - Accessible from all pages */}
    <audio
      ref={audioRef}
      crossOrigin="anonymous"
      onTimeUpdate={() => {
        // Audio time is updating - visualizer can use this
      }}
      onEnded={() => {
        setIsPlaying(false);
      }}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      style={{ display: 'none' }} // Hidden but functional
    />
  </ProfileContext.Provider>
);
```

### Step 1.2: Fix VisualizerStudio Play Button

**File: `src/pages/VisualizerStudio.tsx`**

Find the play button (around line 200-250) and update it:

```typescript
// FIND THIS:
<button onClick={() => { /* some other logic */ }} className="ui-button">
  <Play className="w-4 h-4" />
  Play
</button>

// REPLACE WITH THIS:
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
  {isPlaying ? 'Pause' : 'Play'}
</button>
```

### Step 1.3: Fix VektrLab Play Button

**File: `src/pages/VektrLab.tsx`**

Find the play button and update it:

```typescript
// Add to imports at top:
const { togglePlay, isPlaying, activeTrackId } = useProfile();

// FIND THIS:
<button onClick={() => { /* some other logic */ }} className="ui-button">
  <Play className="w-4 h-4" />
</button>

// REPLACE WITH THIS:
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
</button>
```

### Step 1.4: Fix MobileStudio Play Button

**File: `src/pages/MobileStudio.tsx`**

Find the play button and update it:

```typescript
// Add to imports at top:
const { togglePlay, isPlaying, activeTrackId } = useProfile();

// FIND THIS:
<button onClick={() => { /* some other logic */ }} className="ui-button">
  <Play className="w-4 h-4" />
</button>

// REPLACE WITH THIS:
<button 
  onClick={togglePlay}
  disabled={!activeTrackId}
  className="ui-button"
>
  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
</button>
```

### Test Fix 1
1. Upload audio in ContentHub
2. Click play - audio should play
3. Navigate to Visualizer
4. Audio should still be playing
5. Click pause - audio should pause
6. Navigate to VektrLab
7. Audio should still be paused
8. Click play - audio should play
9. ✅ Audio persists across all screens

---

## Fix 2: Auto-Transcription (15 min)

### Step 2.1: Add Transcription Import

**File: `src/lib/ProfileContext.tsx`**

Find the imports at the top and add:

```typescript
// FIND THIS:
import { getCurrentUser, logOut } from './SovereignAuth';

// ADD AFTER IT:
import { transcribeAudioSmart } from './TranscriptionEngine';
```

### Step 2.2: Update Upload Pipeline

**File: `src/lib/ProfileContext.tsx`**

Find the `uploadMedia` function (around line 350-420) and update the ingest pipeline:

```typescript
// FIND THIS:
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

// REPLACE WITH THIS:
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
```

### Test Fix 2
1. Upload audio in ContentHub
2. Wait for processing (check console)
3. Navigate to LyricBook
4. Verify lyrics appear automatically
5. ✅ Transcription working

---

## Fix 3: Responsive UI (20 min)

### Step 3.1: Verify Layout Responsive Classes

**File: `src/components/Layout.tsx`**

Verify these classes exist (they should):

```typescript
// Desktop sidebar - hidden on mobile
<aside className="hidden md:flex w-[240px] flex-col border-r z-20">

// Mobile nav - shown only on mobile
<div className="md:hidden fixed bottom-0 left-0 right-0">
```

### Step 3.2: Verify Dashboard Responsive Grid

**File: `src/pages/Dashboard.tsx`**

Verify this exists:

```typescript
<div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
  {/* Stats cards - 2 cols on mobile, 4 cols on desktop */}
</div>
```

### Step 3.3: Verify Visualizer Responsive Layout

**File: `src/pages/VisualizerStudio.tsx`**

Verify this exists:

```typescript
<div className="flex flex-col lg:flex-row gap-[24px]">
  {/* Canvas on top (mobile), left (desktop) */}
  {/* Controls on bottom (mobile), right (desktop) */}
</div>
```

### Test Fix 3
1. Open app on mobile (375px width)
2. Verify sidebar is hidden
3. Verify mobile nav appears at bottom
4. Verify content is readable
5. Open app on tablet (768px width)
6. Verify layout adjusts
7. Open app on desktop (1920px width)
8. Verify full layout
9. ✅ Responsive design working

---

## Fix 4: Unified Workflow (30 min)

### Step 4.1: Add Quick Actions to ContentLibrary

**File: `src/pages/ContentLibrary.tsx`**

Find where items are displayed and add quick actions:

```typescript
// FIND THIS:
{item.type === 'audio' && (
  <div className="flex gap-2">
    {/* existing buttons */}
  </div>
)}

// ADD AFTER IT:
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

### Step 4.2: Add Quick Actions to LyricBook

**File: `src/pages/LyricBook.tsx`**

Find the end of the lyric editor and add:

```typescript
// ADD AFTER LYRIC EDITOR:
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

### Step 4.3: Add Quick Actions to VisualizerStudio

**File: `src/pages/VisualizerStudio.tsx`**

Find the export button area and add:

```typescript
// ADD AFTER EXPORT BUTTON:
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

### Test Fix 4
1. Upload audio in ContentHub
2. Click "Edit Lyrics" - goes to LyricBook
3. Click "Create Kinetic Video" - goes to Visualizer
4. Click "Add to Content Kit" - goes to ContentKit
5. ✅ Unified workflow working

---

## Final Testing

After all fixes:

```
1. Upload audio in ContentHub
   ✓ Audio appears in library
   ✓ Processing begins
   
2. Wait for processing
   ✓ Status changes to "ready"
   ✓ Lyrics auto-appear in LyricBook
   
3. Click "Edit Lyrics"
   ✓ Navigate to LyricBook
   ✓ Lyrics are editable
   ✓ Audio still plays
   
4. Click "Create Kinetic Video"
   ✓ Navigate to Visualizer
   ✓ Track and lyrics loaded
   ✓ Audio still plays
   ✓ Visualizer is audio-reactive
   
5. Click "Add to Content Kit"
   ✓ Navigate to ContentKit
   ✓ Visual appears
   ✓ Quick actions available
   
6. Test on mobile
   ✓ Layout responsive
   ✓ All buttons work
   ✓ Audio persists
   
7. Test on tablet
   ✓ Layout responsive
   ✓ All buttons work
   ✓ Audio persists
   
8. Test on desktop
   ✓ Full layout
   ✓ All buttons work
   ✓ Audio persists
```

---

## Summary

**Fix 1:** Audio persistence (30 min)
- Expose audio element
- Wire play/pause buttons
- Test across screens

**Fix 2:** Auto-transcription (15 min)
- Add transcription import
- Wire into upload pipeline
- Auto-save to LyricBook

**Fix 3:** Responsive UI (20 min)
- Verify responsive classes
- Test on all screen sizes

**Fix 4:** Unified workflow (30 min)
- Add quick action buttons
- Connect all pages
- Test full flow

**Total: ~1.5 hours**

After these fixes, the system will work exactly as intended:

**Upload → Process → Transcribe → Edit → Visualize → Export → Share**

All seamlessly connected.
