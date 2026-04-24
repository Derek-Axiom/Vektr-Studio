# Deployment Guide

**How to deploy VEKTR STUDIO to production.**

---

## Quick Deploy (Static Hosting)

VEKTR STUDIO is a static site - no server required.

### Option 1: GitLab Pages (Recommended)

**Setup:**
1. Push code to GitLab
2. Create `.gitlab-ci.yml`:

```yaml
pages:
  stage: deploy
  script:
    - npm install
    - npm run build
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - main
```

3. Push to `main` branch
4. GitLab automatically deploys to `https://yourusername.gitlab.io/00_vektr_studio`

**Custom domain:**
- Settings → Pages → New Domain
- Add DNS record: `CNAME yourdomain.com yourusername.gitlab.io`

---

### Option 2: Netlify

**Setup:**
1. Connect GitLab repo to Netlify
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Deploy

**Custom domain:**
- Domain settings → Add custom domain
- Update DNS records

---

### Option 3: Vercel

**Setup:**
1. Import GitLab repo
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

---

### Option 4: Cloudflare Pages

**Setup:**
1. Connect GitLab repo
2. Build command: `npm run build`
3. Build output: `dist`
4. Deploy

---

## Build Configuration

### Environment Variables

Create `.env.production`:

```bash
# OpenAI API Key (for transcription)
VITE_OPENAI_API_KEY=your_api_key_here

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Sentry (error tracking)
VITE_SENTRY_DSN=your_sentry_dsn
```

**Security:** Never commit `.env` files. Use platform environment variables instead.

---

### Build Optimization

**vite.config.ts:**

```typescript
export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'vendor': ['react', 'react-dom'],
        }
      }
    }
  }
});
```

---

## Performance Optimization

### 1. Enable Compression

**Netlify/Vercel:** Automatic

**GitLab Pages:** Add to `.gitlab-ci.yml`:
```yaml
script:
  - npm install
  - npm run build
  - gzip -r dist/
  - mv dist public
```

### 2. Add Caching Headers

**netlify.toml:**
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Optimize Images

```bash
npm install -D vite-plugin-imagemin
```

**vite.config.ts:**
```typescript
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: { plugins: [{ removeViewBox: false }] }
    })
  ]
});
```

---

## Mobile Deployment (Android)

### Build Android App:

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize
npx cap init

# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Configure Android:

**android/app/src/main/AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.INTERNET" />
```

### Build APK:

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Choose APK
3. Create keystore (save it!)
4. Build release APK

---

## CI/CD Pipeline

### GitLab CI/CD

**.gitlab-ci.yml:**

```yaml
stages:
  - test
  - build
  - deploy

# Run tests
test:
  stage: test
  script:
    - npm install
    - npm run lint
    - npm run type-check
  only:
    - merge_requests
    - main

# Build for production
build:
  stage: build
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main

# Deploy to GitLab Pages
pages:
  stage: deploy
  script:
    - mv dist public
  artifacts:
    paths:
      - public
  only:
    - main
```

---

## Monitoring & Analytics

### Option 1: Plausible (Privacy-Friendly)

```typescript
// src/lib/analytics.ts
export function trackPageView(page: string) {
  if (window.plausible) {
    window.plausible('pageview', { props: { page } });
  }
}
```

### Option 2: Self-Hosted Umami

```bash
docker run -d \
  --name umami \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  ghcr.io/umami-software/umami:postgresql-latest
```

---

## Security Checklist

Before deploying:

- [ ] Remove console.log statements (production)
- [ ] Enable HTTPS (required for Web Audio API)
- [ ] Set Content-Security-Policy headers
- [ ] Add rate limiting (if using APIs)
- [ ] Enable CORS (if needed)
- [ ] Audit dependencies (`npm audit`)
- [ ] Remove .env files from git
- [ ] Set up error tracking (Sentry)

---

## Post-Deployment

### 1. Test Everything:
- [ ] Sign up flow
- [ ] Login flow
- [ ] Upload track
- [ ] Generate visualizer
- [ ] Export video
- [ ] Mobile compatibility

### 2. Monitor Performance:
- [ ] Lighthouse score (aim for 90+)
- [ ] Core Web Vitals
- [ ] Error rates
- [ ] API usage

### 3. Set Up Backups:
- [ ] Database backups (if using cloud sync)
- [ ] Code backups (GitLab already handles this)
- [ ] User data export feature

---

## Scaling Considerations

### Current Architecture:
- Client-side only
- No server costs
- Unlimited users (static hosting)
- Limited by browser storage (~5GB per user)

### Future Scaling:
- Add cloud storage (Firebase/Supabase)
- Add server-side rendering (for exports)
- Add CDN (for faster asset delivery)
- Add load balancing (if needed)

---

## Troubleshooting Deployment

### Build fails:
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors
- Verify all imports are correct

### Site loads but features broken:
- Check browser console for errors
- Verify HTTPS is enabled
- Check CORS settings
- Verify API keys are set

### Mobile app crashes:
- Check Android permissions
- Verify Capacitor config
- Test on real device (not emulator)
- Check logcat for errors

---

## Custom Domain Setup

### DNS Configuration:

**For GitLab Pages:**
```
Type: A
Name: @
Value: 35.185.44.232

Type: CNAME
Name: www
Value: yourusername.gitlab.io
```

**For Netlify:**
```
Type: CNAME
Name: @
Value: yoursite.netlify.app
```

### SSL Certificate:

All platforms provide free SSL via Let's Encrypt. Enable in platform settings.

---

## Cost Estimate

### Free Tier (Recommended):
- **Hosting:** GitLab Pages (free)
- **Domain:** Namecheap (~$10/year)
- **SSL:** Let's Encrypt (free)
- **Total:** ~$10/year

### Paid Tier (Optional):
- **Hosting:** Netlify Pro ($19/month)
- **Cloud Storage:** Firebase ($25/month)
- **CDN:** Cloudflare Pro ($20/month)
- **Total:** ~$64/month

---

## Support

**Deployment issues?**
- Email: devops@axiometric.tech
- GitLab Issues: [Report deployment issue](https://gitlab.com/AXIOM RECURSE TECH./00_vektr_studio/-/issues)

---

**Ready to deploy? Start with GitLab Pages - it's free and takes 5 minutes.** 🚀
