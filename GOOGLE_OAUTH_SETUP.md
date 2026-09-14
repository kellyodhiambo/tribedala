# Create New Google OAuth Credentials for TribeDala

## Step 1: Go to Google Cloud Console

**URL**: https://console.cloud.google.com/apis/credentials

---

## Step 2: Create OAuth 2.0 Client ID

1. Click **+ CREATE CREDENTIALS** (top button)
2. Select **OAuth client ID**
3. If prompted: **Configure OAuth consent screen first**
   - Choose **External** user type
   - Fill in:
     - **App name**: TribeDala
     - **User support email**: your-email@gmail.com
     - **Developer contact email**: your-email@gmail.com
   - Click **SAVE AND CONTINUE** through all screens
   - Return to Credentials page

---

## Step 3: Create Web Application Credentials

1. Click **+ CREATE CREDENTIALS** again
2. Choose **OAuth client ID**
3. Select **Web application** from dropdown
4. **Name**: `TribeDala Web`

### Authorized JavaScript Origins
Click **+ Add URI** and add:
```
http://localhost:5173
https://tribedala.com
```

### Authorized Redirect URIs
Click **+ Add URI** and add:
```
http://localhost:5173/auth/v1/callback
https://tribedala.com/auth/v1/callback
https://jocwzqjzarihupnpcjmm.supabase.co/auth/v1/callback
```

5. Click **CREATE**

---

## Step 4: Copy Credentials

You'll see a popup with:
- **Client ID**
- **Client Secret**

**Copy both** - you'll need them next.

---

## Step 5: Add to Supabase

1. Go to: https://jocwzqjzarihupnpcjmm.supabase.co
2. **Settings → Authentication → Providers → Google**
3. **Paste**:
   - **Client ID**: (from Google Cloud)
   - **Client Secret**: (from Google Cloud)
4. **Toggle**: Enable Google
5. **Click**: Save

---

## Step 6: Test

1. Go to: http://localhost:5173/signup
2. Click **Sign up with Google**
3. Should redirect to Google login
4. After approval, should create user and log in

---

## Done!

Google OAuth is now set up for your new Supabase project!

