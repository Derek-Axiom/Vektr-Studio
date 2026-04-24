# MANUAL INTEGRATION STEPS - COPY/PASTE READY

## ✅ COMPLETED AUTOMATICALLY:
- App.tsx updated with SovereignOnboarding ✅

## 🔧 MANUAL STEPS REQUIRED:

### STEP 1: Add Auth Import to ProfileContext.tsx

**File:** `src/lib/ProfileContext.tsx`

**Line 9 - Find this:**
```typescript
import { useSessionGuard, type RecoveredSession } from './hooks/useSessionGuard';
```

**Add this line right after it:**
```typescript
import { getCurrentUser, logOut } from './SovereignAuth';
```

---

### STEP 2: Add logout to ProfileContextType Interface

**File:** `src/lib/ProfileContext.tsx`

**Around line 20 - Find this:**
```typescript
  reorderShareableItems: (items: ShareableItem[]) => void;

  // Media Vault: The Sovereign Repository
```

**Change to:**
```typescript
  reorderShareableItems: (items: ShareableItem[]) => void;
  
  // Authentication
  logout: () => void;

  // Media Vault: The Sovereign Repository
```

---

### STEP 3: Add Auth Check on Mount

**File:** `src/lib/ProfileContext.tsx`

**Around line 165 - Find this:**
```typescript
  const { recoveredSessions, openSession, heartbeat, closeSession, dismissRecovery, checkForCrashedSessions } = useSessionGuard();

  // --- SAMPLE-RATE WATCHDOG ---
```

**Change to:**
```typescript
  const { recoveredSessions, openSession, heartbeat, closeSession, dismissRecovery, checkForCrashedSessions } = useSessionGuard();

  // --- SOVEREIGN AUTH CHECK ---
  useEffect(() => {
    getCurrentUser().then(identity => {
      if (identity) {
        setProfile(prev => ({
          ...prev,
          ownerId: identity.ownerId,
          displayName: identity.username,
          bio: identity.bio || prev.bio,
          slug: identity.slug || prev.slug,
          initialized: true,
        }));
      }
    });
  }, []);

  // --- SAMPLE-RATE WATCHDOG ---
```

---

### STEP 4: Add Logout Function

**File:** `src/lib/ProfileContext.tsx`

**Around line 405 - Find this:**
```typescript
  const reorderShareableItems = (items: ShareableItem[]) => {
    setShareableItems(items);
  };

  return (
```

**Change to:**
```typescript
  const reorderShareableItems = (items: ShareableItem[]) => {
    setShareableItems(items);
  };
  
  const logout = () => {
    logOut();
    setProfile(defaultProfile);
    setShareableItems([]);
    setVault([]);
    setLyricBooks([]);
    setActiveMediaId(null);
    localStorage.clear();
  };

  return (
```

---

### STEP 5: Add Logout to Context Value

**File:** `src/lib/ProfileContext.tsx`

**Around line 415 - Find this:**
```typescript
      shareableItems, addShareableItem, updateShareableItem, removeShareableItem, reorderShareableItems,
      activeMediaId, setActiveMediaId,
```

**Change to:**
```typescript
      shareableItems, addShareableItem, updateShareableItem, removeShareableItem, reorderShareableItems,
      logout,
      activeMediaId, setActiveMediaId,
```

---

## ✅ VERIFICATION

After making these changes, check:

1. **No TypeScript errors** - Run `npm run dev`
2. **Navigate to /onboarding** - Should see new UI
3. **Sign up** - Should create account
4. **Check IndexedDB** - Should see `vektr_auth` database
5. **Logout** - Should clear session
6. **Login** - Should restore identity

---

## 🎯 FILES CREATED

All these files are ready:
- ✅ src/lib/SovereignAuth.ts
- ✅ src/lib/DeterministicPRNG.ts
- ✅ src/lib/ProofOfDeterminism.ts
- ✅ src/lib/EnhancedProofSystem.ts
- ✅ src/lib/AuthGuard.tsx
- ✅ src/pages/SovereignOnboarding.tsx
- ✅ src/lib/MetabolicVisualizer.ts
- ✅ src/lib/KineticLyricSyncopator.ts
- ✅ src/lib/UnifiedVisualizer.ts
- ✅ src/components/UnifiedVisualizer.tsx

**Just need to wire them up with these 5 manual steps.**

---

## 🚨 IF YOU GET STUCK

The changes are simple - just adding:
1. One import
2. One interface property
3. One useEffect
4. One function
5. One property in context value

If any step fails, let me know which line number and I'll help debug.
