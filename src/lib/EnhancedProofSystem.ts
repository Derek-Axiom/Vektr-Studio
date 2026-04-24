/**
 * Enhanced Proof System - Bridge Layer
 * 
 * Connects VEKTR's proof-of-determinism layer with the visualizer system.
 * Combines:
 * - ProofOfDeterminism (audit trail)
 * - ART_CanvasHasher (NFOD root hash)
 * - DeterministicPRNG (visual generation)
 */

import { generateDeterminismProof, type CreationContext, type DeterminismProof } from './ProofOfDeterminism';
import { computeCreationProof, buildSovereignContext } from './ART_CanvasHasher';
import type { MediaItem, PublicProfile } from '../types';

export interface EnhancedProof {
  // Determinism Proof (from TheREV)
  determinismProof: DeterminismProof;
  
  // NFOD Hash (from ART_CanvasHasher)
  nfodHash: string;
  
  // Combined Root Hash
  rootHash: string;
  
  // Metadata
  timestamp: number;
  userId: string;
  trackId: string;
}

/**
 * Generate enhanced proof combining both systems
 */
export async function generateEnhancedProof(
  profile: PublicProfile,
  track: MediaItem,
  rackParams?: Record<string, any>,
  lyrics?: string,
  syncLines?: any[]
): Promise<EnhancedProof> {
  const timestamp = Date.now();
  const logicalTick = BigInt(timestamp);
  
  // Build creation context
  const context: CreationContext = {
    userId: profile.ownerId,
    username: profile.displayName,
    trackId: track.id,
    trackTitle: track.title,
    artist: track.artist || profile.displayName,
    bpm: track.bpm,
    key: track.key,
    lyrics,
    dspParams: rackParams,
    visualParams: {
      mode: 'metabolic',
      timestamp,
    },
  };
  
  // Generate determinism proof
  const determinismProof = await generateDeterminismProof(
    context,
    logicalTick,
    'visual'
  );
  
  // Generate NFOD hash
  const sovereignContext = buildSovereignContext(
    profile,
    track,
    rackParams || {},
    lyrics || '',
    syncLines
  );
  
  const nfodHash = await computeCreationProof(sovereignContext);
  
  // Combine into root hash
  const rootHash = await sha256(
    determinismProof.rootHash + nfodHash + timestamp.toString()
  );
  
  return {
    determinismProof,
    nfodHash,
    rootHash,
    timestamp,
    userId: profile.ownerId,
    trackId: track.id,
  };
}

/**
 * Verify enhanced proof by regenerating
 */
export async function verifyEnhancedProof(
  proof: EnhancedProof,
  profile: PublicProfile,
  track: MediaItem,
  rackParams?: Record<string, any>,
  lyrics?: string,
  syncLines?: any[]
): Promise<boolean> {
  // Regenerate proof with same inputs
  const regenerated = await generateEnhancedProof(
    profile,
    track,
    rackParams,
    lyrics,
    syncLines
  );
  
  // Compare hashes
  return (
    regenerated.determinismProof.inputHash === proof.determinismProof.inputHash &&
    regenerated.determinismProof.outputHash === proof.determinismProof.outputHash &&
    regenerated.nfodHash === proof.nfodHash
  );
}

/**
 * SHA-256 hash helper
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
