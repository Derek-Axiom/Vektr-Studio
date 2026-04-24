# VEKTR - Critical Verification Checklist

## If Any of These Fail, the System is Broken

### Phase 1: End-to-End Workflow (CRITICAL)

#### Upload → Process → Transcribe
- [ ] Upload audio file in ContentHub
- [ ] File appears in library immediately
- [ ] Status shows "processing"
- [ ] Wait 30 seconds
- [ ] Status changes to "ready"
- [ ] Go to LyricBook
- [ ] **Lyrics appear automatically** ← CRITICAL
- [ ] Lyrics are editable
- [ ] Lyrics match audio content

**If lyrics don't appear:** System is broken. Transcription not working.

#### Edit → Visualize
- [ ] Go to LyricBook
- [ ] Click "Create Kinetic Video" button
- [ ] Navigate to VisualizerStudio
- [ ] Track is selected
- [ ] Lyrics are loaded
- [ ] Audio is playing
- [ ] **Audio continues playing** ← CRITICAL

**If audio stops:** Audio persistence broken.

#### Visualize → Export
- [ ] In VisualizerStudio
- [ ] Click "Export Sequence"
- [ ] Recording starts
- [ ] Audio plays
- [ ] Visualizer renders
- [ ] Recording completes
- [ ] Video downloads
- [ ] **Filename includes proof hash** ← CRITICAL

**If proof hash missing:** Proof system broken.

#### Export → Share
- [ ] Video downloaded successfully
- [ ] Go to LinkVault
- [ ] Click "Add to Bio"
- [ ] Visual appears in bio
- [ ] Proof hash visible
- [ ] Can share link

**If visual doesn't appear:** Integration broken.

---

### Phase 2: Audio Persistence (CRITICAL)

#### Audio Plays on All Screens
- [ ] Upload audio in ContentHub
- [ ] Click play
- [ ] Audio plays
- [ ] Navigate to VisualizerStudio
- [ ] **Audio still plays** ← CRITICAL
- [ ] Click pause
- [ ] Audio pauses
- [ ] Navigate to VektrLab
- [ ] **Audio still paused** ← CRITICAL
- [ ] Click play
- [ ] **Audio plays** ← CRITICAL
- [ ] Navigate to MobileStudio
- [ ] **Audio still plays** ← CRITICAL

**If audio stops on any screen:** Audio persistence broken.

#### Play/Pause Buttons Work Everywhere
- [ ] VisualizerStudio play button works
- [ ] VektrLab play button works
- [ ] MobileStudio play button works
- [ ] ContentLibrary play button works
- [ ] LyricBook play button works

**If any button doesn't work:** Play/pause system broken.

---

### Phase 3: Vivid Visual Changes (CRITICAL)

#### DSP Settings Create Visible Changes
- [ ] Set saturation to 0
- [ ] **Visualizer is grayscale** ← CRITICAL
- [ ] Set saturation to 100
- [ ] **Visualizer is hyper-saturated** ← CRITICAL
- [ ] Set compression to -60
- [ ] **Geometry is loose and flowing** ← CRITICAL
- [ ] Set compression to 0
- [ ] **Geometry is tight and dense** ← CRITICAL
- [ ] Set tempo to 60
- [ ] **Rotation is slow and majestic** ← CRITICAL
- [ ] Set tempo to 180
- [ ] **Rotation is fast and frantic** ← CRITICAL

**If settings don't change visuals:** Customization system broken.

#### Audio Reactivity Creates Visible Changes
- [ ] Play bass-heavy track
- [ ] **Geometry grows noticeably** ← CRITICAL
- [ ] **Colors shift toward warm** ← CRITICAL
- [ ] Play treble-heavy track
- [ ] **Brightness increases noticeably** ← CRITICAL
- [ ] **Glow intensifies** ← CRITICAL
- [ ] Play track with peaks
- [ ] **Signature ring flashes** ← CRITICAL

**If audio doesn't affect visuals:** Audio reactivity broken.

#### Background Images Work
- [ ] Upload photo
- [ ] Use as visualizer background
- [ ] **Photo is dimmed 40%** ← CRITICAL
- [ ] **Photo is slightly blurred** ← CRITICAL
- [ ] Use same photo in quote card
- [ ] **Photo is dimmed 60%** ← CRITICAL
- [ ] **Photo is heavily blurred** ← CRITICAL

**If background doesn't work:** Background integration broken.

---

### Phase 4: Mathematical Proof (CRITICAL)

#### Proof Hash is Generated
- [ ] Create visual in VisualizerStudio
- [ ] **Proof hash displays in corner** ← CRITICAL
- [ ] Export video
- [ ] **Proof hash in filename** ← CRITICAL
- [ ] Open video metadata
- [ ] **Proof hash embedded** ← CRITICAL

**If proof hash missing:** Proof system broken.

#### Proof Hash is Reproducible
- [ ] Note the proof hash
- [ ] Use same track, same settings
- [ ] Create visual again
- [ ] **Same proof hash generated** ← CRITICAL
- [ ] Change one DSP setting
- [ ] Create visual again
- [ ] **Different proof hash generated** ← CRITICAL

**If hashes don't match:** Determinism broken.

#### Proof Hash is Verifiable
- [ ] Export video with proof hash
- [ ] Share with someone else
- [ ] They can verify hash
- [ ] **Hash matches your session data** ← CRITICAL

**If hash can't be verified:** Verification system broken.

---

### Phase 5: Responsive Design (CRITICAL)

#### Mobile (375px width)
- [ ] Open app on mobile
- [ ] Sidebar is hidden
- [ ] Mobile nav appears at bottom
- [ ] Content is readable
- [ ] All buttons work
- [ ] Audio plays
- [ ] Visualizer renders

**If any element breaks:** Mobile design broken.

#### Tablet (768px width)
- [ ] Open app on tablet
- [ ] Layout adjusts properly
- [ ] Sidebar visible
- [ ] Content readable
- [ ] All buttons work
- [ ] Audio plays
- [ ] Visualizer renders

**If any element breaks:** Tablet design broken.

#### Desktop (1920px width)
- [ ] Open app on desktop
- [ ] Full layout visible
- [ ] Sidebar visible
- [ ] Content readable
- [ ] All buttons work
- [ ] Audio plays
- [ ] Visualizer renders

**If any element breaks:** Desktop design broken.

---

### Phase 6: Quick Actions (CRITICAL)

#### ContentLibrary Quick Actions
- [ ] Upload audio
- [ ] Wait for processing
- [ ] **"Edit Lyrics" button appears** ← CRITICAL
- [ ] Click it
- [ ] Navigate to LyricBook
- [ ] **"Create Visual" button appears** ← CRITICAL
- [ ] Click it
- [ ] Navigate to VisualizerStudio

**If buttons don't appear:** Quick actions broken.

#### LyricBook Quick Actions
- [ ] In LyricBook with lyrics
- [ ] **"Create Kinetic Video" button visible** ← CRITICAL
- [ ] Click it
- [ ] Navigate to VisualizerStudio
- [ ] **"Add to Content Kit" button visible** ← CRITICAL
- [ ] Click it
- [ ] Navigate to ContentKit

**If buttons don't appear:** Quick actions broken.

#### VisualizerStudio Quick Actions
- [ ] In VisualizerStudio with visual
- [ ] **"Add to Content Kit" button visible** ← CRITICAL
- [ ] Click it
- [ ] Navigate to ContentKit
- [ ] **"Add to Bio" button visible** ← CRITICAL
- [ ] Click it
- [ ] Navigate to LinkVault

**If buttons don't appear:** Quick actions broken.

---

### Phase 7: Complete Workflow (CRITICAL)

#### Full End-to-End Test
1. [ ] Upload audio in ContentHub
2. [ ] Wait for processing
3. [ ] Go to LyricBook
4. [ ] **Lyrics appear** ← CRITICAL
5. [ ] Click "Create Visual"
6. [ ] Go to VisualizerStudio
7. [ ] **Audio plays** ← CRITICAL
8. [ ] Customize DSP settings
9. [ ] **Visual changes dramatically** ← CRITICAL
10. [ ] Click "Add to Content Kit"
11. [ ] Go to ContentKit
12. [ ] **Visual appears** ← CRITICAL
13. [ ] Click "Add to Bio"
14. [ ] Go to LinkVault
15. [ ] **Visual in bio** ← CRITICAL
16. [ ] Export video
17. [ ] **Video downloads with proof hash** ← CRITICAL

**If any step fails:** System is broken.

---

## Scoring

### Critical Failures (System is Broken)
- Transcription doesn't work
- Audio doesn't persist
- Visual changes aren't vivid
- Proof hash missing
- Quick actions don't work
- Responsive design breaks
- Any step in workflow fails

**If ANY critical failure occurs: STOP. Fix it before continuing.**

### Non-Critical Issues (Can be Fixed Later)
- Minor UI tweaks
- Animation smoothness
- Performance optimization
- Additional features

---

## What to Do If Tests Fail

### If Transcription Fails
1. Check browser console for errors
2. Verify Web Speech API is supported
3. Check if audio file is valid
4. Try different audio file
5. Check ProfileContext ingest pipeline

### If Audio Doesn't Persist
1. Check if audio element is in DOM
2. Verify togglePlay() is wired correctly
3. Check if activeMediaId is being set
4. Verify globalAudioRef is accessible
5. Check browser console for errors

### If Visual Changes Aren't Vivid
1. Check MetabolicVisualizer.ts
2. Verify DSP parameters are being applied
3. Check if THREE.js is rendering
4. Verify shader uniforms are updating
5. Check browser console for WebGL errors

### If Proof Hash is Missing
1. Check ART_CanvasHasher.ts
2. Verify SHA-256 is computing
3. Check if hash is being embedded
4. Verify filename includes hash
5. Check browser console for errors

### If Quick Actions Don't Work
1. Check if buttons are rendering
2. Verify navigate() is imported
3. Check if onClick handlers are wired
4. Verify routes exist
5. Check browser console for errors

---

## Success Criteria

**ALL of the following must be true:**

✅ Transcription works end-to-end
✅ Audio persists across all screens
✅ Visual changes are vivid and noticeable
✅ Proof hash is generated and embedded
✅ Quick actions connect all pages
✅ Responsive design works on all screens
✅ Complete workflow functions seamlessly

**If ANY of these is false: The system is broken.**

---

## The Bottom Line

**If everything doesn't work perfectly, it's worthless.**

**If the visual changes aren't vivid, it's pointless.**

**If the proof isn't mathematical, it's just another visualizer.**

**VEKTR is all three. Or it's nothing.**

**Test everything. Verify everything. Accept nothing less than perfection.**
