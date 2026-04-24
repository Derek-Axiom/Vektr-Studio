/**
 * VEKTR Kinetic Lyric Syncopation Engine
 * 
 * Identity-forged lyric animations that are mathematically impossible to replicate.
 * Every word movement, every color shift, every particle is derived from:
 * - Artist identity hash
 * - Track DNA (BPM, key, energy)
 * - Lyric content hash
 * - Session timestamp
 * 
 * The animation IS the copyright proof.
 */

import { DeterministicPRNG } from './DeterministicPRNG';
import type { DeterminismProof } from './ProofOfDeterminism';

export interface LyricIdentity {
  userId: string;
  trackId: string;
  lyricHash: string;
  sessionTimestamp: number;
  bpm: number;
  key: string;
  energy: number;
}

export interface KineticParams {
  // Typography (derived from identity)
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  
  // Color DNA
  textColors: string[];      // 5-color palette
  glowColors: string[];      // Glow effects
  backgroundGradient: string[];
  
  // Motion Signature
  entryAnimation: 'explode' | 'spiral' | 'wave' | 'quantum' | 'fractal';
  exitAnimation: 'dissolve' | 'implode' | 'scatter' | 'fade' | 'glitch';
  transitionCurve: string;   // CSS easing function
  
  // Particle Effects
  particleCount: number;
  particleSize: number;
  particleVelocity: number;
  
  // Syncopation (rhythm-locked)
  beatDivision: number;      // 4, 8, 16, 32
  offbeatTrigger: boolean;   // Trigger on offbeats
  accentPattern: number[];   // Which beats to accent (0-1 values)
  
  // Visual DNA
  signaturePattern: number[]; // 16-value identity signature
}

/**
 * Kinetic Lyric Syncopation Renderer
 */
export class KineticLyricSyncopator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private identity: LyricIdentity;
  private params: KineticParams;
  private prng: DeterministicPRNG;
  
  // Particle system
  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
  }> = [];
  
  constructor(
    canvas: HTMLCanvasElement,
    identity: LyricIdentity
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.identity = identity;
    
    // Initialize deterministic PRNG
    this.prng = new DeterministicPRNG(
      BigInt('0x' + this.hashString(identity.userId + identity.trackId)),
      BigInt('0x' + this.hashString(identity.lyricHash + identity.sessionTimestamp))
    );
    
    // Derive kinetic parameters from identity
    this.params = this.deriveKineticParams();
  }
  
  /**
   * Derive all animation parameters deterministically
   */
  private deriveKineticParams(): KineticParams {
    const { bpm, key, energy } = this.identity;
    
    // Typography from BPM
    const fontSize = 40 + Math.floor((bpm / 200) * 80); // 40-120px
    const fontWeight = bpm > 140 ? 900 : bpm > 100 ? 700 : 400;
    const letterSpacing = (bpm / 200) * 0.2; // 0-0.2em
    
    // Font family from key
    const fonts = ['Inter', 'Montserrat', 'Bebas Neue', 'Orbitron', 'Space Grotesk'];
    const fontFamily = fonts[this.keyToNumber(key) % fonts.length];
    
    // Color palette from PRNG
    const textColors = Array.from({ length: 5 }, () => 
      `hsl(${this.prng.nextInt(0, 360)}, ${this.prng.nextInt(70, 100)}%, ${this.prng.nextInt(60, 90)}%)`
    );
    
    const glowColors = textColors.map(color => {
      const hsl = this.parseHSL(color);
      return `hsl(${hsl.h}, 100%, 70%)`;
    });
    
    const backgroundGradient = [
      `hsl(${this.prng.nextInt(0, 360)}, 20%, 5%)`,
      `hsl(${this.prng.nextInt(0, 360)}, 30%, 10%)`,
    ];
    
    // Animation types from energy
    const entryAnimations: KineticParams['entryAnimation'][] = ['explode', 'spiral', 'wave', 'quantum', 'fractal'];
    const exitAnimations: KineticParams['exitAnimation'][] = ['dissolve', 'implode', 'scatter', 'fade', 'glitch'];
    
    const entryAnimation = entryAnimations[Math.floor(energy * entryAnimations.length)];
    const exitAnimation = exitAnimations[Math.floor(this.prng.next() * exitAnimations.length)];
    
    // Easing curve from BPM
    const transitionCurve = bpm > 140 
      ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // Elastic
      : bpm > 100
      ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Ease-out-quad
      : 'cubic-bezier(0.42, 0, 0.58, 1)'; // Ease-in-out
    
    // Particle system
    const particleCount = Math.floor(20 + energy * 80); // 20-100 particles
    const particleSize = 2 + this.prng.next() * 6;
    const particleVelocity = 0.5 + energy * 2;
    
    // Syncopation from BPM
    const beatDivision = bpm > 140 ? 16 : bpm > 100 ? 8 : 4;
    const offbeatTrigger = this.prng.nextBool(0.5);
    const accentPattern = Array.from({ length: beatDivision }, () => this.prng.next());
    
    // Visual DNA
    const signaturePattern = Array.from({ length: 16 }, () => this.prng.next());
    
    return {
      fontFamily,
      fontSize,
      fontWeight,
      letterSpacing,
      textColors,
      glowColors,
      backgroundGradient,
      entryAnimation,
      exitAnimation,
      transitionCurve,
      particleCount,
      particleSize,
      particleVelocity,
      beatDivision,
      offbeatTrigger,
      accentPattern,
      signaturePattern,
    };
  }
  
  /**
   * Render a frame with identity-forged animations
   */
  renderFrame(
    currentTime: number,
    segments: Array<{ text: string; start: number; end: number }>,
    audioData: { bass: number; mid: number; treble: number; amplitude: number }
  ): void {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    // Clear with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.params.backgroundGradient[0]);
    gradient.addColorStop(1, this.params.backgroundGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Find current segment
    const currentSegment = segments.find(s => 
      currentTime >= s.start && currentTime < s.end
    );
    
    if (!currentSegment) return;
    
    // Calculate progress
    const progress = (currentTime - currentSegment.start) / (currentSegment.end - currentSegment.start);
    
    // Render based on entry animation type
    switch (this.params.entryAnimation) {
      case 'explode':
        this.renderExplode(currentSegment, progress, audioData);
        break;
      case 'spiral':
        this.renderSpiral(currentSegment, progress, audioData);
        break;
      case 'wave':
        this.renderWave(currentSegment, progress, audioData);
        break;
      case 'quantum':
        this.renderQuantum(currentSegment, progress, audioData);
        break;
      case 'fractal':
        this.renderFractal(currentSegment, progress, audioData);
        break;
    }
    
    // Update and render particles
    this.updateParticles(audioData);
    this.renderParticles();
    
    // Render signature watermark
    this.renderSignatureWatermark(audioData.amplitude);
  }
  
  /**
   * EXPLODE: Words materialize from center explosion
   */
  private renderExplode(
    segment: { text: string; start: number; end: number },
    progress: number,
    audioData: { bass: number; mid: number; treble: number }
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const words = segment.text.split(' ');
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Entry phase (0-0.3): Explosion
    const entryProgress = Math.min(progress / 0.3, 1);
    const explosionRadius = this.easeOutQuart(entryProgress) * 200;
    
    // Active phase (0.3-0.7): Stable
    const activeProgress = Math.max(0, Math.min((progress - 0.3) / 0.4, 1));
    
    // Exit phase (0.7-1.0): Implode
    const exitProgress = Math.max(0, (progress - 0.7) / 0.3);
    
    ctx.font = `${this.params.fontWeight} ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    words.forEach((word, i) => {
      const angle = (i / words.length) * Math.PI * 2;
      const signatureValue = this.params.signaturePattern[i % 16];
      
      // Position based on phase
      let x, y, alpha, scale;
      
      if (progress < 0.3) {
        // Exploding from center
        x = centerX + Math.cos(angle) * explosionRadius * signatureValue;
        y = centerY + Math.sin(angle) * explosionRadius * signatureValue;
        alpha = entryProgress;
        scale = 0.5 + entryProgress * 0.5;
      } else if (progress < 0.7) {
        // Stable position
        const finalRadius = 150;
        x = centerX + Math.cos(angle) * finalRadius;
        y = centerY + Math.sin(angle) * finalRadius;
        alpha = 1;
        scale = 1 + audioData.bass * 0.2;
      } else {
        // Imploding to center
        const implodeRadius = 150 * (1 - exitProgress);
        x = centerX + Math.cos(angle) * implodeRadius;
        y = centerY + Math.sin(angle) * implodeRadius;
        alpha = 1 - exitProgress;
        scale = 1 - exitProgress * 0.5;
      }
      
      // Color from palette (cycles through)
      const colorIndex = i % this.params.textColors.length;
      const textColor = this.params.textColors[colorIndex];
      const glowColor = this.params.glowColors[colorIndex];
      
      // Draw glow
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha * 0.5;
      ctx.shadowBlur = 20 + audioData.treble * 40;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;
      ctx.fillText(word, 0, 0);
      ctx.restore();
      
      // Draw text
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = textColor;
      ctx.fillText(word, 0, 0);
      ctx.restore();
    });
  }
  
  /**
   * SPIRAL: Words spiral in from infinity
   */
  private renderSpiral(
    segment: { text: string; start: number; end: number },
    progress: number,
    audioData: { bass: number; mid: number; treble: number }
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const words = segment.text.split(' ');
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.font = `${this.params.fontWeight} ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    words.forEach((word, i) => {
      const wordProgress = Math.max(0, Math.min((progress - i * 0.1) / 0.3, 1));
      const spiralProgress = this.easeOutCubic(wordProgress);
      
      // Spiral mathematics
      const angle = spiralProgress * Math.PI * 4 + (i * Math.PI / 4);
      const radius = (1 - spiralProgress) * 500;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const alpha = spiralProgress;
      const scale = 0.3 + spiralProgress * 0.7;
      
      // Color shifts as it spirals
      const hue = (this.prng.nextInt(0, 360) + progress * 360) % 360;
      const textColor = `hsl(${hue}, 80%, 70%)`;
      const glowColor = `hsl(${hue}, 100%, 60%)`;
      
      // Glow
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha * 0.6;
      ctx.shadowBlur = 30 + audioData.mid * 50;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;
      ctx.fillText(word, 0, 0);
      ctx.restore();
      
      // Text
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = textColor;
      ctx.fillText(word, 0, 0);
      ctx.restore();
    });
  }
  
  /**
   * QUANTUM: Words exist in superposition, collapse on beat
   */
  private renderQuantum(
    segment: { text: string; start: number; end: number },
    progress: number,
    audioData: { bass: number; mid: number; treble: number }
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const words = segment.text.split(' ');
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate beat phase
    const beatDuration = 60 / this.identity.bpm;
    const beatPhase = (progress * (segment.end - segment.start) / beatDuration) % 1;
    const onBeat = beatPhase < 0.1;
    
    ctx.font = `${this.params.fontWeight} ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    words.forEach((word, i) => {
      const signatureValue = this.params.signaturePattern[i % 16];
      
      if (onBeat || progress < 0.2) {
        // Collapsed state (single position)
        const y = centerY + (i - words.length / 2) * (this.params.fontSize * 1.5);
        
        ctx.save();
        ctx.globalAlpha = 0.8 + audioData.bass * 0.2;
        ctx.fillStyle = this.params.textColors[i % this.params.textColors.length];
        ctx.shadowBlur = 20 + audioData.bass * 40;
        ctx.shadowColor = this.params.glowColors[i % this.params.glowColors.length];
        ctx.fillText(word, centerX, y);
        ctx.restore();
        
      } else {
        // Superposition state (multiple ghost positions)
        const ghostCount = 5;
        
        for (let g = 0; g < ghostCount; g++) {
          const ghostAngle = (g / ghostCount) * Math.PI * 2;
          const ghostRadius = 50 + signatureValue * 100;
          
          const x = centerX + Math.cos(ghostAngle) * ghostRadius;
          const y = centerY + (i - words.length / 2) * (this.params.fontSize * 1.5) + Math.sin(ghostAngle) * ghostRadius;
          
          ctx.save();
          ctx.globalAlpha = 0.2 + audioData.mid * 0.3;
          ctx.fillStyle = this.params.textColors[(i + g) % this.params.textColors.length];
          ctx.fillText(word, x, y);
          ctx.restore();
        }
      }
    });
  }
  
  /**
   * FRACTAL: Words recursively subdivide and reform
   */
  private renderFractal(
    segment: { text: string; start: number; end: number },
    progress: number,
    audioData: { bass: number; mid: number; treble: number }
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const words = segment.text.split(' ');
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.font = `${this.params.fontWeight} ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Fractal recursion depth based on progress
    const recursionDepth = Math.floor(progress * 3) + 1; // 1-4 levels
    
    words.forEach((word, i) => {
      this.renderFractalWord(
        word,
        centerX,
        centerY + (i - words.length / 2) * (this.params.fontSize * 1.5),
        1.0,
        recursionDepth,
        0,
        i,
        audioData
      );
    });
  }
  
  /**
   * Recursive fractal word rendering
   */
  private renderFractalWord(
    word: string,
    x: number,
    y: number,
    scale: number,
    depth: number,
    angle: number,
    wordIndex: number,
    audioData: { bass: number; mid: number; treble: number }
  ) {
    const ctx = this.ctx;
    
    if (depth === 0 || scale < 0.1) return;
    
    // Draw current level
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    
    const alpha = scale * (0.3 + audioData.amplitude * 0.7);
    ctx.globalAlpha = alpha;
    
    const colorIndex = (wordIndex + depth) % this.params.textColors.length;
    ctx.fillStyle = this.params.textColors[colorIndex];
    ctx.shadowBlur = 10 * scale + audioData.treble * 20;
    ctx.shadowColor = this.params.glowColors[colorIndex];
    
    ctx.fillText(word, 0, 0);
    ctx.restore();
    
    // Recurse to smaller copies
    const childScale = scale * 0.5;
    const childDistance = this.params.fontSize * scale * 1.5;
    const childCount = 4;
    
    for (let i = 0; i < childCount; i++) {
      const childAngle = angle + (i / childCount) * Math.PI * 2;
      const childX = x + Math.cos(childAngle) * childDistance;
      const childY = y + Math.sin(childAngle) * childDistance;
      
      this.renderFractalWord(
        word,
        childX,
        childY,
        childScale,
        depth - 1,
        childAngle,
        wordIndex,
        audioData
      );
    }
  }
  
  /**
   * WAVE: Words flow in sine wave patterns
   */
  private renderWave(
    segment: { text: string; start: number; end: number },
    progress: number,
    audioData: { bass: number; mid: number; treble: number }
  ) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const words = segment.text.split(' ');
    
    ctx.font = `${this.params.fontWeight} ${this.params.fontSize}px ${this.params.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    words.forEach((word, i) => {
      const wordProgress = Math.max(0, Math.min((progress - i * 0.05) / 0.3, 1));
      const waveProgress = this.easeInOutSine(wordProgress);
      
      // Wave mathematics
      const x = (width / (words.length + 1)) * (i + 1);
      const waveOffset = Math.sin(progress * Math.PI * 4 + i * 0.5) * 100 * audioData.mid;
      const y = height / 2 + waveOffset;
      
      // Scale and alpha
      const scale = 0.5 + waveProgress * 0.5 + audioData.bass * 0.3;
      const alpha = waveProgress;
      
      // Color
      const colorIndex = i % this.params.textColors.length;
      const textColor = this.params.textColors[colorIndex];
      const glowColor = this.params.glowColors[colorIndex];
      
      // Glow
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha * 0.5;
      ctx.shadowBlur = 25 + audioData.treble * 50;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;
      ctx.fillText(word, 0, 0);
      ctx.restore();
      
      // Text
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = textColor;
      ctx.fillText(word, 0, 0);
      ctx.restore();
    });
  }
  
  /**
   * Update particle system
   */
  private updateParticles(audioData: { bass: number; mid: number; treble: number; amplitude: number }) {
    // Spawn new particles on bass hits
    if (audioData.bass > 0.7 && this.prng.nextBool(0.3)) {
      const count = Math.floor(audioData.bass * 10);
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: this.canvas.width / 2,
          y: this.canvas.height / 2,
          vx: (this.prng.next() - 0.5) * this.params.particleVelocity * 2,
          vy: (this.prng.next() - 0.5) * this.params.particleVelocity * 2,
          size: this.params.particleSize * (0.5 + this.prng.next() * 0.5),
          color: this.params.glowColors[Math.floor(this.prng.next() * this.params.glowColors.length)],
          life: 1.0,
        });
      }
    }
    
    // Update existing particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });
    
    // Limit particle count
    if (this.particles.length > this.params.particleCount) {
      this.particles = this.particles.slice(-this.params.particleCount);
    }
  }
  
  /**
   * Render particles
   */
  private renderParticles() {
    const ctx = this.ctx;
    
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = p.size * 3;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  
  /**
   * Render signature watermark (visual DNA)
   */
  private renderSignatureWatermark(amplitude: number) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    
    const size = 80;
    const x = width - size - 20;
    const y = height - size - 20;
    
    ctx.save();
    ctx.globalAlpha = 0.2 + amplitude * 0.3;
    ctx.strokeStyle = this.params.accentColor.getStyle();
    ctx.lineWidth = 2;
    
    // Draw signature pattern as geometric shape
    ctx.beginPath();
    this.params.signaturePattern.forEach((val, i) => {
      const angle = (i / this.params.signaturePattern.length) * Math.PI * 2;
      const radius = (size / 2) * val;
      const px = x + size / 2 + Math.cos(angle) * radius;
      const py = y + size / 2 + Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Easing functions
   */
  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }
  
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
  
  private easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }
  
  /**
   * Helpers
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
  
  private keyToNumber(key: string): number {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseKey = key.replace('m', '').replace('M', '');
    return keys.indexOf(baseKey) || 0;
  }
  
  private parseHSL(hsl: string): { h: number; s: number; l: number } {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return { h: 0, s: 0, l: 0 };
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3]),
    };
  }
}
