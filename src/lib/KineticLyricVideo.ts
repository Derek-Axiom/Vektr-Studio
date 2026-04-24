/**
 * Kinetic Lyric Video Generator
 * 
 * Generates time-synced animated lyric videos with multiple animation presets.
 * Uses transcription segments for precise word-level timing.
 */

import type { MediaItem } from '../types';

export type AnimationPreset = 'fade' | 'slide' | 'bounce' | 'glitch' | 'typewriter' | 'zoom';

export interface KineticVideoOptions {
  track: MediaItem;
  lyrics: string;
  segments?: Array<{ text: string; start: number; end: number }>;
  preset: AnimationPreset;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontSize: number;
  width: number;
  height: number;
  fps: number;
}

export interface VideoFrame {
  canvas: HTMLCanvasElement;
  timestamp: number;
}

/**
 * Kinetic Lyric Video Renderer
 */
export class KineticLyricRenderer {
  private options: KineticVideoOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentSegmentIndex: number = 0;
  
  constructor(options: KineticVideoOptions) {
    this.options = options;
    this.canvas = document.createElement('canvas');
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  /**
   * Render a frame at a specific timestamp
   */
  renderFrame(currentTime: number): HTMLCanvasElement {
    const { width, height, backgroundColor, textColor, fontSize, preset, segments } = this.options;
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    if (!segments || segments.length === 0) {
      return this.canvas;
    }
    
    // Find active segments (current + context)
    const activeSegments = segments.filter(s => 
      currentTime >= s.start - 0.5 && currentTime <= s.end + 0.5
    );
    
    const currentSegment = segments.find(s => 
      currentTime >= s.start && currentTime < s.end
    );
    
    // Calculate animation progress for current segment
    const progress = currentSegment 
      ? (currentTime - currentSegment.start) / (currentSegment.end - currentSegment.start)
      : 0;
    
    // Render based on preset
    switch (preset) {
      case 'fade':
        this.renderFade(activeSegments, currentSegment, progress, currentTime);
        break;
      case 'slide':
        this.renderSlide(activeSegments, currentSegment, progress, currentTime);
        break;
      case 'bounce':
        this.renderBounce(activeSegments, currentSegment, progress, currentTime);
        break;
      case 'glitch':
        this.renderGlitch(activeSegments, currentSegment, progress, currentTime);
        break;
      case 'typewriter':
        this.renderTypewriter(activeSegments, currentSegment, progress, currentTime);
        break;
      case 'zoom':
        this.renderZoom(activeSegments, currentSegment, progress, currentTime);
        break;
    }
    
    return this.canvas;
  }
  
  private renderFade(
    activeSegments: Array<{ text: string; start: number; end: number }>,
    currentSegment: { text: string; start: number; end: number } | undefined,
    progress: number,
    currentTime: number
  ) {
    const { width, height, textColor, accentColor, fontSize } = this.options;
    const ctx = this.ctx;
    
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    activeSegments.forEach((segment, i) => {
      const isCurrent = segment === currentSegment;
      const isPast = currentTime > segment.end;
      const isFuture = currentTime < segment.start;
      
      // Calculate opacity
      let alpha = 1;
      if (isCurrent) {
        alpha = Math.min(1, progress * 3); // Fade in quickly
      } else if (isPast) {
        alpha = Math.max(0.3, 1 - (currentTime - segment.end) * 2); // Fade out slowly
      } else if (isFuture) {
        alpha = 0.2;
      }
      
      // Calculate position
      const y = height / 2 + (i - activeSegments.indexOf(currentSegment || activeSegments[0])) * (fontSize * 1.5);
      
      // Draw text
      ctx.fillStyle = isCurrent ? accentColor : textColor;
      ctx.globalAlpha = alpha;
      ctx.fillText(segment.text, width / 2, y);
      ctx.globalAlpha = 1;
    });
  }
  
  private renderSlide(
    activeSegments: Array<{ text: string; start: number; end: number }>,
    currentSegment: { text: string; start: number; end: number } | undefined,
    progress: number,
    currentTime: number
  ) {
    const { width, height, textColor, accentColor, fontSize } = this.options;
    const ctx = this.ctx;
    
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    activeSegments.forEach((segment, i) => {
      const isCurrent = segment === currentSegment;
      
      // Slide in from right
      const slideProgress = isCurrent ? easeOutCubic(Math.min(1, progress * 2)) : 1;
      const x = width / 2 + (1 - slideProgress) * width;
      const y = height / 2 + (i - activeSegments.indexOf(currentSegment || activeSegments[0])) * (fontSize * 1.5);
      
      ctx.fillStyle = isCurrent ? accentColor : textColor;
      ctx.globalAlpha = slideProgress;
      ctx.fillText(segment.text, x, y);
      ctx.globalAlpha = 1;
    });
  }
  
  private renderBounce(
    activeSegments: Array<{ text: string; start: number; end: number }>,
    currentSegment: { text: string; start: number; end: number } | undefined,
    progress: number,
    currentTime: number
  ) {
    const { width, height, textColor, accentColor, fontSize } = this.options;
    const ctx = this.ctx;
    
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    activeSegments.forEach((segment, i) => {
      const isCurrent = segment === currentSegment;
      
      // Bounce effect
      const bounceHeight = isCurrent ? Math.abs(Math.sin(progress * Math.PI * 2)) * 30 : 0;
      const scale = isCurrent ? 1 + Math.abs(Math.sin(progress * Math.PI * 2)) * 0.2 : 1;
      
      const y = height / 2 + (i - activeSegments.indexOf(currentSegment || activeSegments[0])) * (fontSize * 1.5) - bounceHeight;
      
      ctx.save();
      ctx.translate(width / 2, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = isCurrent ? accentColor : textColor;
      ctx.fillText(segment.text, 0, 0);
      ctx.restore();
    });
  }
  
  private renderGlitch(
    activeSegments: Array<{ text: string; start: number; end: number }>,
    currentSegment: { text: string; start: number; end: number } | undefined,
    progress: number,
    currentTime: number
  ) {
    const { width, height, textColor, accentColor, fontSize } = this.options;
    const ctx = this.ctx;
    
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    activeSegments.forEach((segment, i) => {
      const isCurrent = segment === currentSegment;
      const y = height / 2 + (i - activeSegments.indexOf(currentSegment || activeSegments[0])) * (fontSize * 1.5);
      
      if (isCurrent && progress < 0.3) {
        // Glitch effect during intro
        const glitchIntensity = (0.3 - progress) / 0.3;
        
        // RGB split
        ctx.fillStyle = '#ff0000';
        ctx.globalAlpha = glitchIntensity * 0.5;
        ctx.fillText(segment.text, width / 2 - 3, y);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillText(segment.text, width / 2 + 3, y);
        
        ctx.fillStyle = '#0000ff';
        ctx.fillText(segment.text, width / 2, y - 2);
        ctx.globalAlpha = 1;
      }
      
      // Main text
      ctx.fillStyle = isCurrent ? accentColor : textColor;
      ctx.fillText(segment.text, width / 2, y);
    });
  }
  
  private renderTypewriter(
    activeSegments: Array<{ text: string; start: number; end: number }>,
    currentSegment: { text: string; start: number; end: number } | undefined,
    progress: number,
    currentTime: number
  ) {
    const { width, height, textColor, accentColor, fontSize } = this.options;
    const ctx = this.ctx;
    
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    activeSegments.forEach((segment, i) => {
      const isCurrent = segment === currentSegment;
      const y = height / 2 + (i - activeSegments.indexOf(currentSegment || activeSegments[0])) * (fontSize * 1.5);
      
      let displayText = segment.text;
      if (isCurrent) {
        // Typewriter effect
        const charCount = Math.floor(progress * segment.text.length);
        displayText = segment.text.slice(0, charCount);
        
        // Blinking cursor
        if (Math.floor(currentTime * 2) % 2 === 0) {
          displayText += '|';
        }
      }
      
      ctx.fillStyle = isCurrent ? accentColor : textColor;
      ctx.fillText(displayText, width / 2, y);
    });
  }
  
  private renderZoom(
    activeSegments: Array<{ text: string; start: number; end: number }>,
    currentSegment: { text: string; start: number; end: number } | undefined,
    progress: number,
    currentTime: number
  ) {
    const { width, height, textColor, accentColor, fontSize } = this.options;
    const ctx = this.ctx;
    
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    activeSegments.forEach((segment, i) => {
      const isCurrent = segment === currentSegment;
      const y = height / 2 + (i - activeSegments.indexOf(currentSegment || activeSegments[0])) * (fontSize * 1.5);
      
      // Zoom in effect
      const scale = isCurrent ? easeOutBack(Math.min(1, progress * 1.5)) : 1;
      const alpha = isCurrent ? 1 : 0.5;
      
      ctx.save();
      ctx.translate(width / 2, y);
      ctx.scale(scale, scale);
      ctx.fillStyle = isCurrent ? accentColor : textColor;
      ctx.globalAlpha = alpha;
      ctx.fillText(segment.text, 0, 0);
      ctx.globalAlpha = 1;
      ctx.restore();
    });
  }
}

/**
 * Easing functions
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Export kinetic lyric video
 */
export async function exportKineticVideo(
  options: KineticVideoOptions,
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const renderer = new KineticLyricRenderer(options);
  const duration = options.track.duration || 120;
  const frameCount = Math.ceil(duration * options.fps);
  
  // Create video stream
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d')!;
  
  const stream = canvas.captureStream(options.fps);
  
  // Add audio track
  const audioContext = new AudioContext();
  const audioSource = audioContext.createMediaStreamDestination();
  const audioElement = new Audio(URL.createObjectURL(audioBlob));
  const mediaSource = audioContext.createMediaElementSource(audioElement);
  mediaSource.connect(audioSource);
  
  stream.addTrack(audioSource.stream.getAudioTracks()[0]);
  
  // Record video
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 8000000,
  });
  
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  
  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };
    
    recorder.onerror = reject;
    
    recorder.start();
    audioElement.play();
    
    let frameIndex = 0;
    const renderFrame = () => {
      const currentTime = frameIndex / options.fps;
      
      if (currentTime >= duration) {
        recorder.stop();
        audioElement.pause();
        return;
      }
      
      const frame = renderer.renderFrame(currentTime);
      ctx.drawImage(frame, 0, 0);
      
      frameIndex++;
      if (onProgress) {
        onProgress(frameIndex / frameCount);
      }
      
      setTimeout(renderFrame, 1000 / options.fps);
    };
    
    renderFrame();
  });
}
