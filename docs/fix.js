const fs = require('fs');
const path = require('path');

function processDir(dir) {
  let count = 0;
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      count += processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      let newContent = content
        // Strip out generic opacity classes from DOM nodes causing whole-block fading
        .replace(/\bopacity-(10|20|25|30|40|50|60|70)\b/g, '')

        // Strip background transparency fading
        .replace(/bg-\[var\(--color-bg-panel\)\]\/(30|40|50|60|70|80)/g, 'bg-[var(--color-bg-panel)]')

        // Solidify borders - grey thin borders are nearly invisible on white
        .replace(/border-white\/(5|10|20|30|40)/g, 'border-[var(--color-border-md)]')

        // Specific fix for the pulsing mic icon inline style
        .replace(/style={{ color: `rgba\(245,158,11,\$\{([^}]+)\}\)` }}/g, "style={{ opacity: $1 }} className=\"w-5 h-5 text-[var(--color-text)]\"")
        .replace(/color: `rgba\(245,158,11,\$\{([^\}]+)\}\)`/g, "color: 'var(--color-text)'")
        ;

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Stripped block opacity/border fading: ' + fullPath);
        count++;
      }
    }
  });
  return count;
}

const total = processDir('c:/00_vektr_studio/src');
console.log('Total files heavily contrast-adjusted: ' + total);
