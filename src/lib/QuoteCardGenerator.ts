/**
 * Quote Card Generator
 * 
 * Generates shareable social media quote cards from lyric snippets.
 * Creates high-quality PNG images with artist branding.
 */

export interface QuoteCardStyle {
  background: string;
  textColor: string;
  accentColor: string;
  font: string;
  layout: 'minimal' | 'bold' | 'artistic' | 'modern';
}

export interface QuoteCardOptions {
  quote: string;
  artist: string;
  trackTitle?: string;
  style?: QuoteCardStyle;
  logoUrl?: string;
  width?: number;
  height?: number;
}

const DEFAULT_STYLES: Record<string, QuoteCardStyle> = {
  minimal: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    textColor: '#ffffff',
    accentColor: '#f59e0b',
    font: 'Inter, sans-serif',
    layout: 'minimal',
  },
  bold: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    textColor: '#000000',
    accentColor: '#ffffff',
    font: 'Inter, sans-serif',
    layout: 'bold',
  },
  artistic: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    textColor: '#ffffff',
    accentColor: '#a78bfa',
    font: 'Georgia, serif',
    layout: 'artistic',
  },
  modern: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    textColor: '#e2e8f0',
    accentColor: '#38bdf8',
    font: 'Inter, sans-serif',
    layout: 'modern',
  },
};

/**
 * Generate a quote card image as a Blob
 */
export async function generateQuoteCard(options: QuoteCardOptions): Promise<Blob> {
  const {
    quote,
    artist,
    trackTitle,
    style = DEFAULT_STYLES.minimal,
    logoUrl,
    width = 1080,
    height = 1080,
  } = options;

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (style.background.includes('gradient')) {
    // Parse gradient colors
    const colors = style.background.match(/#[0-9a-f]{6}/gi) || ['#1a1a1a', '#2d2d2d'];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = style.background;
  }
  ctx.fillRect(0, 0, width, height);

  // Add subtle noise texture
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
  }
  ctx.globalAlpha = 1;

  // Draw quote
  ctx.fillStyle = style.textColor;
  ctx.font = `bold ${width * 0.06}px ${style.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Word wrap quote
  const maxWidth = width * 0.8;
  const words = quote.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Draw quote lines
  const lineHeight = width * 0.08;
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  // Draw quotation marks
  ctx.fillStyle = style.accentColor;
  ctx.globalAlpha = 0.2;
  ctx.font = `bold ${width * 0.15}px ${style.font}`;
  ctx.fillText('"', width * 0.15, height * 0.25);
  ctx.fillText('"', width * 0.85, height * 0.75);
  ctx.globalAlpha = 1;

  // Draw artist info
  ctx.fillStyle = style.accentColor;
  ctx.font = `600 ${width * 0.035}px ${style.font}`;
  ctx.textAlign = 'center';
  
  const artistY = height * 0.85;
  ctx.fillText(artist.toUpperCase(), width / 2, artistY);
  
  if (trackTitle) {
    ctx.fillStyle = style.textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = `400 ${width * 0.025}px ${style.font}`;
    ctx.fillText(trackTitle, width / 2, artistY + width * 0.045);
    ctx.globalAlpha = 1;
  }

  // Draw logo if provided
  if (logoUrl) {
    try {
      const img = await loadImage(logoUrl);
      const logoSize = width * 0.1;
      ctx.globalAlpha = 0.8;
      ctx.drawImage(img, width - logoSize - 40, 40, logoSize, logoSize);
      ctx.globalAlpha = 1;
    } catch (e) {
      console.warn('Failed to load logo:', e);
    }
  }

  // Draw VEKTR watermark
  ctx.fillStyle = style.textColor;
  ctx.globalAlpha = 0.3;
  ctx.font = `600 ${width * 0.02}px ${style.font}`;
  ctx.textAlign = 'right';
  ctx.fillText('VEKTR', width - 40, height - 40);
  ctx.globalAlpha = 1;

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate image'));
    }, 'image/png', 1.0);
  });
}

/**
 * Helper to load image from URL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Download quote card as PNG
 */
export async function downloadQuoteCard(options: QuoteCardOptions, filename?: string) {
  const blob = await generateQuoteCard(options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${options.artist}-quote.png`;
  a.click();
  URL.revokeObjectURL(url);
}
