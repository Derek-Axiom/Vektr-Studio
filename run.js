const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // 1. Ditch the transparent wrapping boxes that create pale states
  newContent = newContent.replace(/\bopacity-(10|20|30|40|50|60)\b/g, '');
  newContent = newContent.replace(/bg-\[var\(--color-bg-panel\)\]\/(30|40|50|60|70|80)/g, 'bg-[var(--color-bg-panel)]');

  // 2. Eradicate thin, unreadable grey borders
  newContent = newContent.replace(/border-white\/(5|10|40)/g, 'border-[var(--color-border-md)]');

  // 3. Hardcoded inline styles that cause pale washed colors (i.e. Mic pulse)
  newContent = newContent.replace(
    /style={{ color: `rgba\(245,158,11,\$\{([^}]+)\}\)` }}/g,
    'style={{ opacity: $1 }} className="w-5 h-5 text-[var(--color-text)]"'
  );

  // 4. Increase overall placeholder starkness so empty boxes are legible
  newContent = newContent.replace(/placeholder:text-\[var\(--color-text-muted\)\]/g, 'placeholder:text-[var(--color-text-body)]');
  newContent = newContent.replace(/placeholder:text-white\/(20|30|40)/g, 'placeholder:text-[var(--color-text-body)]');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed fading in: ' + filePath);
  }
}

function processDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

processDir('c:/00_vektr_studio/src/pages');
processDir('c:/00_vektr_studio/src/components');
