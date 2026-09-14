# Blogger Role Setup Guide

## Overview
This guide explains how to set up and use the new "Blogger" role in TribeDala. Bloggers can create and publish blog posts, and can be featured on the creator network.

## Database Changes

### SQL to Run
Run the SQL in `add-blogger-role.sql` in your Supabase SQL Editor:

1. Go to https://jocwzqjzarihupnpcjmm.supabase.co
2. Click "SQL Editor" → "New Query"
3. Copy the contents of `add-blogger-role.sql` and paste it
4. Click "Run"

This adds:
- Indexes for faster queries on bloggers
- Row-level security (RLS) policies for blog post creation
- Permissions for bloggers to create, edit, and publish posts

## Code Changes (Already Done)

### Roles Available
The system now supports these roles:
- `member` - Regular community member
- `creator` - Podcasters, DJs, MCs, Videographers, etc.
- **`blogger`** - NEW: Blog post creators
- `organizer` - Event organizers
- `business` - Business/brand accounts
- `official` - Official TribeDala team
- `admin` - Super admin

### New Pages & Features

#### 1. **Admin Users Management**
- **URL:** `/admin/users`
- **Feature:** Admin can assign the "blogger" role to any user
- **Steps:**
  1. Go to `/admin/users`
  2. Find the user you want to make a blogger
  3. Click the 3-dot menu → "Edit Role"
  4. Set role to: `blogger`
  5. Check "Auto-approve for network" (optional)
  6. Click "Save Changes"

#### 2. **Blogger Dashboard**
- **URL:** `/dashboard/blog`
- **Who Can Access:** Users with role `blogger`, `creator`, or `official`
- **Features:**
  - Create new blog posts
  - Rich text editor
  - Auto-generate URL slugs
  - Save as draft or publish immediately
  - Add featured image, category, excerpt

#### 3. **Creator Network**
- **URL:** `/network`
- **Shows:** Only approved creators and bloggers (with `creator_approved = true`)
- **Changes:** Both creators and bloggers can now appear here

## How to Use

### For Admins: Assigning Blogger Role

```
Admin Dashboard → Users → Select User → Edit Role → Set to "blogger" → Save
```

**What happens:**
- User's role changes from `member` to `blogger`
- User is marked as `verified = true`
- User is marked as `status = active`
- If "Auto-approve" is checked: User appears on creator network immediately

### For Bloggers: Creating Blog Posts

1. **Sign up or login** → Go to `/dashboard`
2. **Click "Blog"** in sidebar
3. **Fill in the form:**
   - Title (slug auto-generates from title)
   - Category (Technology, Lifestyle, Business, Art, Music, Culture, Other)
   - Featured Image URL
   - Excerpt (optional, for listings)
   - Content (using rich text editor)
4. **Choose status:**
   - "Draft" = Save but don't publish yet
   - "Published" = Immediately visible on `/blog`
5. **Click "Publish"** → Post is saved!

**Published posts are visible:**
- `/blog` - Blog listing page
- `/blog/{slug}` - Individual blog post
- `/network` - If the blogger is approved and featured

### For Members: Reading Blog Posts

1. Go to `/blog` to see all published blog posts
2. Click a post to read the full content
3. Follow the blogger from their profile

## Database Schema

### Users Table (Updated)
```sql
- id (UUID)
- email (STRING)
- full_name (STRING)
- role (STRING) -- now includes 'blogger'
- creator_category (STRING)
- creator_approved (BOOLEAN)
- creator_approved_date (TIMESTAMP)
- status (STRING) -- 'active', 'pending', 'suspended'
- verified (BOOLEAN)
- ... other fields
```

### Blog Posts Table (Already Exists)
```sql
- id (UUID)
- author_id (UUID) -- FK to users.id
- title (STRING)
- slug (STRING)
- excerpt (TEXT)
- content (TEXT)
- category (STRING)
- featured_image (STRING)
- status (STRING) -- 'draft' or 'published'
- published_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## RLS Policies

The following row-level security policies are now enforced:

### Blog Posts Policies

1. **Insert:** Authenticated bloggers/creators can create posts
2. **Update:** Users can only update their own posts
3. **Select:** Anyone can view published posts; authors can view their drafts

## FAQ

**Q: Can a blogger appear on the creator network?**
A: Yes, if their role is set to `blogger` and `creator_approved = true`, they appear on `/network`

**Q: Can bloggers see draft posts?**
A: Yes, only the author can see their own draft posts

**Q: Can admins edit blogger posts?**
A: Not yet - only the blogger author can edit their own posts

**Q: What happens if I change a user's role from member to blogger?**
A: They can now create blog posts and access `/dashboard/blog`

**Q: Can a user be both creator and blogger?**
A: No, the role column is singular. Choose the primary role. Use `creator_category` to specify subcategory.

## Testing Checklist

- [ ] Run `add-blogger-role.sql` in Supabase
- [ ] Go to `/admin/users` and assign "blogger" role to a test user
- [ ] Login as the blogger user
- [ ] Navigate to `/dashboard/blog`
- [ ] Create a draft blog post
- [ ] Create a published blog post
- [ ] Check that published posts appear on `/blog`
- [ ] Go to `/network` and verify approved bloggers appear
- [ ] Read a published blog post
- [ ] Check that draft posts are hidden from `/blog` listing
