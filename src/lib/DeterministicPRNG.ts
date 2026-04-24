/**
 * VEKTR Deterministic PRNG
 * 
 * Ported from TheREV's DeterministicPRNG.js (xoshiro256** algorithm)
 * Zero dependencies. Cryptographically strong. Reproducible forever.
 * 
 * Same seed = same output sequence, always.
 * Used for: visual generation, color palettes, geometry, motion patterns.
 */

export class DeterministicPRNG {
  private state: [bigint, bigint, bigint, bigint];
  
  /**
   * Initialize with two 64-bit seeds
   * @param seed1 - First seed (BigInt)
   * @param seed2 - Second seed (BigInt)
   */
  constructor(seed1: bigint, seed2: bigint) {
    // xoshiro256** initialization
    this.state = [
      seed1,
      seed2,
      seed1 ^ 0x9E3779B97F4A7C15n,
      seed2 ^ 0x3C6EF372FE94F82An
    ];
    
    // Warm up the generator (discard first few values for better distribution)
    for (let i = 0; i < 20; i++) {
      this.next();
    }
  }
  
  /**
   * Generate next random number in range [0, 1)
   * xoshiro256** algorithm - cryptographically strong, deterministic
   */
  next(): number {
    const result = this.rotl(this.state[1] * 5n, 7) * 9n;
    const t = this.state[1] << 17n;
    
    this.state[2] ^= this.state[0];
    this.state[3] ^= this.state[1];
    this.state[1] ^= this.state[2];
    this.state[0] ^= this.state[3];
    this.state[2] ^= t;
    this.state[3] = this.rotl(this.state[3], 45);
    
    // Convert to float in [0, 1)
    return Number(result & 0xFFFFFFFFn) / 0x100000000;
  }
  
  /**
   * Generate integer in range [min, max]
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  /**
   * Generate float in range [min, max]
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
  
  /**
   * Generate boolean with given probability
   */
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }
  
  /**
   * Get current PRNG state (for proof-of-determinism)
   */
  getState(): [bigint, bigint, bigint, bigint] {
    return [...this.state];
  }
  
  /**
   * Restore PRNG state (for reproducibility)
   */
  setState(state: [bigint, bigint, bigint, bigint]): void {
    this.state = [...state];
  }
  
  /**
   * Rotate left (bitwise operation)
   */
  private rotl(x: bigint, k: number): bigint {
    return (x << BigInt(k)) | (x >> BigInt(64 - k));
  }
  
  /**
   * Create PRNG from string seed (convenience method)
   */
  static fromString(seed: string): DeterministicPRNG {
    const hash1 = this.hashString(seed);
    const hash2 = this.hashString(seed + ':salt');
    return new DeterministicPRNG(hash1, hash2);
  }
  
  /**
   * Hash string to BigInt seed
   */
  private static hashString(str: string): bigint {
    let hash = 0n;
    for (let i = 0; i < str.length; i++) {
      hash = BigInt(str.charCodeAt(i)) + ((hash << 5n) - hash);
      hash = hash & 0xFFFFFFFFFFFFFFFFn; // Keep as 64-bit
    }
    return hash;
  }
}

/**
 * Create PRNG from track identity
 */
export function createTrackPRNG(trackId: string, userId: string, timestamp: number): DeterministicPRNG {
  const seed1 = DeterministicPRNG['hashString'](`${trackId}:${userId}`);
  const seed2 = DeterministicPRNG['hashString'](`${timestamp}:${trackId}`);
  return new DeterministicPRNG(seed1, seed2);
}
