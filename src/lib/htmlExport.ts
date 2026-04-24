// Native SVG/DOM-to-Canvas Rendering Engine (Zero-Dependency)
// Achieves html2canvas parity using <foreignObject> cloning constraints.

export async function exportElementAsPNG(element: HTMLElement, filename: string): Promise<void> {
  // 1. Capture exact client dimensions
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  
  // 2. Deep clone the target subtree to avoid mutating the live DOM
  const clone = element.cloneNode(true) as HTMLElement;
  
  // 3. Ensure the clone maintains exact physical dimensions during isolated CSS rendering
  clone.style.width = width + 'px';
  clone.style.height = height + 'px';
  clone.style.margin = '0';
  clone.style.position = 'relative';

  // 4. Force image CORS compliance. 
  // SVGs render strictly. Any external HTTP image will instantly break the canvas taint layer.
  // We must convert all nested <img> tags into Base64 Data URIs before rendering.
  const images = clone.querySelectorAll('img');
  for (const img of Array.from(images)) {
    if (img.src && !img.src.startsWith('data:')) {
      try {
        // Fetch works for both blob: and http: URLs in the same origin
        const res = await fetch(img.src);
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
        
        // Ensure image properties are stripped of anything that blocks SVG rendering
        img.removeAttribute('crossorigin');
      } catch (e) {
        // Fallback: If blob: URL is revoked, attempt offscreen canvas extraction
        try {
          const fallbackCanvas = document.createElement('canvas');
          const naturalW = img.naturalWidth || 200;
          const naturalH = img.naturalHeight || 200;
          fallbackCanvas.width = naturalW;
          fallbackCanvas.height = naturalH;
          const fallbackCtx = fallbackCanvas.getContext('2d');
          if (fallbackCtx) {
            fallbackCtx.drawImage(img, 0, 0, naturalW, naturalH);
            img.src = fallbackCanvas.toDataURL('image/png');
          }
        } catch {
          console.warn('CORS strictly blocked image rasterization in ContentKit exporter:', img.src);
        }
      }
    }
  }

  // 5. Gather all active document stylesheets.
  // Since Tailwind is global, we inject all <style> blocks aggressively into the isolation container.
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(s => {
      // If it's an external link, we'd need to fetch, but for typical Vite/Tailwind, it's <style> blocks.
      return s.outerHTML;
    })
    .join('\n');

  // 6. Execute <foreignObject> SVG Isolation Wrap
  // This violently forces the browser engine to render the HTML using the native CSS Object Model.
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          ${styles}
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  // 7. Paint Target Setup (Scale heavily for '4K' output density scaling)
  const scale = 3; // Renders 3x native resolution for Retina/4K sharpness
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  // 8. Rasterize SVG to Canvas Memory Buffer
  const img = new Image();
  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      
      // 9. Force File System Push
      try {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', 1.0); // 100% Quality PNG
        link.click();
        resolve();
      } catch (err) {
        console.error('Tainted canvas blocked file export:', err);
        reject(err);
      }
    };
    
    img.onerror = (e) => {
      console.error('SVG Rasterization Engine Failed:', e);
      reject(e);
    };

    img.src = svgUrl;
  });
}
