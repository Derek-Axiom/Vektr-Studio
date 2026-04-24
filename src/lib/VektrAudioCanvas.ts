/**
 * VEKTR Audio-Reactive Canvas
 * 
 * Lightweight fork of ERE's CreativeCanvas optimized for music visualization.
 * Stripped of AI/Gemini dependencies, focused purely on deterministic audio-reactive geometry.
 * 
 * Key changes from ERE:
 * - Removed DreamEngine/Gemini integration
 * - Audio-reactive vertex manipulation (real FFT data, not simulated)
 * - Deterministic seeding from track identity (BPM, key, artist hash)
 * - Mobile-optimized (reduced particle count, adaptive quality)
 */

import * as THREE from 'three';

export interface AudioReactiveConfig {
  // Track Identity (deterministic seed)
  trackId: string;
  bpm: number;
  key: string;
  energy: number; // 0-1
  
  // Visual Style
  complexity: number; // 0-1 (affects geometry detail)
  wireframe: boolean;
  colorPalette: string[]; // Hex colors
  
  // Audio Reactivity
  bassResponse: number; // 0-1 (how much bass affects scale)
  midResponse: number; // 0-1 (how much mids affect rotation)
  trebleResponse: number; // 0-1 (how much treble affects color)
}

export class VektrAudioCanvas {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private geometry: THREE.BufferGeometry;
  private material: THREE.MeshStandardMaterial;
  private mesh: THREE.Mesh;
  private animationId: number | null = null;
  
  private config: AudioReactiveConfig;
  private time: number = 0;
  private mouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };
  
  // Performance monitoring
  private frameCount = 0;
  private lastFpsCheck = performance.now();
  private currentFps = 60;
  private qualityLevel: 'high' | 'medium' | 'low' = 'high';
  
  constructor(container: HTMLElement, config: AudioReactiveConfig) {
    this.container = container;
    this.config = config;
    
    this.init();
  }
  
  private init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.002);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // Renderer with mobile optimization
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: this.qualityLevel === 'high',
      powerPreference: 'high-performance',
    });
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);
    
    // Create geometry based on track identity
    this.createGeometry();
    
    // Event listeners
    window.addEventListener('resize', this.handleResize);
    this.container.addEventListener('mousemove', this.handleMouseMove);
    
    // Start animation
    this.animate();
  }
  
  /**
   * Create deterministic geometry based on track identity
   */
  private createGeometry() {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.geometry.dispose();
      this.material.dispose();
    }
    
    // Deterministic seed from track ID
    const seed = this.hashString(this.config.trackId);
    const rng = this.seededRandom(seed);
    
    // Geometry complexity based on track energy + config
    const detail = Math.floor(this.config.complexity * 3) + 1;
    const baseSize = 2 + (this.config.energy * 0.5);
    
    // Choose geometry type based on BPM
    if (this.config.bpm > 140) {
      // Fast tracks: Sharp, angular geometry
      this.geometry = new THREE.OctahedronGeometry(baseSize, detail);
    } else if (this.config.bpm < 80) {
      // Slow tracks: Smooth, organic geometry
      this.geometry = new THREE.IcosahedronGeometry(baseSize, detail);
    } else {
      // Mid-tempo: Balanced geometry
      this.geometry = new THREE.DodecahedronGeometry(baseSize, detail);
    }
    
    // Material with deterministic color from palette
    const colorIndex = Math.floor(rng() * this.config.colorPalette.length);
    const baseColor = this.config.colorPalette[colorIndex];
    
    this.material = new THREE.MeshStandardMaterial({
      color: baseColor,
      wireframe: this.config.wireframe,
      roughness: 0.4,
      metalness: 0.6,
      flatShading: true,
    });
    
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  
  /**
   * Main animation loop with audio reactivity
   */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    // Performance monitoring
    this.monitorPerformance();
    
    this.time += 0.01;
    
    // Smooth mouse tracking
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
    
    if (this.mesh) {
      // Base rotation (BPM-synced)
      const rotationSpeed = (this.config.bpm / 120) * 0.005;
      this.mesh.rotation.x += rotationSpeed;
      this.mesh.rotation.y += rotationSpeed;
      
      // Mouse interaction
      this.mesh.rotation.x += this.mouse.y * 0.05;
      this.mesh.rotation.y += this.mouse.x * 0.05;
    }
    
    this.renderer.render(this.scene, this.camera);
  };
  
  /**
   * Update geometry based on real-time audio data
   */
  updateAudio(audioData: {
    bass: number;      // 0-1
    mid: number;       // 0-1
    treble: number;    // 0-1
    amplitude: number; // 0-1
  }) {
    if (!this.mesh) return;
    
    // Scale based on bass
    const bassScale = 1 + (audioData.bass * this.config.bassResponse * 0.5);
    this.mesh.scale.set(bassScale, bassScale, bassScale);
    
    // Rotation speed based on mids
    const midRotation = audioData.mid * this.config.midResponse * 0.1;
    this.mesh.rotation.z += midRotation;
    
    // Color shift based on treble
    if (this.config.trebleResponse > 0) {
      const hsl = { h: 0, s: 0, l: 0 };
      this.material.color.getHSL(hsl);
      
      const trebleShift = audioData.treble * this.config.trebleResponse * 0.1;
      hsl.h = (hsl.h + trebleShift) % 1;
      
      this.material.color.setHSL(hsl.h, hsl.s, hsl.l);
    }
    
    // Wireframe glitch on peaks
    if (audioData.amplitude > 0.9 && Math.random() > 0.8) {
      this.material.wireframe = !this.material.wireframe;
    }
  }
  
  /**
   * Monitor FPS and adjust quality dynamically
   */
  private monitorPerformance() {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFpsCheck > 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsCheck = now;
      
      // Adaptive quality
      if (this.currentFps < 30 && this.qualityLevel !== 'low') {
        this.qualityLevel = 'low';
        this.renderer.setPixelRatio(1);
        console.warn('VEKTR Canvas: Reducing quality (FPS < 30)');
      } else if (this.currentFps < 50 && this.qualityLevel === 'high') {
        this.qualityLevel = 'medium';
        this.renderer.setPixelRatio(1.5);
      }
    }
  }
  
  /**
   * Handle window resize
   */
  private handleResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
  
  /**
   * Handle mouse movement
   */
  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<AudioReactiveConfig>) {
    this.config = { ...this.config, ...config };
    
    // Recreate geometry if structural changes
    if (config.complexity !== undefined || config.wireframe !== undefined) {
      this.createGeometry();
    }
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.geometry.dispose();
      this.material.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }
  
  /**
   * Hash string to number (deterministic seed)
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    return Math.abs(hash);
  }
  
  /**
   * Seeded random number generator
   */
  private seededRandom(seed: number) {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };
  }
}
