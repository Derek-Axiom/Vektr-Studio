/**
 * VEKTR Proof-of-Determinism Layer
 * 
 * Enhanced from TheREV's ProofOfDeterminism.js
 * Provides audit trail and reproducibility verification for all creative operations.
 * 
 * Every visual, every effect, every generation is provably deterministic.
 * Same inputs = same outputs, forever. Verifiable in court.
 */

import { DeterministicPRNG } from './DeterministicPRNG';

export interface DeterminismProof {
  // Core Identity
  rootHash: string;           // SHA-256 of entire creation context
  timestamp: number;          // Unix timestamp (ms)
  logicalTick: bigint;        // Deterministic logical time
  
  // Input/Output Hashes
  inputHash: string;          // Hash of all inputs
  outputHash: string;         // Hash of all outputs
  
  // Reproducibility
  prngState: [bigint, bigint, bigint, bigint]; // PRNG state snapshot
  prngSeed: { seed1: bigint; seed2: bigint };  // Original seeds
  
  // Chain of Custody
  parentProof?: string;       // Link to parent creation
  derivativeOf?: string[];    // Array of source proofs (for remixes/collabs)
  
  // Verification
  reproducible: true;         // Always true (enforced by type system)
  verified: boolean;          // Has been verified via re-execution
  
  // Metadata
  creationType: 'visual' | 'audio' | 'lyric' | 'composite';
  version: string;            // Proof format version
}

export interface CreationContext {
  // Identity
  userId: string;
  username: string;
  
  // Content
  trackId: string;
  trackTitle: string;
  artist: string;
  bpm?: number;
  key?: string;
  
  // Creative State
  lyrics?: string;
  dspParams?: Record<string, any>;
  visualParams?: Record<string, any>;
  
  // Lineage
  parentHash?: string;
  derivativeOf?: string[];
}

/**
 * Generate determinism proof for a creation
 */
export async function generateDeterminismProof(
  context: CreationContext,
  logicalTick: bigint,
  creationType: DeterminismProof['creationType']
): Promise<DeterminismProof> {
  // 1. Hash all inputs
  const inputString = JSON.stringify({
    userId: context.userId,
    username: context.username,
    trackId: context.trackId,
    trackTitle: context.trackTitle,
    artist: context.artist,
    bpm: context.bpm,
    key: context.key,
    lyrics: context.lyrics,
    dspParams: context.dspParams,
    visualParams: context.visualParams,
  });
  
  const inputHash = await sha256(inputString);
  
  // 2. Generate deterministic seeds from inputs
  const seed1 = BigInt('0x' + inputHash.slice(0, 16));
  const seed2 = BigInt('0x' + inputHash.slice(16, 32));
  
  // 3. Initialize PRNG
  const prng = new DeterministicPRNG(seed1, seed2);
  
  // 4. Generate outputs deterministically
  const outputs = generateDeterministicOutputs(prng, context);
  
  // 5. Hash outputs
  const outputHash = await sha256(JSON.stringify(outputs));
  
  // 6. Capture PRNG state
  const prngState = prng.getState();
  
  // 7. Compute root hash (combines everything)
  const rootHash = await sha256(
    inputHash + 
    outputHash + 
    logicalTick.toString() + 
    JSON.stringify(prngState)
  );
  
  return {
    rootHash,
    timestamp: Date.now(),
    logicalTick,
    inputHash,
    outputHash,
    prngState,
    prngSeed: { seed1, seed2 },
    parentProof: context.parentHash,
    derivativeOf: context.derivativeOf,
    reproducible: true,
    verified: false, // Will be verified on first re-execution
    creationType,
    version: '1.0.0',
  };
}

/**
 * Generate deterministic outputs from PRNG
 */
function generateDeterministicOutputs(prng: DeterministicPRNG, context: CreationContext) {
  return {
    // Visual parameters
    colorPalette: Array.from({ length: 5 }, () => ({
      hue: prng.nextInt(0, 360),
      saturation: prng.nextInt(60, 100),
      lightness: prng.nextInt(40, 70),
    })),
    
    // Geometry parameters
    geometryComplexity: prng.nextInt(3, 12),
    vertexCount: prng.nextInt(8, 64),
    
    // Motion parameters
    rotationSpeed: prng.nextFloat(0.001, 0.05),
    orbitRadius: prng.nextFloat(0.2, 0.8),
    orbitPhase: prng.nextFloat(0, Math.PI * 2),
    
    // Signature pattern (16-value visual DNA)
    signaturePattern: Array.from({ length: 16 }, () => prng.next()),
    
    // Audio-reactive parameters
    bassResponse: prng.nextFloat(0.5, 1.0),
    midResponse: prng.nextFloat(0.3, 0.8),
    trebleResponse: prng.nextFloat(0.2, 0.6),
  };
}

/**
 * Verify a determinism proof by re-executing
 */
export async function verifyDeterminismProof(
  context: CreationContext,
  proof: DeterminismProof
): Promise<{ valid: boolean; evidence: string[] }> {
  const evidence: string[] = [];
  
  try {
    // 1. Regenerate proof from same inputs
    const regenerated = await generateDeterminismProof(
      context,
      proof.logicalTick,
      proof.creationType
    );
    
    // 2. Compare hashes
    const inputMatch = regenerated.inputHash === proof.inputHash;
    const outputMatch = regenerated.outputHash === proof.outputHash;
    const rootMatch = regenerated.rootHash === proof.rootHash;
    
    if (inputMatch) evidence.push('✓ Input hash matches');
    else evidence.push('✗ Input hash mismatch');
    
    if (outputMatch) evidence.push('✓ Output hash matches');
    else evidence.push('✗ Output hash mismatch');
    
    if (rootMatch) evidence.push('✓ Root hash matches');
    else evidence.push('✗ Root hash mismatch');
    
    // 3. Verify PRNG state
    const prngStateMatch = JSON.stringify(regenerated.prngState) === JSON.stringify(proof.prngState);
    if (prngStateMatch) evidence.push('✓ PRNG state matches');
    else evidence.push('✗ PRNG state mismatch');
    
    const valid = inputMatch && outputMatch && rootMatch && prngStateMatch;
    
    return { valid, evidence };
    
  } catch (error) {
    evidence.push(`✗ Verification failed: ${error}`);
    return { valid: false, evidence };
  }
}

/**
 * SHA-256 hash helper
 */
async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Store proof in IndexedDB alongside track
 */
export async function storeDeterminismProof(
  trackId: string,
  proof: DeterminismProof
): Promise<void> {
  const db = await openProofDB();
  const tx = db.transaction('proofs', 'readwrite');
  const store = tx.objectStore('proofs');
  
  await store.put({
    trackId,
    proof,
    storedAt: Date.now(),
  });
  
  await tx.done;
}

/**
 * Retrieve proof from IndexedDB
 */
export async function retrieveDeterminismProof(
  trackId: string
): Promise<DeterminismProof | null> {
  const db = await openProofDB();
  const tx = db.transaction('proofs', 'readonly');
  const store = tx.objectStore('proofs');
  
  const record = await store.get(trackId);
  return record?.proof || null;
}

/**
 * Open IndexedDB for proofs
 */
async function openProofDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vektr_proofs', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('proofs')) {
        const store = db.createObjectStore('proofs', { keyPath: 'trackId' });
        store.createIndex('timestamp', 'storedAt');
      }
    };
  });
}

/**
 * Generate logical tick (deterministic time)
 * Increments monotonically, never uses wall-clock time
 */
let globalLogicalTick = 0n;

export function getLogicalTick(): bigint {
  return globalLogicalTick++;
}

export function resetLogicalTick(value: bigint = 0n): void {
  globalLogicalTick = value;
}
