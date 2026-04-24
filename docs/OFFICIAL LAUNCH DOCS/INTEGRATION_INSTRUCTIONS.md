# COPY/PASTE INTEGRATION INSTRUCTIONS

## 🔥 REPLACE ENTIRE FILES (Easiest Method)

### Step 1: Replace App.tsx
1. Open `src/App.tsx`
2. Delete ALL contents
3. Copy ALL contents from `src/App.SOVEREIGN.tsx`
4. Paste into `src/App.tsx`
5. Save

### Step 2: Add Auth Import to ProfileContext.tsx
1. Open `src/lib/ProfileContext.tsx`
2. Find line 9 (the imports section)
3. After this line:
   ```typescript
   import { useSessionGuard, type RecoveredSession } from './hooks/useSessionGuard';
   ```
4. Add this line:
   ```typescript
   import { getCurrentUser, logOut } from './SovereignAuth';
   ```
5. Save

### Step 3: Add Logout to ProfileContext Interface
1. Still in `src/lib/ProfileContext.tsx`
2. Find the `ProfileContextType` interface (around line 18)
3. After `reorderShareableItems` line, add:
   ```typescript
   // Authentication
   logout: () => void;
   ```
4. Save

### Step 4: Add Auth Check on Mount
1. Still in `src/lib/ProfileContext.tsx`
2. Find the line with `useSessionGuard()` (around line 165)
3. After that line, add:
   ```typescript
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
   ```
5. Save

### Step 5: Add Logout Function
1. Still in `src/lib/ProfileContext.tsx`
2. Find the `reorderShareableItems` function (around line 405)
3. After that function, add:
   ```typescript
   const logout = () => {
     logOut();
     setProfile(defaultProfile);
     setShareableItems([]);
     setVault([]);
     setLyricBooks([]);
     setActiveMediaId(null);
     localStorage.clear();
   };
   ```
4. Save

### Step 6: Add Logout to Context Value
1. Still in `src/lib/ProfileContext.tsx`
2. Find the `return` statement with `<ProfileContext.Provider value={{`
3. In the value object, after `reorderShareableItems,` add:
   ```typescript
   logout,
   ```
4. Save

### Step 7: Add Logout Button to Layout
1. Open `src/components/Layout.tsx`
2. Add import at top:
   ```typescript
   import { LogOut } from '../lib/icons';
   ```
3. Get logout from context:
   ```typescript
   const { profile, logout } = useProfile();
   ```
4. Add button in header (wherever you want it):
   ```tsx
   <button
     onClick={() => {
       if (confirm('Log out of VEKTR STUDIO?')) {
         logout();
         navigate('/onboarding');
       }
     }}
     className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors flex items-center gap-2"
   >
     <LogOut className="w-4 h-4" />
     Logout
   </button>
   ```
5. Save

---

## 🧪 TESTING

Run the app:
```bash
npm run dev
```

Then follow the test steps in SOVEREIGN_AUTH_INTEGRATION.md

---

## ✅ CHECKLIST

- [ ] Replaced App.tsx with sovereign version
- [ ] Added SovereignAuth import to ProfileContext
- [ ] Added logout to ProfileContext interface
- [ ] Added auth check on mount
- [ ] Added logout function
- [ ] Added logout to context value
- [ ] Added logout button to Layout
- [ ] Tested signup flow
- [ ] Tested login flow
- [ ] Tested logout flow
- [ ] Tested persistence

---

## 🚨 IF SOMETHING BREAKS

1. Check browser console for errors
2. Check that all imports are correct
3. Verify SovereignAuth.ts exists in src/lib/
4. Verify SovereignOnboarding.tsx exists in src/pages/
5. Clear browser cache and try again

If still broken, revert App.tsx and we'll debug step by step.
