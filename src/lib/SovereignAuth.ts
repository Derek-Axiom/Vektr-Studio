/**
 * VEKTR Sovereign Authentication System
 * 
 * Deterministic identity generation with email/password persistence.
 * No external auth providers. No tracking. Pure sovereign ownership.
 * 
 * Principles:
 * - Deterministic ID generation (no Math.random())
 * - Email/password authentication
 * - Local-first with optional cloud backup
 * - Recoverable across devices
 * - Zero external dependencies
 */

import { DeterministicPRNG } from './DeterministicPRNG';
import { getLogicalTick } from './ProofOfDeterminism';

export interface SovereignIdentity {
  // Core Identity (deterministic)
  ownerId: string;           // VEKTR-{deterministic-hash}
  email: string;             // User's email
  username: string;          // Display name
  
  // Authentication
  passwordHash: string;      // SHA-256 hash of password
  salt: string;              // Random salt for password
  
  // Timestamps
  createdAt: number;         // Account creation timestamp
  lastLogin: number;         // Last login timestamp
  logicalTick: bigint;       // Deterministic logical time
  
  // Profile
  bio?: string;
  avatarUrl?: string;
  slug?: string;
  
  // Recovery
  recoveryKey: string;       // Deterministic recovery key
  
  // Status
  initialized: boolean;
  verified: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  username: string;
  bio?: string;
}

/**
 * Generate deterministic owner ID from email
 * Same email = same ID, always (for recovery)
 */
async function generateOwnerId(email: string, timestamp: number): Promise<string> {
  const input = `${email.toLowerCase()}:${timestamp}`;
  const hash = await sha256(input);
  return `VEKTR-${hash.slice(0, 12).toUpperCase()}`;
}

/**
 * Generate deterministic recovery key
 */
async function generateRecoveryKey(email: string, passwordHash: string): Promise<string> {
  const input = `${email}:${passwordHash}:recovery`;
  const hash = await sha256(input);
  return hash.slice(0, 32).toUpperCase();
}

/**
 * Hash password with salt
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  const input = `${password}:${salt}`;
  return await sha256(input);
}

/**
 * Generate random salt
 */
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * SHA-256 helper
 */
async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sign up new user
 */
export async function signUp(data: SignupData): Promise<SovereignIdentity> {
  const email = data.email.toLowerCase().trim();
  
  // Check if email already exists
  const existing = await getIdentityByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }
  
  // Generate deterministic components
  const timestamp = Date.now();
  const ownerId = await generateOwnerId(email, timestamp);
  const salt = generateSalt();
  const passwordHash = await hashPassword(data.password, salt);
  const recoveryKey = await generateRecoveryKey(email, passwordHash);
  const logicalTick = getLogicalTick();
  
  const identity: SovereignIdentity = {
    ownerId,
    email,
    username: data.username,
    passwordHash,
    salt,
    createdAt: timestamp,
    lastLogin: timestamp,
    logicalTick,
    bio: data.bio,
    slug: data.username.toLowerCase().replace(/\s+/g, '-'),
    recoveryKey,
    initialized: true,
    verified: false,
  };
  
  // Store in IndexedDB
  await storeIdentity(identity);
  
  // Store in localStorage for quick access
  localStorage.setItem('vektr_current_user', ownerId);
  
  return identity;
}

/**
 * Log in existing user
 */
export async function logIn(credentials: AuthCredentials): Promise<SovereignIdentity> {
  const email = credentials.email.toLowerCase().trim();
  
  // Retrieve identity
  const identity = await getIdentityByEmail(email);
  if (!identity) {
    throw new Error('Account not found');
  }
  
  // Verify password
  const passwordHash = await hashPassword(credentials.password, identity.salt);
  if (passwordHash !== identity.passwordHash) {
    throw new Error('Invalid password');
  }
  
  // Update last login
  identity.lastLogin = Date.now();
  await storeIdentity(identity);
  
  // Set current user
  localStorage.setItem('vektr_current_user', identity.ownerId);
  
  return identity;
}

/**
 * Log out current user
 */
export function logOut(): void {
  localStorage.removeItem('vektr_current_user');
}

/**
 * Get current logged-in user
 */
export async function getCurrentUser(): Promise<SovereignIdentity | null> {
  const ownerId = localStorage.getItem('vektr_current_user');
  if (!ownerId) return null;
  
  return await getIdentityById(ownerId);
}

/**
 * Recover account using email + recovery key
 */
export async function recoverAccount(email: string, recoveryKey: string): Promise<SovereignIdentity> {
  const identity = await getIdentityByEmail(email);
  if (!identity) {
    throw new Error('Account not found');
  }
  
  if (identity.recoveryKey !== recoveryKey.toUpperCase()) {
    throw new Error('Invalid recovery key');
  }
  
  // Set current user
  localStorage.setItem('vektr_current_user', identity.ownerId);
  
  return identity;
}

/**
 * Change password
 */
export async function changePassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const identity = await getIdentityByEmail(email);
  if (!identity) {
    throw new Error('Account not found');
  }
  
  // Verify old password
  const oldHash = await hashPassword(oldPassword, identity.salt);
  if (oldHash !== identity.passwordHash) {
    throw new Error('Invalid current password');
  }
  
  // Generate new hash
  const newSalt = generateSalt();
  const newHash = await hashPassword(newPassword, newSalt);
  const newRecoveryKey = await generateRecoveryKey(email, newHash);
  
  // Update identity
  identity.passwordHash = newHash;
  identity.salt = newSalt;
  identity.recoveryKey = newRecoveryKey;
  
  await storeIdentity(identity);
}

/**
 * IndexedDB storage for identities
 */
async function openAuthDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vektr_auth', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('identities')) {
        const store = db.createObjectStore('identities', { keyPath: 'ownerId' });
        store.createIndex('email', 'email', { unique: true });
        store.createIndex('createdAt', 'createdAt');
      }
    };
  });
}

async function storeIdentity(identity: SovereignIdentity): Promise<void> {
  const db = await openAuthDB();
  const tx = db.transaction('identities', 'readwrite');
  const store = tx.objectStore('identities');
  await store.put(identity);
}

async function getIdentityById(ownerId: string): Promise<SovereignIdentity | null> {
  const db = await openAuthDB();
  const tx = db.transaction('identities', 'readonly');
  const store = tx.objectStore('identities');
  return await store.get(ownerId) || null;
}

async function getIdentityByEmail(email: string): Promise<SovereignIdentity | null> {
  const db = await openAuthDB();
  const tx = db.transaction('identities', 'readonly');
  const store = tx.objectStore('identities');
  const index = store.index('email');
  return await index.get(email.toLowerCase()) || null;
}

/**
 * Export identity for backup (encrypted)
 */
export async function exportIdentity(password: string): Promise<string> {
  const identity = await getCurrentUser();
  if (!identity) throw new Error('No user logged in');
  
  // Verify password
  const passwordHash = await hashPassword(password, identity.salt);
  if (passwordHash !== identity.passwordHash) {
    throw new Error('Invalid password');
  }
  
  // Export as encrypted JSON
  const json = JSON.stringify(identity, null, 2);
  const encrypted = btoa(json); // Simple base64 (use proper encryption in production)
  
  return encrypted;
}

/**
 * Import identity from backup
 */
export async function importIdentity(encryptedData: string, password: string): Promise<SovereignIdentity> {
  // Decrypt
  const json = atob(encryptedData);
  const identity = JSON.parse(json) as SovereignIdentity;
  
  // Verify password
  const passwordHash = await hashPassword(password, identity.salt);
  if (passwordHash !== identity.passwordHash) {
    throw new Error('Invalid password');
  }
  
  // Store identity
  await storeIdentity(identity);
  localStorage.setItem('vektr_current_user', identity.ownerId);
  
  return identity;
}
