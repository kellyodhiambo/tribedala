# ⚡ QUICK TEST GUIDE - Phase 1 Fixes

**Time to complete all tests**: ~5 minutes
**Status**: Ready to verify

---

## 🚀 BEFORE YOU START

1. Make sure dev server is running:
   ```bash
   npm run dev
   ```

2. Verify Supabase connection:
   - Check `.env` file has correct keys
   - Project: prllmmcscqlsiezgaqrb

3. Run IMMEDIATE_FIXES.sql:
   - Follow instructions in TASK_1_AUTH_FIX.md
   - Required for login to work

---

## ✅ TEST #1: AUTH FLOW (Task #1)

### Steps
1. Open http://localhost:5173/login
2. Enter:
   - Email: `amor@tribedala.com`
   - Password: (your password)
3. Click: **Sign In**

### Expected Result
- ✅ Dashboard loads
- ✅ No "Failed to fetch" error
- ✅ Redirects to dashboard
- ✅ User profile visible

### If It Fails
- [ ] Did you run IMMEDIATE_FIXES.sql?
- [ ] Check Supabase SQL Editor for errors
- [ ] Verify admin user exists: `SELECT * FROM public.users WHERE email = 'amor@tribedala.com'`

**Time**: 2 min

---

## ✅ TEST #2: PROFILE SAVE (Task #2)

### Steps
1. After login, go to: **Dashboard → Profile**
2. Change any field:
   - Full Name: Change to something new
   - Bio: Add a new bio
   - Location: Change location
3. Click: **Save Changes**
4. Wait for confirmation

### Expected Result
- ✅ Message: "✅ Profile updated successfully!"
- ✅ Form doesn't clear
- ✅ No errors in console

### Verify in Database
1. Go to Supabase dashboard
2. Select: `public.users` table
3. Find user with email: amor@tribedala.com
4. Check: `full_name`, `bio`, `location` updated
5. Check: `updated_at` is recent timestamp

### If It Fails
- [ ] Check browser console for errors
- [ ] Verify Supabase connection in .env
- [ ] Check RLS policies on `users` table
- [ ] Try with different field values

**Time**: 2 min

---

## ✅ TEST #3: CONTACT FORM (Task #3)

### Steps
1. Go to: `/contact`
2. Fill out form:
   - **Name**: "Test User"
   - **Email**: "test@example.com"
   - **Subject**: "Test Message"
   - **Message**: "This is a test message"
3. Click: **Send Message**
4. Wait for response

### Expected Result
- ✅ Message: "Message sent! We'll get back to you within 48 hours."
- ✅ Form clears automatically
- ✅ No errors in console

### Verify in Database
1. Go to Supabase dashboard
2. Select: `public.inquiries` table
3. Find your submitted message
4. Check all fields saved correctly

### If It Fails
- [ ] Check: Did IMMEDIATE_FIXES.sql create `inquiries` table?
- [ ] Run: `SELECT * FROM public.inquiries;` in Supabase
- [ ] Check browser console for errors
- [ ] Verify Supabase import in contact page

**Time**: 2 min

---

## ✅ TEST #4: ADMIN CONTENT (Task #4)

### Steps
1. Go to: **Admin → Content Management**
   - Or navigate to: `/admin/content`
2. Verify page loads

### Expected Result
- ✅ Page loads (no errors)
- ✅ Content list visible (or empty state)
- ✅ Tabs work: "All", "Blog Posts", "Podcast Episodes"
- ✅ Search works
- ✅ No console errors

### Test Creating Content
1. Click: **New Content**
2. Fill form:
   - Title: "Test Episode"
   - Type: Select "podcast"
   - Category: "Music"
   - Author: "Test Author"
   - Status: "draft"
3. Click: **Save Content**
4. Verify content appears in table

### Test Filtering
1. Click: **Blog Posts** tab
2. Should show: Only blog content (or empty)
3. Click: **Podcast Episodes** tab
4. Should show: Only podcast content (or empty)
5. Click: **All** tab
6. Should show: All content

### Test Deletion
1. Click delete (trash) icon on any item
2. Confirm deletion
3. Item disappears from list

### If It Fails
- [ ] Check: Did IMMEDIATE_FIXES.sql create tables?
- [ ] Run: `SELECT * FROM public.episodes;` in Supabase
- [ ] Run: `SELECT * FROM public.blog_posts;` in Supabase
- [ ] Check browser console for errors
- [ ] Verify query logic in fetchContent()

**Time**: 1 min

---

## 📋 VERIFICATION CHECKLIST

### All Tests Pass ✅
- [ ] Task #1: Login works
- [ ] Task #2: Profile saves
- [ ] Task #3: Contact form saves
- [ ] Task #4: Admin content loads

### Database Verification ✅
- [ ] `inquiries` table has contact submissions
- [ ] `episodes` table accessible
- [ ] `blog_posts` table accessible
- [ ] `users` table updated with profile changes

### No Console Errors ✅
- [ ] Browser console clean (F12)
- [ ] No network errors
- [ ] No permission errors
- [ ] All API calls successful

---

## 🆘 QUICK TROUBLESHOOTING

### General: "Failed to fetch"
**Causes**:
- Supabase connection down
- Invalid API keys in .env
- CORS issues

**Fix**:
1. Check .env keys match Supabase project
2. Verify project is online
3. Refresh page

### Task #1: Can't login
**Causes**:
- IMMEDIATE_FIXES.sql not run
- RLS policies still broken
- Admin user doesn't exist

**Fix**:
1. Run IMMEDIATE_FIXES.sql in Supabase
2. Verify admin user exists
3. Check RLS is enabled

### Task #2: Profile not saving
**Causes**:
- RLS policies blocking update
- Supabase connection issue
- Wrong user ID

**Fix**:
1. Check RLS policies allow user update
2. Verify admin user ID is correct
3. Check Supabase logs

### Task #3: Contact form not submitting
**Causes**:
- `inquiries` table doesn't exist
- RLS policies blocking insert
- Import error

**Fix**:
1. Verify `inquiries` table created
2. Check RLS allows public insert
3. Verify import: `import { supabase }`

### Task #4: Admin content blank
**Causes**:
- Tables don't exist
- Query error
- No data in tables

**Fix**:
1. Check tables exist: `episodes`, `blog_posts`
2. Insert test data
3. Check browser console for errors

---

## 📞 CONTACTS

**Supabase Dashboard**: https://app.supabase.com
**Project ID**: prllmmcscqlsiezgaqrb
**Admin Email**: amor@tribedala.com

---

## ⏱️ TIMING

| Test | Time |
|------|------|
| Auth Flow | 2 min |
| Profile Save | 2 min |
| Contact Form | 2 min |
| Admin Content | 1 min |
| **TOTAL** | **~7 min** |

---

## ✨ NEXT STEPS

After all tests pass:

1. ✅ Phase 1 Complete
2. → Begin Phase 2: Payment Integration
3. → Implement M-Pesa flow
4. → Add ticket purchasing

---

**Last Updated**: 2026-08-28
**Status**: Ready to Test
**Next**: Phase 2 - Payments

