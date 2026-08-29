# TribeDala Website Documentation

## 1. Overview

TribeDala is a Kenyan creative media and community platform designed to connect creators, audiences, brands, and event organizers around one ecosystem. The site is built around culture, storytelling, podcasts, interviews, events, verified creators, and creative services.

The platform combines three major things:

- Public media and community platform
- Creator and community membership system
- Admin dashboard for content, events, users, and applications

The brand message is simple: “You know the Tribe, You know the Vibe.”

---

## 2. What the website does

TribeDala is more than just a homepage. It acts like a digital hub for a creative community.

### Main purposes

1. Showcase the brand and mission
   - Introduces TribeDala as a creative platform based in Kisumu, Kenya
   - Highlights the community, values, and local presence

2. Publish content and media
   - Podcast episodes
   - Interview series
   - Girlies content
   - Blog posts and community stories

3. Promote events
   - Upcoming and past community events
   - Ticket details and event information
   - Event listing and organization support

4. Build a creator ecosystem
   - Verified creators directory
   - Creator categories
   - Featured talent
   - Network/community connections

5. Support community membership and sign-up
   - Users can create accounts as members, creators, organizers, or businesses
   - Members can apply to appear on shows, request services, or join community initiatives

6. Manage submissions and applications
   - Creator applications
   - Event organizer applications
   - Business/service requests
   - Collaboration requests

7. Support admin operations
   - Review submitted forms
   - Manage users and roles
   - Moderate content and events
   - View analytics and settings

---

## 3. Website structure and architecture

The app is built with:

- React + TypeScript
- Vite
- React Router
- Supabase for authentication and database
- Auth context for access control

### Route groups

The website is split into three major sections:

1. Public website
   - No special login required for browsing
   - Includes homepage, show pages, content pages, about, services, contact, team, and more

2. User dashboard
   - Accessible to members, creators, organizers, business users, and officials
   - Includes account features like overview, profile, settings, applications, and notifications

3. Admin area
   - Restricted to admin and official users
   - Includes dashboard management tools and content moderation controls

---

## 4. Public website pages

### 4.1 Home page
Route: `/`

Purpose:
- Main landing page of the website
- Sells the TribeDala brand and creative identity
- Highlights key content and community offering

Sections included:
- Hero section
- Latest content area
- About section
- Services section
- Creator spotlight
- Community section

This is the first impression page for every visitor.

---

### 4.2 About page
Route: `/about`

Purpose:
- Explains what TribeDala is
- Shows mission, values, and growth story
- Presents regional identity and community focus in Kisumu, Kenya

Sections included:
- Hero banner
- Mission statement
- Core values cards
- Stats and progress metrics
- Story/founding narrative

This page builds trust and tells the “why” behind the platform.

---

### 4.3 Shows hub
Route: `/shows`

Purpose:
- Central page listing all media shows
- Lets users browse podcast, interviews, and Girlies content

Included shows:
- Tribe Dala Podcast
- Tribe Dala Interview
- Tribe Dala Girlies

Each card includes:
- Description
- Host name
- Episode count
- Recent episodes preview
- CTA button to explore the show

This page acts as the content entry point for the media part of the brand.

---

### 4.4 Podcast page
Route: `/shows/podcast`

Purpose:
- Showcases the flagship podcast content
- Lists episodes and makes the show look premium

Features:
- Hero banner and cover image
- Host profile
- Podcast details
- Episode list with duration, date, and guest info
- CTA to request an appearance

This is where the audience can listen to or discover the podcast brand.

---

### 4.5 Interview page
Route: `/shows/interview`

Purpose:
- Focuses on video interviews and conversations with creators and changemakers

Features:
- Interview hero section
- Host information
- Video episode cards
- Guest details
- CTA for people who want to be interviewed

This page is designed for storytelling and human connection.

---

### 4.6 Girlies page
Route: `/shows/girlies`

Purpose:
- Spotlight women-led content and female voices in the TribeDala community
- Strong visual campaign style
- Makes a specific community identity clear

Features:
- Cinematic hero image
- Photo gallery / bento-style gallery
- Host profiles
- Episode overview
- CTA to be featured or participate

This is a branded segment for women creators and important conversations.

---

### 4.7 Blog page
Route: `/blog`

Purpose:
- Publishes stories, insights, updates, and creative content
- Gives the community a written content layer beyond audio/video

Likely functions:
- Blog listing cards
- Searchable or categorized article feed
- Click-through into full blog articles

---

### 4.8 Blog detail page
Route: `/blog/:slug`

Purpose:
- Shows the full content of a single post
- Gives each article a unique identity and SEO-friendly slug

This page is the detail view for blog article content.

---

### 4.9 Events page
Route: `/events`

Purpose:
- Displays public events available to the community
- Allows users to browse upcoming and past events

Features:
- Upcoming vs past tab switch
- Event cards with date, time, venue, and ticket pricing
- Event description
- CTA to get tickets
- Ticket tier information

This page is essential for the TribeDala event ecosystem.

---

### 4.10 Event detail page
Route: `/events/:id`

Purpose:
- Shows detailed event information for a single event
- Provides the ticketing call to action

Usually this would include:
- Event description and schedule
- Venue details
- Ticket tiers
- Logistics and booking details

This page turns interest into ticket sales or attendee action.

---

### 4.11 Creators page
Route: `/creators`

Purpose:
- Lists verified creators and talent in the network
- Lets users discover creators by category and name

Features:
- Search bar
- Category filters
- Creator cards with name, role, bio, and social links
- Featured creator labels

This page acts like a talent directory.

---

### 4.12 Creator detail page
Route: `/creators/:slug`

Purpose:
- Gives a full profile for each creator
- Shows their category, portfolio, and bio

This page is meant for deeper exploration and networking.

---

### 4.13 Creator network page
Route: `/network`

Purpose:
- Shows the broader creator community network
- Encourages collaboration and community-building

This is a connectivity and relationship-focused page.

---

### 4.14 Team page
Route: `/team`

Purpose:
- Introduces the official TribeDala team and leadership
- Builds trust and humanizes the brand

Features:
- Team member cards
- Photos
- Roles and bios
- Show associations

This page tells the public who is behind the platform.

---

### 4.15 Get involved page
Route: `/get-involved`

Purpose:
- Encourages users to join the ecosystem
- Lets signed-in users apply for multiple things depending on role and interest

This is one of the most important conversion pages on the site.

Supported request flows:
- Join as community member
- Apply as creator
- Request to be on a show
- Request marketing services
- Request event hosting
- Become an event organizer
- Propose a collaboration

The form logic is tied to the logged-in user account and stored in Supabase tables.

---

### 4.16 Services page
Route: `/services`

Purpose:
- Presents the business and service side of TribeDala
- Positions the platform as a creative service provider and brand partner

Included service categories:
- Content creation
- Marketing and promotion
- Event hosting and MC services
- Ticketing platform
- Collaborations and sponsorships
- Creative consulting

This page converts interested businesses and creators into paid or supported opportunities.

---

### 4.17 Contact page
Route: `/contact`

Purpose:
- Lets users contact the organization directly
- Handles general questions, collaborations, or customer inquiries

Features:
- Contact information
- Social media links
- Contact form with validation
- Success or error states

This is the communication channel for users and partners.

---

### 4.18 Login page
Route: `/login`

Purpose:
- User sign-in page
- Supports email/password login and OAuth login

Features:
- Email and password fields
- Google and Apple login buttons
- Forgot-password support
- Redirects admin and regular users to the correct dashboard

---

### 4.19 Signup page
Route: `/signup`

Purpose:
- New user registration
- Allows choice of account type with role-based onboarding

Options include:
- Community Member
- Creator
- Event Organizer
- Business / Brand

The sign-up flow creates a user profile in Supabase and stores role metadata.

---

### 4.20 Privacy and terms pages
Routes: `/privacy`, `/terms`

Purpose:
- Placeholder legal pages
- Currently show a “coming soon” state

These are not fully developed yet but are already included in the site structure.

---

### 4.21 Not found page
Route: `*`

Purpose:
- Handles broken or unknown URLs
- Maintains a branded experience instead of a raw browser error

---

## 5. User dashboard pages

The dashboard is a personalized member area. It is separated from the public site and protected by an auth guard.

### 5.1 Dashboard layout
Route: `/dashboard`

Purpose:
- Main user area after login
- Provides account overview and quick navigation

Sidebar sections:
- Overview
- Profile
- Settings
- Applications
- Notifications

This is the main section for logged-in members.

---

### 5.2 Dashboard overview
Route: `/dashboard`

Purpose:
- Summary page for personal account activity
- Shows the current type of user and their area of access

---

### 5.3 Profile page
Route: `/dashboard/profile`

Purpose:
- Allows the user to edit personal information and account profile
- Acts as a public or private profile center

---

### 5.4 Settings page
Route: `/dashboard/settings`

Purpose:
- Account preferences and configuration area
- Likely handles privacy, notifications, and profile controls

---

### 5.5 Applications page
Route: `/dashboard/applications`

Purpose:
- Shows the user’s past or active applications and requests
- Lets the user track statuses such as pending or approved

This is important for creator and service submissions.

---

### 5.6 Notifications page
Route: `/dashboard/notifications`

Purpose:
- Keeps the user informed about approvals, changes, or updates
- Supports engagement and communication between members and admin

---

## 6. Admin pages

The admin section is a separate full-screen layout with its own sidebar. Access is restricted through the auth guard and role check.

### 6.1 Admin layout
Route: `/admin`

Purpose:
- Main administrative control center
- Used for platform management, moderation, and monitoring

Sidebar items:
- Dashboard
- Content
- Events & Tickets
- Applications
- Users
- Analytics
- Settings

---

### 6.2 Admin dashboard
Route: `/admin`

Purpose:
- High-level overview of site activity
- Likely contains summary data, analytics cards, and quick actions

A strong admin dashboard should show:
- Total users
- Active creators
- Event stats
- Pending applications
- Recent activity
- Quick links to content and moderation

---

### 6.3 Admin content management
Route: `/admin/content`

Purpose:
- Manage posts, show content, media, and editorial assets
- Ideal place for publishing blog posts or website updates

This should include:
- List of content items
- Draft/publish controls
- Search and filters
- Create/edit/delete actions
- Content category management

---

### 6.4 Admin events and tickets
Route: `/admin/events`

Purpose:
- Manage event listings, organizers, and ticketing operations

This should include:
- Add/edit event information
- Ticket tiers and pricing
- Status updates like upcoming, ongoing, past, or cancelled
- Attendance-related information

---

### 6.5 Admin applications
Route: `/admin/applications`

Purpose:
- Review every request submitted through the platform

Examples:
- Creator applications
- Organizer applications
- Service requests
- Show appearance requests
- Collaboration requests

This is the admin decision center for approvals and rejections.

---

### 6.6 Admin users
Route: `/admin/users`

Purpose:
- View and manage all platform users
- Control user roles and account status

This should include:
- User roster
- Role assignment
- Verification status
- Filtering by role, category, or status

---

### 6.7 Admin analytics
Route: `/admin/analytics`

Purpose:
- Monitor platform performance and engagement
- Platform metrics for content, events, creators, and user activity

Possible data points:
- User growth
- Traffic and engagement
- Event ticket sales
- Most active creators
- Top-performing content
- Conversion metrics from sign-up and requests

---

### 6.8 Admin settings
Route: `/admin/settings`

Purpose:
- Site configuration and platform controls
- Manage global settings, maybe branding or feature toggles

This area would usually handle:
- Branding or logo setup
- Email/communication config
- Notification settings
- Access controls
- General admin preferences

---

## 7. How the admin should look like

The current admin area already has the right overall structure, and it should continue in this direction.

### Recommended admin dashboard design

1. Sidebar navigation
   - Fixed left panel
   - Clear icon + label layout
   - Active section highlighted with accent color
   - Back to site and sign-out actions at bottom

2. Top header area
   - Platform title / admin label
   - Search or quick actions
   - Status indicators

3. Main content area
   - Metrics cards at the top
   - Tables for content, requests, and users
   - Filter controls and search
   - Action buttons like approve, reject, edit, view, publish

4. Analytics section
   - Charts or summary cards
   - Key numbers and growth trends
   - Event performance data

5. Application review workflow
   - Each request should show:
     - User name
     - Role
     - Category or request type
     - Submission details
     - Status
     - Review notes
     - Approve / reject buttons

6. User management section
   - Show account type, verification status, and request status
   - Support role assignment (member, creator, organizer, business, admin, official)

7. Content and events visibility
   - Well-structured cards and list views
   - Clear status labels
   - Quick filters and sort controls

### Admin visual style

- Dark modern theme with gold/amber highlights
- High contrast for readability
- Accent colors for status and calls-to-action
- Card-based layout for pages with summary data
- Simple but professional look

This matches the branding style already used on the public site.

---

## 8. How the public will use the website

The public experience is intentionally simple and onboarding-friendly.

### Typical public user journey

1. Visitor lands on the home page
   - Sees brand identity, latest content, and community mission

2. Visitor browses content and shows
   - Listens to podcast episodes
   - Watches interviews
   - Reads blog posts
   - Explores creators and community talent

3. Visitor explores events
   - Finds upcoming events
   - Checks dates, venues, and ticket tiers
   - Registers or buys tickets if interested

4. Visitor joins the community
   - Signs up as a member, creator, organizer, or business

5. Visitor submits a request
   - Asks to be on a podcast
   - Applies as a creator
   - Requests a service
   - Proposes a collaboration

6. Visitor accesses personalized dashboard
   - Once logged in, they can manage profile settings, applications, and notices

7. Visitor contacts the brand
   - Uses contact page for inquiries, collaborations, or questions

This makes the platform both a media brand and a functional community platform.

---

## 9. User roles and access

The auth system and route guards show a role-based access model.

### Roles

- member
- creator
- organizer
- business
- official
- admin

### Access rules

- Public site pages are open to all visitors
- Logged-in standard users go to the dashboard
- Admin and official users are routed to the admin panel
- Users with pending status may be restricted from full dashboard access until approved

This keeps the system organized and prevents unauthorized access.

---

## 10. Important technical notes from the current implementation

The project already includes the following functional structure:

- Protected routes using `AuthGuard`
- Auth context with sign-in, sign-up, OAuth, and sign-out
- Supabase integration for authentication and database tables
- Public routing and dashboard routing split
- Separate admin navigation and layout
- Role-based redirects after login

This means the platform is not only a static landing page — it is designed as a real community management platform.

---

## 11. Summary

TribeDala is a creative community, media, and events platform built around the idea of growing and showcasing local talent in Kisumu and beyond. It blends:

- content distribution
- creator discovery
- event promotion
- community memberships
- user applications
- admin moderation
- promotional service offerings

The public side is meant to attract, inform, and convert visitors into members or partners, while the admin side is meant to manage all of that from one central system.

In simple terms:

- Public users browse, watch, read, join, and apply
- Members access their personal dashboard
- Admins review, manage, and grow the whole platform

This is a complete creative economy website structure, not just a marketing website.

---

## 12. Short product statement

TribeDala is a culture-first creative media and community platform that helps creators, audiences, brands, and organizers connect through podcasts, interviews, events, content, and digital opportunities in one modern ecosystem.
