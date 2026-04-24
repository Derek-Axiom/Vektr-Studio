# CLEANUP GUIDE - Files to Archive/Delete

## 🗑️ SAFE TO DELETE (Duplicates/Obsolete)

### Duplicate Files (Keep ONE, delete the rest):

**src/engine-core/** - ENTIRE FOLDER IS DUPLICATE
- ❌ `src/engine-core/App.tsx` (duplicate of `src/App.tsx`)
- ❌ `src/engine-core/Onboarding.tsx` (replaced by `src/pages/SovereignOnboarding.tsx`)
- ❌ `src/engine-core/Dashboard.tsx` (duplicate of `src/pages/Dashboard.tsx`)
- ❌ `src/engine-core/ContentLibrary.tsx` (duplicate of `src/pages/ContentLibrary.tsx`)
- ❌ `src/engine-core/ContentDetail.tsx` (duplicate of `src/pages/ContentDetail.tsx`)
- ❌ `src/engine-core/VisualizerStudio.tsx` (duplicate of `src/pages/VisualizerStudio.tsx`)
- ❌ `src/engine-core/LyricBook.tsx` (duplicate of `src/pages/LyricBook.tsx`)
- ❌ `src/engine-core/MobileStudio.tsx` (duplicate of `src/pages/MobileStudio.tsx`)
- ❌ `src/engine-core/SamplerStudio.tsx` (duplicate of `src/pages/SamplerStudio.tsx`)
- ❌ `src/engine-core/TunerStudio.tsx` (duplicate of `src/pages/TunerStudio.tsx`)
- ❌ `src/engine-core/LinkVault.tsx` (duplicate of `src/pages/LinkVault.tsx`)
- ❌ `src/engine-core/VektrLab.tsx` (duplicate of `src/pages/VektrLab.tsx`)
- ❌ `src/engine-core/ContentKit.tsx` (duplicate of `src/pages/ContentKit.tsx`)
- ❌ `src/engine-core/router.tsx` (duplicate of `src/lib/router.tsx`)
- ❌ `src/engine-core/main.tsx` (duplicate of `src/main.tsx`)
- ❌ `src/engine-core/index.css` (duplicate of `src/index.css`)

**Recommendation:** DELETE ENTIRE `src/engine-core/` FOLDER

---

### Obsolete Onboarding:
- ❌ `src/pages/Onboarding.tsx` (replaced by `SovereignOnboarding.tsx`)
- ❌ `src/engine-core/Onboarding.tsx` (duplicate + obsolete)

---

### Temporary Integration Files:
- ❌ `src/App.SOVEREIGN.tsx` (was just a reference, App.tsx is updated)
- ❌ `AUTH_INTEGRATION_PATCH.md` (integration complete)
- ❌ `INTEGRATION_PATCH.md` (integration complete)
- ❌ `QUICK_INTEGRATION.md` (integration complete)
- ❌ `MANUAL_INTEGRATION_STEPS.md` (integration complete)
- ❌ `INTEGRATION_INSTRUCTIONS.md` (integration complete)
- ❌ `VISUALIZER_INTEGRATION_PATCH.md` (integration complete)
- ❌ `VISUALIZER_FINAL_INTEGRATION.md` (integration complete)
- ❌ `SOVEREIGN_AUTH_INTEGRATION.md` (integration complete)

---

### Old Documentation (Superseded):
- ❌ `COMPLETE_REBUILD.md` (rebuild is done)
- ❌ `REBUILD_SUMMARY.md` (rebuild is done)
- ❌ `PHASE_AUDIT_COMPLETE.md` (audit is done)
- ❌ `IMPLEMENTATION_GUIDE.md` (implementation is done)

---

## 📦 MOVE TO ARCHIVE (Reference Material)

### Reference Forks (Keep for reference, move to _ARCHIVE):
- 📦 `THE REV FOR FORK/` → `_ARCHIVE/reference-forks/THE_REV/`
- 📦 `ERE FOR FORK/` → `_ARCHIVE/reference-forks/ERE/`
- 📦 `src/external/ere-keep/` → `_ARCHIVE/reference-forks/ere-keep/`

### Old Docs (Keep for reference, move to _ARCHIVE):
- 📦 `docs/Plans 4-1-26 session/` → `_ARCHIVE/old-docs/planning-session/`
- 📦 `docs/vektr_studio_master_specification.md` → `_ARCHIVE/old-docs/`
- 📦 `docs/PRODUCT_VISION.md` → `_ARCHIVE/old-docs/`

---

## ✅ KEEP (Active/Important)

### Root Documentation:
- ✅ `README.md` (main docs)
- ✅ `QUICK_START.md` (user guide)
- ✅ `FAQ.md` (user guide)
- ✅ `COPYRIGHT_PROTECTION.md` (user guide)
- ✅ `TROUBLESHOOTING.md` (user guide)
- ✅ `PRIVACY_POLICY.md` (legal)
- ✅ `TERMS_OF_SERVICE.md` (legal)
- ✅ `ARCHITECTURE.md` (technical)
- ✅ `SECURITY.md` (technical)
- ✅ `DOCUMENTATION_MANIFEST.md` (index)

### Integration Docs (Keep for now):
- ✅ `THEREV_INTEGRATION_COMPLETE.md` (reference)
- ✅ `ERE_INTEGRATION.md` (reference)

### Source Code:
- ✅ `src/` (all active code)
- ✅ `src/lib/` (all libraries)
- ✅ `src/pages/` (all pages)
- ✅ `src/components/` (all components)

### Config:
- ✅ `package.json`
- ✅ `vite.config.ts`
- ✅ `tsconfig.json`
- ✅ `.gitignore`
- ✅ `capacitor.config.ts`

---

## 🔧 CLEANUP COMMANDS

### Step 1: Create Archive Folders
```bash
mkdir _ARCHIVE
mkdir _ARCHIVE/deprecated-code
mkdir _ARCHIVE/old-docs
mkdir _ARCHIVE/reference-forks
mkdir _ARCHIVE/integration-patches
```

### Step 2: Move Reference Forks
```bash
move "THE REV FOR FORK" "_ARCHIVE/reference-forks/THE_REV"
move "ERE FOR FORK" "_ARCHIVE/reference-forks/ERE"
move "src/external/ere-keep" "_ARCHIVE/reference-forks/ere-keep"
```

### Step 3: Move Old Docs
```bash
move "docs/Plans 4-1-26 session" "_ARCHIVE/old-docs/planning-session"
move "docs/vektr_studio_master_specification.md" "_ARCHIVE/old-docs/"
move "docs/PRODUCT_VISION.md" "_ARCHIVE/old-docs/"
```

### Step 4: Move Integration Patches
```bash
move AUTH_INTEGRATION_PATCH.md _ARCHIVE/integration-patches/
move INTEGRATION_PATCH.md _ARCHIVE/integration-patches/
move QUICK_INTEGRATION.md _ARCHIVE/integration-patches/
move MANUAL_INTEGRATION_STEPS.md _ARCHIVE/integration-patches/
move INTEGRATION_INSTRUCTIONS.md _ARCHIVE/integration-patches/
move VISUALIZER_INTEGRATION_PATCH.md _ARCHIVE/integration-patches/
move VISUALIZER_FINAL_INTEGRATION.md _ARCHIVE/integration-patches/
move SOVEREIGN_AUTH_INTEGRATION.md _ARCHIVE/integration-patches/
move COMPLETE_REBUILD.md _ARCHIVE/integration-patches/
move REBUILD_SUMMARY.md _ARCHIVE/integration-patches/
move PHASE_AUDIT_COMPLETE.md _ARCHIVE/integration-patches/
move IMPLEMENTATION_GUIDE.md _ARCHIVE/integration-patches/
```

### Step 5: Delete Duplicates
```bash
# DELETE ENTIRE engine-core FOLDER (it's all duplicates)
rmdir /s src\engine-core

# Delete obsolete onboarding
del src\pages\Onboarding.tsx

# Delete temporary reference file
del src\App.SOVEREIGN.tsx
```

---

## 📊 BEFORE/AFTER

### Before Cleanup:
- **Total files:** ~500+
- **Duplicate pages:** 13 files in engine-core
- **Old docs:** 20+ markdown files
- **Integration patches:** 12 files
- **Reference forks:** 2 large folders

### After Cleanup:
- **Active code:** src/ (clean)
- **Documentation:** 10 essential docs
- **Archive:** Everything else (organized)
- **Total reduction:** ~60% fewer files in root

---

## ⚠️ IMPORTANT NOTES

### DO NOT DELETE:
- ❌ `src/lib/` (all active libraries)
- ❌ `src/pages/` (all active pages)
- ❌ `src/components/` (all active components)
- ❌ `node_modules/` (dependencies)
- ❌ `.git/` (version control)
- ❌ `public/` (assets)
- ❌ `android/` (mobile build)

### SAFE TO DELETE:
- ✅ `src/engine-core/` (entire folder - all duplicates)
- ✅ `src/pages/Onboarding.tsx` (replaced)
- ✅ `src/App.SOVEREIGN.tsx` (temporary reference)
- ✅ All integration patch .md files (integration complete)

### MOVE TO ARCHIVE:
- 📦 Reference forks (THE REV, ERE)
- 📦 Old planning docs
- 📦 Integration patches (for reference)

---

## 🎯 RECOMMENDED ACTION

**Run this PowerShell script:**

```powershell
# Create archive structure
New-Item -ItemType Directory -Force -Path "_ARCHIVE/deprecated-code"
New-Item -ItemType Directory -Force -Path "_ARCHIVE/old-docs"
New-Item -ItemType Directory -Force -Path "_ARCHIVE/reference-forks"
New-Item -ItemType Directory -Force -Path "_ARCHIVE/integration-patches"

# Move reference forks
Move-Item "THE REV FOR FORK" "_ARCHIVE/reference-forks/THE_REV" -Force
Move-Item "ERE FOR FORK" "_ARCHIVE/reference-forks/ERE" -Force

# Move old docs
Move-Item "docs/Plans 4-1-26 session" "_ARCHIVE/old-docs/planning-session" -Force

# Move integration patches
Move-Item "*INTEGRATION*.md" "_ARCHIVE/integration-patches/" -Force
Move-Item "*REBUILD*.md" "_ARCHIVE/integration-patches/" -Force
Move-Item "*PATCH*.md" "_ARCHIVE/integration-patches/" -Force
Move-Item "PHASE_AUDIT_COMPLETE.md" "_ARCHIVE/integration-patches/" -Force
Move-Item "IMPLEMENTATION_GUIDE.md" "_ARCHIVE/integration-patches/" -Force

# Delete duplicates
Remove-Item "src/engine-core" -Recurse -Force
Remove-Item "src/pages/Onboarding.tsx" -Force
Remove-Item "src/App.SOVEREIGN.tsx" -Force

Write-Host "✅ Cleanup complete! Check _ARCHIVE/ folder for moved files."
```

---

**Want me to create this as a runnable script?**
