# Troubleshooting Guide

Common issues and solutions.

---

## Authentication Issues

### "Email already registered"

**Problem:** You're trying to sign up with an email that's already in use.

**Solution:**
- Click "Log In" tab instead
- Enter your email and password
- If you forgot your password, use your recovery key

### "Invalid password"

**Problem:** The password you entered doesn't match the one on file.

**Solution:**
- Double-check your password (case-sensitive)
- Try your recovery key if you forgot your password
- Make sure Caps Lock is off

### "Account not found"

**Problem:** No account exists with that email.

**Solution:**
- Check your email spelling
- Try signing up instead
- Check if you used a different email

### I forgot my password

**Solution:**
1. Go to onboarding
2. Click "Forgot Password?" (if available)
3. Enter your email + recovery key
4. Set a new password

**If you lost your recovery key:** You cannot recover your account. You'll need to create a new identity.

---

## Upload Issues

### Track won't upload

**Possible causes:**
- File format not supported
- File too large (max 100MB)
- Browser storage full
- Network issue (for transcription)

**Solutions:**
1. Check file format (MP3, WAV, M4A, OGG, FLAC)
2. Check file size (compress if > 100MB)
3. Clear browser cache: Settings → Privacy → Clear browsing data
4. Try a different browser
5. Check internet connection

### Upload stuck at "Processing"

**Problem:** Analysis pipeline stalled.

**Solution:**
1. Refresh the page
2. Track should appear as "Ready" (processing state is cleared on reload)
3. If still stuck, delete and re-upload

### Transcription failed

**Possible causes:**
- No vocals in track
- Network issue
- API rate limit

**Solutions:**
1. Check that your track has vocals
2. Check internet connection
3. Wait a few minutes and try again
4. Manually enter lyrics in Lyric Book

---

## Visualizer Issues

### Visualizer won't load

**Possible causes:**
- WebGL not supported
- Graphics drivers outdated
- Browser compatibility

**Solutions:**
1. Check WebGL support: Visit [get.webgl.org](https://get.webgl.org)
2. Update graphics drivers
3. Try Chrome or Edge (best WebGL support)
4. Reduce complexity setting

### Visualizer is laggy

**Solutions:**
1. Close other browser tabs
2. Reduce visualizer complexity (Settings)
3. Switch to simpler mode (Matrix or Cosmic)
4. Lower your screen resolution
5. Use a device with better GPU

### Black screen in visualizer

**Solutions:**
1. Check browser console for errors (F12)
2. Refresh the page
3. Try a different visualizer mode
4. Update your browser

### Colors look wrong

**This is intentional!** Colors are deterministically generated from your identity. Same identity = same colors, always.

**To change colors:**
- Use a different visualizer mode
- Adjust color settings (if available)
- Create a new session (different timestamp = different colors)

---

## Audio Issues

### No sound when playing

**Solutions:**
1. Check volume (browser + system)
2. Check that track is selected
3. Check browser permissions (allow audio)
4. Try a different browser
5. Check audio output device

### Audio is distorted

**Possible causes:**
- DSP settings too extreme
- Sample rate mismatch
- Clipping

**Solutions:**
1. Reset DSP settings to default
2. Reduce gain/volume
3. Check "Sample Rate Alert" warning
4. Disable effects one by one to find culprit

### "Sample Rate Alert" warning

**Problem:** Your audio hardware changed mid-session (USB interface, Bluetooth headphones).

**Solution:**
1. Stop playback
2. Disconnect/reconnect audio device
3. Refresh the page
4. Resume playback

---

## Export Issues

### Export failed

**Solutions:**
1. Check browser storage space
2. Try exporting at lower quality
3. Try a different format
4. Close other tabs
5. Refresh and try again

### Export is too large

**Solutions:**
1. Reduce video resolution (1080p → 720p)
2. Reduce frame rate (60fps → 30fps)
3. Shorten the video
4. Use a more efficient format (MP4 instead of MOV)

---

## Performance Issues

### Browser is slow

**Solutions:**
1. Close unused tabs
2. Clear browser cache
3. Disable browser extensions
4. Restart browser
5. Use Chrome or Edge (best performance)

### Out of memory error

**Solutions:**
1. Close other applications
2. Reduce visualizer complexity
3. Delete unused tracks from vault
4. Clear browser cache
5. Use a device with more RAM

---

## Data Issues

### My tracks disappeared

**Possible causes:**
- Browser data was cleared
- Different browser/device
- IndexedDB corruption

**Solutions:**
1. Check if you're logged in (same email)
2. Check if you're on the same device
3. Import your identity backup (if you have one)
4. Check browser console for errors

### Can't delete a track

**Solutions:**
1. Refresh the page
2. Try again
3. Check browser console for errors
4. Clear browser cache

---

## Mobile Issues

### Recording doesn't work on mobile

**Problem:** Mobile browsers have limited microphone access.

**Solution:**
- Use Chrome on Android (best support)
- Use Safari on iOS
- Grant microphone permissions when prompted
- Try desktop instead

### Visualizer doesn't work on mobile

**Problem:** Mobile GPUs are less powerful.

**Solution:**
- Use simpler visualizer modes
- Reduce complexity
- Use desktop for best experience

---

## Browser-Specific Issues

### Chrome:
- Usually works best
- If issues: Clear cache, disable extensions

### Firefox:
- WebGL may be slower
- If issues: Enable WebGL in about:config

### Safari:
- Some features may be limited
- If issues: Update to latest version

### Edge:
- Usually works well (Chromium-based)
- If issues: Same as Chrome

---

## Still Having Issues?

### Check Browser Console:
1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Look for red error messages
4. Copy the error and email to support

### Report a Bug:
1. Go to [GitLab Issues](https://gitlab.com/AXIOM RECURSE TECH./00_vektr_studio/-/issues)
2. Click "New Issue"
3. Describe the problem
4. Include:
   - Browser version
   - Operating system
   - Steps to reproduce
   - Console errors (if any)

### Contact Support:
- **Email:** support@axiometric.tech
- **Response time:** Usually within 24 hours

---

## Known Issues

### Current Limitations:

- **No cloud sync** (tracks are local to each device)
- **No collaboration** (multi-user editing coming soon)
- **No mobile app** (web-only for now)
- **Limited export formats** (MP4 only for now)

**These features are on the roadmap!**

---

**Most issues can be solved by refreshing the page or clearing browser cache. If not, reach out to support - we're here to help!**
