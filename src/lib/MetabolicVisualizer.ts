/**
 * VEKTR Metabolic Visualizer - Identity-Forged 3D Engine
 * 
 * This isn't a music visualizer. This is a mathematical identity signature
 * rendered in real-time 3D space. Every vertex, every color, every motion
 * is deterministically derived from the artist's identity + track DNA.
 * 
 * The visual IS the proof. The geometry IS the copyright.
 * 
 * Inspired by:
 * - TheREV's 10KD tensor mathematics
 * - Axiomatic gravity (concepts pull toward proven patterns)
 * - Deterministic PRNG (xoshiro256**)
 * - Identity forging (user + track + session = unique signature)
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { DeterministicPRNG } from './DeterministicPRNG';
import type { DeterminismProof } from './ProofOfDeterminism';

export interface IdentitySignature {
  // Core Identity (deterministic seeds)
  userId: string;
  trackId: string;
  sessionTimestamp: number;
  
  // Track DNA
  bpm: number;
  key: string;
  energy: number;
  
  // Proof
  determinismProof?: DeterminismProof;
}

export interface MetabolicParams {
  // Geometry (derived from identity)
  geometryType: 'icosahedron' | 'octahedron' | 'dodecahedron' | 'torusKnot' | 'custom';
  vertexCount: number;
  complexity: number;
  
  // Color DNA (5-color palette from PRNG)
  primaryColor: THREE.Color;
  secondaryColor: THREE.Color;
  tertiaryColor: THREE.Color;
  accentColor: THREE.Color;
  glowColor: THREE.Color;
  
  // Motion Signature
  rotationAxis: THREE.Vector3;
  rotationSpeed: number;
  orbitRadius: number;
  orbitPhase: number;
  pulseFrequency: number;
  
  // Particle System
  particleCount: number;
  particleSize: number;
  particleVelocity: THREE.Vector3;
  
  // Visual DNA (16-value signature pattern)
  signaturePattern: number[];
}

/**
 * Metabolic Visualizer - The Identity Engine
 */
export class MetabolicVisualizer {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  
  // Core geometry
  private mainMesh: THREE.Mesh;
  private particleSystem: THREE.Points;
  private signatureRing: THREE.Line;
  
  // Identity
  private identity: IdentitySignature;
  private params: MetabolicParams;
  private prng: DeterministicPRNG;
  
  // Animation state
  private time: number = 0;
  private animationId: number | null = null;
  
  // Audio reactivity
  private audioData = {
    bass: 0,
    mid: 0,
    treble: 0,
    amplitude: 0,
    peak: 0,
  };
  
  constructor(container: HTMLElement, identity: IdentitySignature) {
    this.container = container;
    this.identity = identity;
    
    // Initialize deterministic PRNG from identity
    this.prng = new DeterministicPRNG(
      BigInt('0x' + this.hashString(identity.userId + identity.trackId)),
      BigInt('0x' + this.hashString(identity.sessionTimestamp.toString()))
    );
    
    // Derive metabolic parameters from identity
    this.params = this.deriveMetabolicParams();
    
    this.init();
  }
  
  /**
   * Derive all visual parameters deterministically from identity
   * This is the "identity forging" - same identity = same visuals, always
   */
  private deriveMetabolicParams(): MetabolicParams {
    const { bpm, key, energy } = this.identity;
    
    // Geometry type from BPM
    let geometryType: MetabolicParams['geometryType'];
    if (bpm < 80) geometryType = 'icosahedron';      // Slow = organic
    else if (bpm < 120) geometryType = 'dodecahedron'; // Mid = balanced
    else if (bpm < 160) geometryType = 'octahedron';   // Fast = sharp
    else geometryType = 'torusKnot';                   // Very fast = complex
    
    // Vertex count from energy
    const vertexCount = Math.floor(8 + (energy * 56)); // 8-64 vertices
    
    // Complexity from key (convert to numeric)
    const keyValue = this.keyToNumber(key);
    const complexity = 0.3 + (keyValue / 12) * 0.7; // 0.3-1.0
    
    // Color palette from PRNG (deterministic)
    const primaryColor = new THREE.Color().setHSL(
      this.prng.next(),
      0.7 + this.prng.next() * 0.3,
      0.5 + this.prng.next() * 0.2
    );
    
    const secondaryColor = new THREE.Color().setHSL(
      (this.prng.next() + 0.33) % 1,
      0.7 + this.prng.next() * 0.3,
      0.5 + this.prng.next() * 0.2
    );
    
    const tertiaryColor = new THREE.Color().setHSL(
      (this.prng.next() + 0.66) % 1,
      0.7 + this.prng.next() * 0.3,
      0.5 + this.prng.next() * 0.2
    );
    
    const accentColor = new THREE.Color().setHSL(
      this.prng.next(),
      0.9 + this.prng.next() * 0.1,
      0.6 + this.prng.next() * 0.3
    );
    
    const glowColor = new THREE.Color().setHSL(
      this.prng.next(),
      1.0,
      0.7
    );
    
    // Motion signature from PRNG
    const rotationAxis = new THREE.Vector3(
      this.prng.next() * 2 - 1,
      this.prng.next() * 2 - 1,
      this.prng.next() * 2 - 1
    ).normalize();
    
    const rotationSpeed = (bpm / 120) * (0.001 + this.prng.next() * 0.049);
    const orbitRadius = 0.2 + this.prng.next() * 0.6;
    const orbitPhase = this.prng.next() * Math.PI * 2;
    const pulseFrequency = 1 + this.prng.nextInt(1, 8);
    
    // Particle system
    const particleCount = Math.floor(50 + energy * 200); // 50-250 particles
    const particleSize = 0.02 + this.prng.next() * 0.08;
    const particleVelocity = new THREE.Vector3(
      this.prng.next() * 0.02 - 0.01,
      this.prng.next() * 0.02 - 0.01,
      this.prng.next() * 0.02 - 0.01
    );
    
    // Visual DNA (16-value signature pattern)
    const signaturePattern = Array.from({ length: 16 }, () => this.prng.next());
    
    return {
      geometryType,
      vertexCount,
      complexity,
      primaryColor,
      secondaryColor,
      tertiaryColor,
      accentColor,
      glowColor,
      rotationAxis,
      rotationSpeed,
      orbitRadius,
      orbitPhase,
      pulseFrequency,
      particleCount,
      particleSize,
      particleVelocity,
      signaturePattern,
    };
  }
  
  /**
   * Initialize THREE.js scene with post-processing
   */
  private init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);
    
    // Post-processing
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.container.clientWidth, this.container.clientHeight),
      1.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(this.params.primaryColor, 2, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(this.params.secondaryColor, 1.5, 100);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);
    
    // Create geometry
    this.createMainGeometry();
    this.createParticleSystem();
    this.createSignatureRing();
    
    // Event listeners
    window.addEventListener('resize', this.handleResize);
    
    // Start animation
    this.animate();
  }
  
  /**
   * Create main geometry (the identity signature)
   */
  private createMainGeometry() {
    let geometry: THREE.BufferGeometry;
    
    switch (this.params.geometryType) {
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(2, Math.floor(this.params.complexity * 4));
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(2, Math.floor(this.params.complexity * 4));
        break;
      case 'dodecahedron':
        geometry = new THREE.DodecahedronGeometry(2, Math.floor(this.params.complexity * 2));
        break;
      case 'torusKnot':
        geometry = new THREE.TorusKnotGeometry(
          1.5,
          0.5,
          Math.floor(64 * this.params.complexity),
          Math.floor(16 * this.params.complexity)
        );
        break;
      default:
        geometry = new THREE.IcosahedronGeometry(2, 2);
    }
    
    // Custom shader material for identity signature
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        primaryColor: { value: this.params.primaryColor },
        secondaryColor: { value: this.params.secondaryColor },
        glowColor: { value: this.params.glowColor },
        bassLevel: { value: 0 },
        midLevel: { value: 0 },
        trebleLevel: { value: 0 },
        signaturePattern: { value: this.params.signaturePattern },
      },
      vertexShader: `
        uniform float time;
        uniform float bassLevel;
        uniform float midLevel;
        uniform float[16] signaturePattern;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vSignature;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Apply signature pattern to vertices
          int vertexIndex = int(mod(float(gl_VertexID), 16.0));
          vSignature = signaturePattern[vertexIndex];
          
          // Audio-reactive displacement
          vec3 displaced = position;
          displaced += normal * bassLevel * 0.5 * vSignature;
          displaced += normal * sin(time * 2.0 + vSignature * 10.0) * midLevel * 0.2;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;
        uniform vec3 glowColor;
        uniform float time;
        uniform float trebleLevel;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vSignature;
        
        void main() {
          // Fresnel effect
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
          
          // Color mixing based on signature
          vec3 color = mix(primaryColor, secondaryColor, vSignature);
          color = mix(color, glowColor, fresnel * trebleLevel);
          
          // Pulsing glow
          float glow = sin(time * 3.0 + vSignature * 5.0) * 0.5 + 0.5;
          color += glowColor * glow * trebleLevel * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false,
      side: THREE.DoubleSide,
    });
    
    this.mainMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mainMesh);
  }
  
  /**
   * Create particle system (identity constellation)
   */
  private createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.params.particleCount * 3);
    const colors = new Float32Array(this.params.particleCount * 3);
    const sizes = new Float32Array(this.params.particleCount);
    
    for (let i = 0; i < this.params.particleCount; i++) {
      // Position based on signature pattern
      const signatureIndex = i % 16;
      const signatureValue = this.params.signaturePattern[signatureIndex];
      
      const radius = 3 + signatureValue * 2;
      const theta = this.prng.next() * Math.PI * 2;
      const phi = this.prng.next() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Color from palette
      const colorIndex = Math.floor(this.prng.next() * 3);
      const color = [this.params.primaryColor, this.params.secondaryColor, this.params.tertiaryColor][colorIndex];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Size based on signature
      sizes[i] = this.params.particleSize * (0.5 + signatureValue * 0.5);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: this.params.particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }
  
  /**
   * Create signature ring (visual DNA watermark)
   */
  private createSignatureRing() {
    const points: THREE.Vector3[] = [];
    
    for (let i = 0; i <= 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const signatureValue = this.params.signaturePattern[i % 16];
      const radius = 4 + signatureValue * 0.5;
      
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: this.params.accentColor,
      transparent: true,
      opacity: 0.3,
      linewidth: 2,
    });
    
    this.signatureRing = new THREE.Line(geometry, material);
    this.scene.add(this.signatureRing);
  }
  
  /**
   * Update audio data (called 60fps from parent)
   */
  updateAudio(audioData: {
    bass: number;
    mid: number;
    treble: number;
    amplitude: number;
    peak: number;
  }) {
    this.audioData = audioData;
  }
  
  /**
   * Main animation loop
   */
  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    
    this.time += 0.01;
    
    // Update main mesh
    if (this.mainMesh) {
      // Rotation based on identity signature
      this.mainMesh.rotation.x += this.params.rotationSpeed;
      this.mainMesh.rotation.y += this.params.rotationSpeed * 1.5;
      this.mainMesh.rotation.z += this.params.rotationSpeed * 0.5;
      
      // Audio-reactive scale
      const bassScale = 1 + this.audioData.bass * 0.3;
      this.mainMesh.scale.set(bassScale, bassScale, bassScale);
      
      // Update shader uniforms
      const material = this.mainMesh.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
      material.uniforms.bassLevel.value = this.audioData.bass;
      material.uniforms.midLevel.value = this.audioData.mid;
      material.uniforms.trebleLevel.value = this.audioData.treble;
    }
    
    // Update particle system
    if (this.particleSystem) {
      this.particleSystem.rotation.y += this.params.rotationSpeed * 0.5;
      
      // Audio-reactive particle movement
      const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < this.params.particleCount; i++) {
        const signatureIndex = i % 16;
        const signatureValue = this.params.signaturePattern[signatureIndex];
        
        // Pulse based on audio
        const pulse = Math.sin(this.time * this.params.pulseFrequency + signatureValue * 10) * this.audioData.mid * 0.1;
        positions[i * 3] *= 1 + pulse;
        positions[i * 3 + 1] *= 1 + pulse;
        positions[i * 3 + 2] *= 1 + pulse;
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Update signature ring
    if (this.signatureRing) {
      this.signatureRing.rotation.z += this.params.rotationSpeed * 2;
      
      // Audio-reactive opacity
      const material = this.signatureRing.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + this.audioData.amplitude * 0.5;
    }
    
    // Render with post-processing
    this.composer.render();
  };
  
  /**
   * Handle window resize
   */
  private handleResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize);
    
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
  
  /**
   * Helper: Hash string to hex
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
  
  /**
   * Helper: Convert key to number
   */
  private keyToNumber(key: string): number {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const baseKey = key.replace('m', '').replace('M', '');
    return keys.indexOf(baseKey) || 0;
  }
}
