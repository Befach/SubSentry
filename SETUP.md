# SubSentry Setup Guide

This guide will help you configure Clerk authentication and Supabase database for SubSentry.

## Prerequisites

- Node.js 18+ installed
- A Clerk account (https://clerk.com)
- A Supabase account (https://supabase.com)

## 1. Clerk Authentication Setup

### Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com/
2. Click "Create Application"
3. Choose "Google" as the OAuth provider
4. Copy your **Publishable Key**

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Clerk publishable key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

### Step 3: Configure OAuth Redirects

In your Clerk dashboard:
1. Go to "User & Authentication" → "Social Connections"
2. Enable "Google"
3. Add redirect URLs:
   - `http://localhost:3000/dashboard` (development)
   - Your production URL (when deploying)

## 2. Supabase Database Setup

### Step 1: Create a Supabase Project

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Choose a name, password, and region
4. Wait for the project to be created

### Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the **Project URL** and **anon public** key

### Step 3: Add Supabase Credentials to .env

```env
VITE_NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Create Database Tables

Run the following SQL in your Supabase SQL editor (found in the Supabase dashboard):

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  frequency TEXT NOT NULL,
  renewal_date DATE NOT NULL,
  category TEXT,
  color TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT true,
  notification_enabled BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create insights table (optional, for future use)
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_renewal_date ON subscriptions(renewal_date);
CREATE INDEX idx_insights_user_id ON insights(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read/write their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (clerk_id = auth.uid()::text);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own subscriptions" ON subscriptions
  FOR DELETE USING (user_id = auth.uid()::text);

-- Insights policies
CREATE POLICY "Users can view own insights" ON insights
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own insights" ON insights
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
```

## 3. Testing the Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

The application should now be running at http://localhost:3000/

### Step 3: Test Authentication

1. Navigate to http://localhost:3000/
2. You should be redirected to the login page
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected to the dashboard

### Step 4: Verify Supabase Connection

- If Supabase is configured correctly, the app will sync user data to Supabase
- Check your Supabase dashboard → "Table Editor" → "users" table to see if your user was created
- Any subscriptions you add will also be synced to the "subscriptions" table

## 4. Current Status

### Without Environment Variables:
- ✅ **Application builds successfully**
- ✅ **Development server runs**
- ⚠️ **Clerk uses placeholder key** - Authentication will NOT work without real credentials
- ⚠️ **Supabase uses empty strings** - Database sync will NOT work without real credentials
- ℹ️ **App uses localStorage as fallback** - Data is stored locally in browser

### With Environment Variables:
- ✅ **Clerk authentication** - Users can sign in with Google
- ✅ **Supabase sync** - Data is backed up to cloud
- ✅ **Full functionality** - All features work as expected

## 5. Troubleshooting

### Clerk Authentication Issues

**Error: "Invalid publishable key"**
- Make sure you copied the complete key from Clerk dashboard
- Key should start with `pk_test_` or `pk_live_`
- Ensure no extra spaces or quotes in .env file

**Error: "Redirect URL not allowed"**
- Add your redirect URLs in Clerk dashboard
- URLs must match exactly (including protocol and port)

### Supabase Connection Issues

**Error: "Invalid Supabase URL"**
- URL should be in format: `https://xxxxx.supabase.co`
- Make sure you copied the Project URL, not the API URL

**Error: "Unauthorized"**
- Check that you're using the **anon public** key, not the service_role key
- Service role key should never be used in frontend code

**Database sync not working**
- Check browser console for errors
- Verify tables were created correctly in Supabase
- Check that RLS policies are set up correctly
- Ensure user is authenticated before attempting sync

## 6. Local Development (Without External Services)

The app can run in local-only mode without Clerk or Supabase:
- Authentication is skipped (using placeholder)
- All data is stored in browser localStorage
- Useful for UI development and testing
- Data is not persisted across browsers or devices

## Optional Configuration

### Google Client ID (for Google Sign-In button)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```
Note: This is configured through Clerk and usually not needed separately.

### Push Notifications (for PWA features)
```env
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```
Note: This is optional for push notification features.
