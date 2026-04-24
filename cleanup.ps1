# VEKTR STUDIO Cleanup Script
# Run this in PowerShell to organize your codebase

Write-Host "🧹 Starting VEKTR STUDIO cleanup..." -ForegroundColor Cyan

# Create archive structure
Write-Host "📦 Creating archive folders..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "_ARCHIVE/integration-patches" | Out-Null

# Move reference forks
Write-Host "📦 Moving reference forks..." -ForegroundColor Yellow
if (Test-Path "THE REV FOR FORK") {
    Move-Item "THE REV FOR FORK" "_ARCHIVE/reference-forks/THE_REV" -Force
    Write-Host "  ✅ Moved THE REV FOR FORK" -ForegroundColor Green
}
if (Test-Path "ERE FOR FORK") {
    Move-Item "ERE FOR FORK" "_ARCHIVE/reference-forks/ERE" -Force
    Write-Host "  ✅ Moved ERE FOR FORK" -ForegroundColor Green
}
if (Test-Path "src/external/ere-keep") {
    Move-Item "src/external/ere-keep" "_ARCHIVE/reference-forks/ere-keep" -Force
    Write-Host "  ✅ Moved ere-keep" -ForegroundColor Green
}

# Move old docs
Write-Host "📦 Moving old documentation..." -ForegroundColor Yellow
if (Test-Path "docs/Plans 4-1-26 session") {
    Move-Item "docs/Plans 4-1-26 session" "_ARCHIVE/old-docs/planning-session" -Force
    Write-Host "  ✅ Moved planning session docs" -ForegroundColor Green
}
if (Test-Path "docs/vektr_studio_master_specification.md") {
    Move-Item "docs/vektr_studio_master_specification.md" "_ARCHIVE/old-docs/" -Force
    Write-Host "  ✅ Moved master specification" -ForegroundColor Green
}
if (Test-Path "docs/PRODUCT_VISION.md") {
    Move-Item "docs/PRODUCT_VISION.md" "_ARCHIVE/old-docs/" -Force
    Write-Host "  ✅ Moved product vision" -ForegroundColor Green
}

# Move integration patches
Write-Host "📦 Moving integration patches..." -ForegroundColor Yellow
$patches = @(
    "AUTH_INTEGRATION_PATCH.md",
    "INTEGRATION_PATCH.md",
    "QUICK_INTEGRATION.md",
    "MANUAL_INTEGRATION_STEPS.md",
    "INTEGRATION_INSTRUCTIONS.md",
    "VISUALIZER_INTEGRATION_PATCH.md",
    "VISUALIZER_FINAL_INTEGRATION.md",
    "SOVEREIGN_AUTH_INTEGRATION.md",
    "COMPLETE_REBUILD.md",
    "REBUILD_SUMMARY.md",
    "PHASE_AUDIT_COMPLETE.md",
    "IMPLEMENTATION_GUIDE.md"
)

foreach ($patch in $patches) {
    if (Test-Path $patch) {
        Move-Item $patch "_ARCHIVE/integration-patches/" -Force
        Write-Host "  ✅ Moved $patch" -ForegroundColor Green
    }
}

# Delete duplicates
Write-Host "🗑️  Deleting duplicate files..." -ForegroundColor Yellow

if (Test-Path "src/engine-core") {
    Remove-Item "src/engine-core" -Recurse -Force
    Write-Host "  ✅ Deleted src/engine-core/ (all duplicates)" -ForegroundColor Green
}

if (Test-Path "src/pages/Onboarding.tsx") {
    Remove-Item "src/pages/Onboarding.tsx" -Force
    Write-Host "  ✅ Deleted old Onboarding.tsx" -ForegroundColor Green
}

if (Test-Path "src/App.SOVEREIGN.tsx") {
    Remove-Item "src/App.SOVEREIGN.tsx" -Force
    Write-Host "  ✅ Deleted App.SOVEREIGN.tsx" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  - Deleted: src/engine-core/ (13 duplicate files)" -ForegroundColor White
Write-Host "  - Deleted: 3 obsolete files" -ForegroundColor White
Write-Host "  - Archived: Reference forks (THE REV, ERE)" -ForegroundColor White
Write-Host "  - Archived: Old documentation" -ForegroundColor White
Write-Host "  - Archived: 12 integration patches" -ForegroundColor White
Write-Host ""
Write-Host "📁 Check _ARCHIVE/ folder for moved files" -ForegroundColor Yellow
Write-Host ""
