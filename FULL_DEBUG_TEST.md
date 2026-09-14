# Full Debugging Test for Profile Flash Issue

## 🚀 Your Dev Server is Running

**URL**: http://localhost:5174

---

## 📋 Test Checklist

### Test 1: Check Database Profile Exists
Go to Supabase → SQL Editor and run:

```sql
SELECT id, email, full_name, role, status, verified 
FROM public.users 
WHERE email = 'amor@tribedala.com';
```

**Expected**: Returns 1 row with `role = 'admin'`

**If empty**: Profile wasn't created. Run:
```sql
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  status,
  admin_role,
  verified,
  created_at,
  updated_at
)
VALUES (
  'c2dc9add-023d-49ad-8e00-c60158dab200'::uuid,
  'amor@tribedala.com',
  'Admin',
  'admin',
  'active',
  'super_admin',
  true,
  now(),
  now()
);
```

---

### Test 2: Check RLS Policies

Run in SQL Editor:

```sql
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;
```

**Expected policies**:
- `users_select_own_profile` - SELECT - USING `auth.uid() = id`
- `users_update_own_profile` - UPDATE - USING `auth.uid() = id`
- `users_delete_own_profile` - DELETE - USING `auth.uid() = id`
- `users_insert_own_profile` - INSERT - WITH CHECK `auth.uid() = id`

**If missing**: Run `FIX_RLS_POLICIES.sql` in SQL Editor

---

### Test 3: Login and Check Console

1. **Go to**: http://localhost:5174/login
2. **Login with**: amor@tribedala.com + password
3. **Open DevTools**: Press `F12`
4. **Go to**: Console tab
5. **Look for logs** (you'll see emoji indicators):

```
[AuthContext] 🔍 Fetching profile for user: c2dc9add-023d-49ad-8e00-c60158dab200
[AuthContext] 📊 Profile query result: { data: {...}, error: null }
[AuthContext] ✅ Profile loaded successfully: {...}
```

**If you see**:
- ❌ `Profile fetch error: new row violates row-level security policy` → RLS blocking
- ❌ `Profile fetch error: null` → No profile in database
- ⚠️ `No profile found for user` → Profile query returned nothing
- 💥 `Profile fetch exception: ...` → JavaScript error

---

### Test 4: Navigate to Dashboard

1. **After login**, go to: http://localhost:5174/dashboard/profile
2. **Check console for**:

```
[AuthGuard] 🛡️ Checking access: {
  loading: false,
  hasUser: true,
  hasProfile: true,
  userRole: "admin",
  allowedRoles: ["member", "creator", "organizer", "business", "official"],
  pathname: "/dashboard",
  allowed: true
}
[AuthGuard] ✅ Access granted
```

**If flashing happens**, look for:
- ❌ `Role not allowed` → Wrong role
- ⏳ `Waiting for profile to load...` → Profile not loading
- ❌ `No user, redirecting to login` → Session lost

---

### Test 5: Navigate to Admin

1. **Go to**: http://localhost:5174/admin
2. **Check console for**:

```
[AuthGuard] 🛡️ Checking access: {
  loading: false,
  hasUser: true,
  hasProfile: true,
  userRole: "admin",
  allowedRoles: ["admin", "official"],
  pathname: "/admin",
  allowed: true
}
[AuthGuard] ✅ Access granted
```

---

## 🔧 If Tests Fail

### Scenario 1: RLS is Blocking Profile Read

**Console shows**: `new row violates row-level security policy`

**Fix**:
1. Go to Supabase SQL Editor
2. Run `FIX_RLS_POLICIES.sql`
3. Refresh browser

### Scenario 2: Profile Not in Database

**Console shows**: `No profile found for user`

**Fix**:
1. Go to Supabase SQL Editor
2. Run the INSERT query from Test 1
3. Refresh browser

### Scenario 3: Session Not Found After Login

**Console shows**: `No session found` after login

**Fix**:
1. Check `.env` has correct Supabase URL and keys
2. Verify browser cookies are enabled
3. Try private/incognito window
4. Check browser console for Supabase initialization errors

### Scenario 4: Profile Loads but Still Flashing

**Console shows**: `Profile loaded successfully` but page still flashes

**Likely cause**: Page component still has issues

**Debug**:
1. Check if DashboardLayout component has issues
2. Open `/dashboard` (not `/dashboard/profile`)
3. If that works, problem is in profile page component
4. If that flashes too, problem is in DashboardLayout or AuthGuard

---

## 📊 Debug Workflow

1. **Open http://localhost:5174**
2. **F12 → Console tab**
3. **Try to login**
4. **Check all logs** (look for emoji indicators)
5. **Navigate to `/dashboard/profile`**
6. **Check if page loads or flashes**
7. **Screenshot or copy console output**
8. **Tell me what you see**

---

## 🎯 What Should Happen (No Flash)

1. Click login
2. Enter credentials
3. Redirected to `/dashboard` (no flash)
4. Profile loads
5. Can navigate to `/dashboard/profile` (no flash)
6. Can navigate to `/admin` if admin (no flash)
7. Profile page shows form with user data

---

## 📝 Report Back

When you've done the tests, tell me:

1. **Which test failed?** (1, 2, 3, 4, or 5)
2. **What error did you see?** (copy exact console message)
3. **Does page flash or freeze?**
4. **What logs appear?** (emoji indicators)
5. **URL where it happens**

Then I can fix it!

