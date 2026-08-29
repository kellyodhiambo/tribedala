# 🔧 SQL FIX - PostgreSQL Query Error

**Issue**: "ERROR 42703: column 'schemaname' does not exist"
**Cause**: Incorrect PostgreSQL system table reference
**Solution**: Use corrected SQL file

---

## ✅ SOLUTION

### If You Got The Error:

**Step 1**: Delete or ignore the old file
```
❌ IMMEDIATE_FIXES.sql (has error on line 183)
```

**Step 2**: Use the new corrected file
```
✅ IMMEDIATE_FIXES_v2.sql (has fixed SQL queries)
```

### How to Fix (2 minutes)

1. Open file: `IMMEDIATE_FIXES_v2.sql`
2. Select all (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to: Supabase SQL Editor → New Query
5. Paste (Ctrl+V)
6. Click: **Run**
7. Wait 10-20 seconds
8. You should see: ✅ Success (no errors)

---

## 📝 WHAT WAS WRONG

**Old SQL (line 183)**:
```sql
SELECT schemaname, tablename, rowsecurity FROM pg_class
INNER JOIN pg_namespace ON relnamespace = pg_namespace.oid
WHERE nspname = 'public' AND relname = 'users';
```

**Problem**: 
- `schemaname` doesn't exist in `pg_class`
- Need to use proper column references

**Fixed SQL**:
```sql
SELECT n.nspname as schemaname, c.relname as tablename, c.relrowsecurity as rowsecurity 
FROM pg_class c
INNER JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'users';
```

---

## 🎯 USE THIS FILE NOW

👉 **Open**: `IMMEDIATE_FIXES_v2.sql`
- Corrected all SQL queries
- Same functionality
- No PostgreSQL errors
- Ready to execute

---

## ✅ VERIFICATION

After running IMMEDIATE_FIXES_v2.sql:

1. Check: Admin user visible
```sql
SELECT id, email FROM public.users 
WHERE email = 'amor@tribedala.com';
```

2. Check: RLS enabled
```sql
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

3. Check: Tables created
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('inquiries', 'payments', 'tickets', 'audit_logs');
```

---

## 🚀 NEXT STEPS

1. ✅ Run IMMEDIATE_FIXES_v2.sql
2. ✅ Verify queries above return results
3. ✅ Test login as amor@tribedala.com
4. ✅ Continue with testing

---

## 📞 IF STILL HAVING ISSUES

**Q: I'm still getting SQL errors**
A: Make sure you're using IMMEDIATE_FIXES_v2.sql, not the original IMMEDIATE_FIXES.sql

**Q: The test login fails**
A: Check that IMMEDIATE_FIXES_v2.sql ran without errors first

**Q: Some tables already exist**
A: That's OK - the SQL uses `IF NOT EXISTS` so it won't duplicate tables

---

**Status**: FIXED ✅
**Use File**: IMMEDIATE_FIXES_v2.sql
**Next**: Run SQL, then test

