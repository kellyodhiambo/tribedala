# Debug Profile Flash Issue

## Problem Analysis

When navigating to `/dashboard/profile`, the page flashes instead of loading. This typically means:

1. **Initial render shows loading state or empty content**
2. **Profile data doesn't load from database** 
3. **Redirect happens (flashing to home or login)**

## Root Causes to Check

### 1. AuthContext Profile Loading
**Location**: `src/hooks/AuthContext.tsx`

- `fetchProfile()` queries `public.users` table
- If query fails silently, `profile` stays `null`
- AuthGuard sees `profile = null` and redirects if RLS policies block read access

**Symptoms**:
- Profile stays null even after login
- Browser console shows no errors (silent RLS failure)

### 2. RLS Policies on Users Table
**Location**: Supabase → Settings → Authentication → Policies

Current policies should allow:
- User reads their own record: `auth.uid() = id`
- User can create profile on signup
- User can update profile

**Check**: Are RLS policies correctly set? Can user read their own `users` row?

### 3. Profile Not Auto-Created on Signup
**Location**: `src/hooks/AuthContext.tsx` lines 165-192

- When user signs up or uses OAuth, `public.users` row must be created
- If creation fails silently, `profile` is `null`
- AuthGuard redirects to prevent accessing protected pages

### 4. Admin User Profile Missing
**Location**: Database `public.users` table

- UID `c2dc9add-023d-49ad-8e00-c60158dab200` must exist with `role = 'admin'`
- If missing or role is wrong, admin can't access `/admin`

---

## Step-by-Step Debugging

### Step 1: Check Database directly

**Run in Supabase SQL Editor**:

```sql
-- Check if your user profile exists
SELECT id, email, full_name, role, status, verified 
FROM public.users 
WHERE email = 'amor@tribedala.com' 
LIMIT 1;

-- Count total users
SELECT COUNT(*) as total_users FROM public.users;

-- Check RLS policies
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;
```

**Expected results**:
- User exists with correct role and email
- RLS policies include read/write/update/delete
- Policy `qual` (condition) should be `auth.uid() = id`

### Step 2: Check Browser Console

**Steps**:
1. Open DevTools (`F12`)
2. Go to Console tab
3. Navigate to `/dashboard/profile`
4. Look for errors like:

```
Profile fetch error: new row violates row-level security policy
Profile fetch exception: null
```

**Common RLS errors**:
- `new row violates row-level security policy` → Can't read own profile
- `null` → Query returned nothing
- `permission denied` → Missing policy

### Step 3: Test Profile Fetch Directly

**Add to browser console**:

```javascript
// Test if you can fetch your own profile
const supabase = window.__SUPABASE__ || supabaseClient; // depends on how it's exposed

// Get current user ID
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user?.id, user?.email);

// Try fetching profile
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .maybeSingle();

console.log('Profile data:', data);
console.log('Profile error:', error);
```

### Step 4: Test AuthContext Loading

**Edit `src/hooks/AuthContext.tsx`** - add logging:

```typescript
const fetchProfile = useCallback(async (userId: string) => {
  console.log('[AuthContext] Fetching profile for user:', userId);
  try {
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('[AuthContext] Profile query result:', { data, error: profileError });

    if (profileError) {
      console.error('[AuthContext] Profile fetch error:', profileError);
      return;
    }

    if (data) {
      console.log('[AuthContext] Profile loaded:', data);
      setProfile(data as Profile);
    } else {
      console.warn('[AuthContext] No profile found for user');
    }
  } catch (err) {
    console.error('[AuthContext] Profile fetch exception:', err);
  }
}, []);
```

Then check console when loading profile page.

---

## Solutions

### Solution 1: Fix RLS Policies

If the issue is **RLS blocking reads**, run in Supabase SQL Editor:

```sql
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;

CREATE POLICY "users_select_own_profile" ON public.users
FOR SELECT
USING (auth.uid() = id);
```

### Solution 2: Recreate User Profile

If user exists in `auth.users` but not in `public.users`:

```sql
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
)
VALUES (
  'c2dc9add-023d-49ad-8e00-c60158dab200'::uuid,
  'amor@tribedala.com',
  'Admin',
  'admin',
  'active',
  now(),
  now()
);
```

### Solution 3: Disable RLS Temporarily (for testing only)

**WARNING**: Only for debugging! Re-enable after testing.

```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

Then try accessing profile. If it works, the issue is 100% RLS policies.

---

## Expected Flow

1. User logs in → `AuthContext` calls `getSession()`
2. Session found → `AuthContext` calls `fetchProfile(user.id)`
3. `fetchProfile` queries `public.users` with RLS policy allowing read
4. Profile loads → `useAuth().profile` is set
5. AuthGuard checks `profile.role` → allows access
6. Page renders without flashing

---

## Next Action

**Do this now**:

1. Check RLS policies in Supabase
2. Add console logging to `AuthContext.tsx`
3. Check browser console when accessing profile
4. Report what errors you see

