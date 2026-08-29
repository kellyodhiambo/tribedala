# ✅ TASK #1: Fix Auth Flow - Run IMMEDIATE_FIXES.sql

**Time**: 15 minutes
**Status**: Starting now
**Impact**: Unblocks all app access

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Sign in with your account
3. Select project: **prllmmcscqlsiezgaqrb**

### Step 2: Navigate to SQL Editor
1. Click: **SQL Editor** (in left sidebar)
2. Click: **New Query** (top left)

### Step 3: Copy SQL
1. Open file: `IMMEDIATE_FIXES_v2.sql` (in your project root) - **This is the corrected version**
2. Select all text (Ctrl+A)
3. Copy (Ctrl+C)
   - Note: If you used the old IMMEDIATE_FIXES.sql, try IMMEDIATE_FIXES_v2.sql instead (has fixed SQL)

### Step 4: Paste into Supabase
1. In Supabase SQL Editor, click in the query area
2. Paste the entire SQL (Ctrl+V)
3. You should see 3 distinct blocks:
   - BLOCK 1: Disable RLS and drop policies
   - BLOCK 2: Recreate corrected policies
   - BLOCK 3: Create missing tables

### Step 5: Execute
1. Click: **Run** button (top right) or press Cmd+Enter
2. Wait for completion (should take 10-20 seconds)
3. You should see: "✓ Success" messages

### Step 6: Verify Success
Run this verification query to confirm:

```sql
SELECT * FROM public.users WHERE email = 'amor@tribedala.com';
```

You should see:
- ✅ Admin user exists
- ✅ email: amor@tribedala.com
- ✅ role: admin
- ✅ verified: true

### Step 7: Test Login
1. Go to your app: http://localhost:5173/login
2. Enter:
   - Email: `amor@tribedala.com`
   - Password: (your password)
3. Click: **Sign In**
4. Expected: ✅ Dashboard loads (no "Failed to fetch" error)

---

## 📋 WHAT THIS SQL DOES

### BLOCK 1: Clean Up Broken Policies
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drops all problematic RLS policies
DROP POLICY IF EXISTS "users_can_create_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.users;
-- ... (more drops)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

**Why**: The old policies were causing infinite recursion

---

### BLOCK 2: Create Correct Policies
```sql
-- Users can insert their own profile
CREATE POLICY "users_insert_own_profile" ...

-- Users can view their own profile
CREATE POLICY "users_select_own_profile" ...

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ...

-- Public can read profiles (temporary)
CREATE POLICY "public_read_profiles" ...

-- Admins can update users
CREATE POLICY "admin_update_any_user" ...
```

**Why**: These policies work without infinite recursion

---

### BLOCK 3: Create Missing Tables
```sql
-- For contact form submissions
CREATE TABLE IF NOT EXISTS public.inquiries (...)

-- For payment tracking
CREATE TABLE IF NOT EXISTS public.payments (...)

-- For ticket management
CREATE TABLE IF NOT EXISTS public.tickets (...)

-- For admin logging
CREATE TABLE IF NOT EXISTS public.audit_logs (...)
```

**Why**: These tables are needed for features in Tasks 2-4

---

## ✅ SUCCESS CHECKLIST

After running the SQL:

- [ ] No errors in Supabase
- [ ] Admin user visible in database
- [ ] Can login as amor@tribedala.com
- [ ] Dashboard loads without errors
- [ ] No "Failed to fetch" messages
- [ ] inquiries table exists
- [ ] payments table exists
- [ ] tickets table exists

---

## ⚠️ TROUBLESHOOTING

### Issue: "Permission denied" error
**Cause**: Not connected as admin
**Fix**: Make sure you're logged into Supabase with the correct account

### Issue: "Table already exists" error
**Fix**: This is OK - the SQL uses `CREATE TABLE IF NOT EXISTS`
Continue running - it will skip existing tables

### Issue: "Column already exists" error
**Fix**: Also OK - means the table structure already has those columns
The SQL will complete successfully

### Issue: Still can't login after running
**Fix**: 
1. Check the admin user exists: `SELECT * FROM public.users WHERE email = 'amor@tribedala.com'`
2. If not visible, the admin user might not exist in Supabase Auth
3. Create the user in Supabase Auth dashboard first
4. Then run the SQL again

---

## 🎯 NEXT STEPS

Once this is complete:

1. ✅ Auth works - login succeeds
2. → Move to Task #2: Fix Profile Save Handler
3. → Then Task #3: Fix Contact Form
4. → Then Task #4: Fix Admin Content Query

---

## 📞 QUICK REFERENCE

**Supabase Dashboard**: https://app.supabase.com
**Project ID**: prllmmcscqlsiezgaqrb
**Admin Email**: amor@tribedala.com
**SQL File**: IMMEDIATE_FIXES.sql

---

## ✨ THAT'S IT!

Once you run this SQL and verify login works, Task #1 is complete!

**Time taken**: ~15 minutes
**Result**: Auth flow fixed ✅
**Next**: Task #2

