# Quick Actions - Manual Implementation

These are the remaining quick action buttons to add to connect the pages.

## 1. ContentLibrary.tsx - Add Quick Actions

**Location:** After each audio item display (around line 200-250)

**Find this section:**
```typescript
{item.type === 'audio' && (
  <div className="flex gap-2">
    {/* existing buttons */}
  </div>
)}
```

**Add this after it:**
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

---

## 2. LyricBook.tsx - Add Quick Actions

**Location:** After the lyric editor (around line 140-160)

**Find this section:**
```typescript
<textarea
  ref={textAreaRef}
  value={localContent}
  onChange={(e) => setLocalContent(e.target.value)}
  className="ui-input min-h-[400px] font-mono"
  placeholder="Paste or type lyrics here..."
/>
```

**Add this after it:**
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

---

## 3. VisualizerStudio.tsx - Add Quick Actions

**Location:** After the export button (around line 180-200)

**Find this section:**
```typescript
<button 
  disabled={!canvasRef.current || !globalAudioRef.current}
  onClick={handleExport}
  className="ui-button"
>
  {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Download className="w-4 h-4" />}
  {isRecording ? 'Terminate' : 'Export Sequence'}
</button>
```

**Add this after it:**
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

---

## Testing the Unified Workflow

After adding all quick actions:

```
1. ContentHub
   ↓ Upload audio
   ↓ Wait for processing
   ↓ Click "Edit Lyrics"
   
2. LyricBook
   ↓ Lyrics auto-appear
   ↓ Click "Create Kinetic Video"
   
3. VisualizerStudio
   ↓ Track and lyrics loaded
   ↓ Audio plays
   ↓ Click "Add to Content Kit"
   
4. ContentKit
   ↓ Visual appears
   ↓ Ready to export
```

---

## Complete Flow

**Upload → Process → Transcribe → Edit → Visualize → Export → Share**

All connected with quick action buttons.

---

## Notes

- All buttons use `navigate()` from the router
- `setActiveMediaId()` ensures the track is selected when navigating
- Quick actions only show when content is ready
- Buttons use consistent styling: `ui-button` and `ui-button-secondary`
- Emojis make buttons visually distinct and easy to identify

---

**After adding these quick actions, the entire system will work as one unified workflow!**
