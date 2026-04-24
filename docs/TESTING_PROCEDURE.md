# VEKTR - Exact Testing Procedure

## Before You Start

1. Run `npm run dev`
2. Open http://localhost:5173
3. Create an account (SovereignOnboarding)
4. Have a test audio file ready (MP3 with vocals)
5. Have a test image ready (JPG or PNG)

---

## Test 1: Complete Workflow (30 minutes)

### Step 1: Upload Audio
1. Go to **ContentHub**
2. Click **Upload** button
3. Select audio file with vocals
4. **Expected:** File appears in library with "processing" status
5. **Verify:** ✅ File visible, status shows "processing"

### Step 2: Wait for Processing
1. Wait 30 seconds
2. **Expected:** Status changes to "ready"
3. **Verify:** ✅ Status changed to "ready"

### Step 3: Check Transcription
1. Go to **LyricBook**
2. **Expected:** Lyrics appear automatically
3. **Verify:** ✅ Lyrics visible and editable
4. **Verify:** ✅ Lyrics match audio content

**If lyrics don't appear: STOP. Transcription broken.**

### Step 4: Edit Lyrics
1. In LyricBook, edit lyrics if needed
2. Click **"Sync Calibration"** button
3. **Expected:** Sync lines created
4. **Verify:** ✅ Sync lines visible

### Step 5: Create Visual
1. Click **"Create Kinetic Video"** button
2. **Expected:** Navigate to VisualizerStudio
3. **Verify:** ✅ In VisualizerStudio

### Step 6: Check Audio
1. In VisualizerStudio
2. **Expected:** Audio is playing
3. **Verify:** ✅ Audio playing, visualizer rendering

**If audio not playing: STOP. Audio persistence broken.**

### Step 7: Customize Visuals
1. Change **Saturation** from 0 to 100
2. **Expected:** Visualizer changes from grayscale to hyper-saturated
3. **Verify:** ✅ Dramatic color change visible

**If no color change: STOP. Vivid changes broken.**

4. Change **Tempo** from 60 to 180
5. **Expected:** Rotation speed increases dramatically
6. **Verify:** ✅ Rotation noticeably faster

**If no speed change: STOP. Vivid changes broken.**

### Step 8: Export Video
1. Click **"Export Sequence"** button
2. **Expected:** Recording starts, audio plays, visualizer renders
3. Wait for recording to complete
4. **Expected:** Video downloads
5. **Verify:** ✅ Video file downloaded

### Step 9: Check Proof Hash
1. Look at downloaded filename
2. **Expected:** Filename includes proof hash (e.g., `VEKTR_Track_12a4b5c6.webm`)
3. **Verify:** ✅ Proof hash in filename

**If proof hash missing: STOP. Proof system broken.**

### Step 10: Share Visual
1. Click **"Add to Bio"** button
2. **Expected:** Navigate to LinkVault
3. **Verify:** ✅ In LinkVault
4. **Verify:** ✅ Visual appears in bio

**If visual doesn't appear: STOP. Integration broken.**

---

## Test 2: Audio Persistence (15 minutes)

### Step 1: Play in ContentHub
1. Go to **ContentHub**
2. Click **Play** button on audio file
3. **Expected:** Audio plays
4. **Verify:** ✅ Audio playing

### Step 2: Navigate to Visualizer
1. Click **"Create Visual"** button
2. **Expected:** Navigate to VisualizerStudio
3. **Verify:** ✅ In VisualizerStudio
4. **Verify:** ✅ Audio still playing

**If audio stopped: STOP. Audio persistence broken.**

### Step 3: Pause and Navigate
1. Click **Pause** button
2. **Expected:** Audio pauses
3. **Verify:** ✅ Audio paused
4. Navigate to **VektrLab**
5. **Expected:** Audio still paused
6. **Verify:** ✅ Audio paused

### Step 4: Play in VektrLab
1. Click **Play** button
2. **Expected:** Audio plays
3. **Verify:** ✅ Audio playing
4. Navigate to **MobileStudio**
5. **Expected:** Audio still playing
6. **Verify:** ✅ Audio playing

**If audio stopped at any point: STOP. Audio persistence broken.**

---

## Test 3: Vivid Visual Changes (20 minutes)

### Test 3A: Saturation
1. In VisualizerStudio
2. Set **Saturation** to 0
3. **Expected:** Visualizer is grayscale
4. **Verify:** ✅ Completely grayscale
5. Set **Saturation** to 100
6. **Expected:** Visualizer is hyper-saturated neon
7. **Verify:** ✅ Bright, saturated colors

**If no change: STOP. Vivid changes broken.**

### Test 3B: Compression
1. Set **Compression** to -60 dB
2. **Expected:** Geometry is loose and flowing
3. **Verify:** ✅ Loose, spread-out geometry
4. Set **Compression** to 0 dB
5. **Expected:** Geometry is tight and dense
6. **Verify:** ✅ Tight, compact geometry

**If no change: STOP. Vivid changes broken.**

### Test 3C: Tempo
1. Set **Tempo** to 60 BPM
2. **Expected:** Rotation is slow and majestic
3. **Verify:** ✅ Slow rotation
4. Set **Tempo** to 180 BPM
5. **Expected:** Rotation is fast and frantic
6. **Verify:** ✅ Fast rotation

**If no change: STOP. Vivid changes broken.**

### Test 3D: Audio Reactivity
1. Play bass-heavy track
2. **Expected:** Geometry grows noticeably
3. **Verify:** ✅ Geometry larger with bass
4. Play treble-heavy track
5. **Expected:** Brightness increases noticeably
6. **Verify:** ✅ Brighter with treble

**If no change: STOP. Audio reactivity broken.**

---

## Test 4: Mathematical Proof (10 minutes)

### Step 1: Check Proof Display
1. In VisualizerStudio
2. Look at bottom-left corner
3. **Expected:** Proof hash displayed
4. **Verify:** ✅ Hash visible (e.g., "12a4b5c6d7e8f9g0...")

**If hash not visible: STOP. Proof system broken.**

### Step 2: Export and Check Filename
1. Click **"Export Sequence"**
2. Wait for download
3. Check filename
4. **Expected:** Filename includes proof hash
5. **Verify:** ✅ Hash in filename

**If hash missing: STOP. Proof system broken.**

### Step 3: Reproducibility
1. Note the proof hash
2. Use same track, same settings
3. Create visual again
4. **Expected:** Same proof hash generated
5. **Verify:** ✅ Hash matches

**If hash different: STOP. Determinism broken.**

---

## Test 5: Responsive Design (15 minutes)

### Test 5A: Mobile (375px)
1. Open DevTools (F12)
2. Toggle device toolbar
3. Select iPhone SE (375px)
4. **Expected:** Sidebar hidden, mobile nav visible
5. **Verify:** ✅ Mobile layout correct
6. Test all buttons
7. **Verify:** ✅ All buttons work
8. Test audio playback
9. **Verify:** ✅ Audio plays

**If any element breaks: STOP. Mobile design broken.**

### Test 5B: Tablet (768px)
1. Select iPad (768px)
2. **Expected:** Layout adjusts properly
3. **Verify:** ✅ Tablet layout correct
4. Test all buttons
5. **Verify:** ✅ All buttons work
6. Test audio playback
7. **Verify:** ✅ Audio plays

**If any element breaks: STOP. Tablet design broken.**

### Test 5C: Desktop (1920px)
1. Select Desktop (1920px)
2. **Expected:** Full layout visible
3. **Verify:** ✅ Desktop layout correct
4. Test all buttons
5. **Verify:** ✅ All buttons work
6. Test audio playback
7. **Verify:** ✅ Audio plays

**If any element breaks: STOP. Desktop design broken.**

---

## Test 6: Quick Actions (10 minutes)

### Step 1: ContentHub Quick Actions
1. Go to **ContentHub**
2. Find audio file
3. **Expected:** "Edit Lyrics" button visible
4. Click it
5. **Expected:** Navigate to LyricBook
6. **Verify:** ✅ In LyricBook

**If button missing: STOP. Quick actions broken.**

### Step 2: LyricBook Quick Actions
1. In LyricBook with lyrics
2. **Expected:** "Create Kinetic Video" button visible
3. Click it
4. **Expected:** Navigate to VisualizerStudio
5. **Verify:** ✅ In VisualizerStudio

**If button missing: STOP. Quick actions broken.**

### Step 3: VisualizerStudio Quick Actions
1. In VisualizerStudio
2. **Expected:** "Add to Content Kit" button visible
3. Click it
4. **Expected:** Navigate to ContentKit
5. **Verify:** ✅ In ContentKit

**If button missing: STOP. Quick actions broken.**

---

## Scoring

### Perfect (All Tests Pass)
- ✅ Complete workflow works
- ✅ Audio persists across screens
- ✅ Visual changes are vivid
- ✅ Proof hash generated and embedded
- ✅ Quick actions work
- ✅ Responsive design works

**Result:** System is ready for production

### Critical Failures (System Broken)
- ❌ Transcription doesn't work
- ❌ Audio doesn't persist
- ❌ Visual changes aren't vivid
- ❌ Proof hash missing
- ❌ Quick actions don't work
- ❌ Responsive design breaks

**Result:** System needs fixes before use

---

## What to Do If Tests Fail

### Transcription Fails
1. Check browser console for errors
2. Verify Web Speech API is supported
3. Try different audio file
4. Check ProfileContext ingest pipeline

### Audio Doesn't Persist
1. Check if audio element is in DOM
2. Verify togglePlay() is wired
3. Check if activeMediaId is set
4. Check browser console

### Visual Changes Aren't Vivid
1. Check MetabolicVisualizer.ts
2. Verify DSP parameters applied
3. Check THREE.js rendering
4. Check browser console for WebGL errors

### Proof Hash Missing
1. Check ART_CanvasHasher.ts
2. Verify SHA-256 computing
3. Check if hash embedded
4. Check browser console

### Quick Actions Don't Work
1. Check if buttons rendering
2. Verify navigate() imported
3. Check onClick handlers
4. Check browser console

---

## Final Checklist

Before declaring success:

- [ ] Complete workflow works end-to-end
- [ ] Audio persists on all screens
- [ ] Visual changes are vivid and noticeable
- [ ] Proof hash is generated and embedded
- [ ] Quick actions connect all pages
- [ ] Responsive design works on all screens
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance is smooth (60fps)
- [ ] All buttons are functional

**If ALL of these are true: System is ready.**

---

## The Bottom Line

**If everything doesn't work perfectly, it's worthless.**

**Test everything. Verify everything. Accept nothing less than perfection.**

**VEKTR is all or nothing.**
