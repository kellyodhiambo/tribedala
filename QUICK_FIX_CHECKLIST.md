# TribeDala - Quick Fix Checklist

**Goal**: Get the app working and create a clear roadmap
**Time**: Complete in 2-3 hours

---

## ⚡ PHASE 1: UNBLOCK AUTH (15 minutes)

### SQL Fixes
- [ ] Go to Supabase dashboard
- [ ] Click SQL Editor
- [ ] Create new query
- [ ] Copy-paste entire `IMMEDIATE_FIXES.sql` file
- [ ] Click "Run"
- [ ] Wait for query to complete successfully

### Test Login
- [ ] Go to http://localhost:5173/login
- [ ] Email: `amor@tribedala.com`
- [ ] Password: (your password)
- [ ] Expected: Admin dashboard loads (no "Failed to fetch")
- [ ] Success ✅ or Failure ❌ ?

If **failed**:
1. Check Supabase dashboard for error messages
2. Verify admin user exists: `SELECT * FROM public.users WHERE email = 'amor@tribedala.com'`
3. Check RLS is enabled: `SELECT schemaname, tablename, rowsecurity FROM pg_class...`

---

## 🔧 PHASE 2: FIX CODE BUGS (45 minutes)

### Bug #1: Admin Content Query (Wrong Table)

**File**: `src/pages/admin/content/page.tsx`

**Find this line** (~line 30-50):
```typescript
const { data } = await supabase.from('content').select('*');
```

**Replace with**:
```typescript
const [episodesData, postsData] = await Promise.all([
  supabase.from('episodes').select('*'),
  supabase.from('blog_posts').select('*'),
]);

const data = [
  ...(episodesData.data || []).map(ep => ({
    ...ep,
    type: 'Episode',
    category: ep.type,
  })),
  ...(postsData.data || []).map(post => ({
    ...post,
    type: 'Blog Post',
    category: post.category,
  })),
];
```

**Verify**: [ ] Admin can now view content

---

### Bug #2: Profile Save Handler (Empty Function)

**File**: `src/pages/dashboard/profile/page.tsx`

**Find this function** (~line 60-70):
```typescript
const handleSave = async () => {
  // Empty function - does nothing!
};
```

**Replace with**:
```typescript
const handleSave = async () => {
  setLoading(true);
  try {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        bio: formData.bio,
        location: formData.location,
        social_links: formData.social_links,
        portfolio_links: formData.portfolio_links,
        notification_email: formData.notification_email,
        notification_inapp: formData.notification_inapp,
        privacy_profile_visible: formData.privacy_profile_visible,
        privacy_allow_messages: formData.privacy_allow_messages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      alert('❌ Error saving profile: ' + error.message);
    } else {
      alert('✅ Profile saved successfully!');
      // Optionally: refresh profile data
      window.location.reload();
    }
  } catch (err) {
    alert('❌ Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

**Verify**: 
- [ ] Can edit profile fields
- [ ] Click "Save" updates database
- [ ] Receive success message

---

### Bug #3: Contact Form Database Submission

**File**: `src/pages/contact/page.tsx`

**Find this function** (~line 50-80):
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  // Form validation only - no DB save
  setSuccess(true);
  // Message never saved!
};
```

**Replace with**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate fields
  if (!formData.name || !formData.email || !formData.subject || !formData.message) {
    setError('Please fill in all fields');
    return;
  }

  setLoading(true);
  try {
    // Save to database
    const { error } = await supabase
      .from('inquiries')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          status: 'new',
        }
      ]);

    if (error) {
      setError('Failed to send message: ' + error.message);
      setSuccess(false);
    } else {
      setSuccess(true);
      setError('');
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      
      // Show success for 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }
  } catch (err) {
    setError('Error: ' + err.message);
    setSuccess(false);
  } finally {
    setLoading(false);
  }
};
```

**Verify**:
- [ ] Submit contact form
- [ ] Message saved to `inquiries` table
- [ ] Success message shows
- [ ] Form clears

---

## ✅ PHASE 3: VERIFY EVERYTHING (15 minutes)

### Checklist
- [ ] Auth flow works (login succeeds)
- [ ] Admin dashboard loads
- [ ] Profile save works (change name → save → check DB)
- [ ] Contact form saves (submit → check inquiries table)
- [ ] Admin content page loads (no errors)
- [ ] No "Failed to fetch" errors in console

### Commands to Test
```bash
# In browser console:

// 1. Check auth
console.log(localStorage.getItem('supabase.auth.token'));

// 2. Verify admin role
// Go to Admin panel, click "Users" - should load

// 3. Test contact form
// Go to /contact, fill and submit
// Check Supabase: SELECT * FROM public.inquiries

// 4. Test profile save
// Go to /dashboard/profile, edit name, click save
// Check: SELECT full_name FROM public.users WHERE email = 'amor@tribedala.com'
```

---

## 📊 DOCUMENTATION (10 minutes)

### Read These (In Order)
1. [ ] README_CURRENT_STATUS.md (quick overview)
2. [ ] PROJECT_STATUS_SUMMARY.md (feature status)
3. [ ] DEVELOPMENT_ROADMAP.md (implementation guide)

### Understand
- [ ] Current blockers (auth, payment)
- [ ] What's working (auth, blog, events)
- [ ] What's missing (payments, SEO, real-time)
- [ ] Priority roadmap (9 phases)

---

## 🎯 NEXT STEPS AFTER THIS CHECKLIST

### Immediate (Your Choice)
Choose one:
- **Option A**: Implement M-Pesa payments (follow Phase 2 in DEVELOPMENT_ROADMAP.md)
- **Option B**: Fix SEO (follow Phase 3 in DEVELOPMENT_ROADMAP.md)
- **Option C**: Add more features (blog comments, real-time, etc.)

### Week 1 Goals
- [ ] Auth completely working
- [ ] All forms saving to database
- [ ] Admin panel fully functional
- [ ] No console errors

### Week 2 Goals
- [ ] Payment processing implemented
- [ ] Tickets can be purchased
- [ ] Email notifications sent

### Week 3 Goals
- [ ] SEO optimized
- [ ] Sitemap generated
- [ ] Meta tags on all pages

---

## 🆘 TROUBLESHOOTING

### Still Getting "Failed to fetch"
1. Check RLS is disabled for now:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```
2. Try login again
3. If it works: RLS policy is wrong (we'll fix later)
4. If it still fails: Supabase connection issue

### Profile Save Not Working
1. Check user ID in auth: `console.log(user.id)`
2. Verify user exists in DB: `SELECT id FROM public.users WHERE id = 'user_id'`
3. Check for TypeScript errors
4. Check browser console for error messages

### Contact Form Not Saving
1. Verify `inquiries` table exists: `SELECT * FROM public.inquiries LIMIT 1`
2. Check RLS policy allows inserts: `INSERT INTO public.inquiries...`
3. Check for JavaScript errors in browser console

---

## 📈 SUCCESS CRITERIA

When this checklist is complete:
- ✅ App is no longer blocking on auth
- ✅ Users can update their profiles
- ✅ Contact inquiries are saved
- ✅ Admin can see all content
- ✅ Clear roadmap for next work

**Estimated time**: 2-3 hours for a developer

---

## 💾 REFERENCE

**Files Involved**:
- `src/pages/admin/content/page.tsx`
- `src/pages/dashboard/profile/page.tsx`
- `src/pages/contact/page.tsx`
- `IMMEDIATE_FIXES.sql` (database fixes)

**All Changes Are**:
- ✅ Backwards compatible
- ✅ Non-breaking
- ✅ Easy to roll back
- ✅ Well-documented

---

## ✨ What You'll Have After This

A **fully functional MVP** with:
- Working authentication ✅
- Database-backed forms ✅
- User profile management ✅
- Admin content management ✅
- Clear development roadmap ✅

**Next**: Payments → SEO → Features → Security

---

**Let's go! 🚀**

