# Phase 1: Core Production Setup Guide

## 🎯 Connecting Your FluxOne Supabase Account

Since you have a Supabase account named "fluxone", here's exactly what you need to do:

---

## **Step 1: Replace Mock Auth with Supabase Auth**

### **1.1 Get Your Supabase Credentials**
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your "fluxone" project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://fluxone.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### **1.2 Enable Supabase Auth**
1. In your Supabase project, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. Under **Additional Redirect URLs**, add: `https://yourdomain.com/auth/callback`

### **1.3 Replace authService.js**
I'll create the new auth service for you:

```javascript
// src/services/authService.js - NEW VERSION
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data.user
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
```

---

## **Step 2: Set up Production Database**

### **2.1 Run Database Setup**
1. In your Supabase project, go to **SQL Editor**
2. Run the `SUPABASE_SETUP.sql` file (creates all tables)
3. Run the `FIXED_RLS_POLICIES.sql` file (sets up security)

### **2.2 Create Your User Account**
Run this SQL in Supabase to create your user:

```sql
-- Create your user account
INSERT INTO accounts (id, name, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- Your account ID
  'FluxOne Business',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create your user
INSERT INTO users (id, email, account_id, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001', -- Your user ID
  'james@minorcleaning.com',
  '550e8400-e29b-41d4-a716-446655440000',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
```

### **2.3 Set User Password**
1. Go to **Authentication** → **Users** in Supabase
2. Find your user (james@minorcleaning.com)
3. Click "Reset Password" and set it to: `password123`

---

## **Step 3: Configure Production Environment Variables**

### **3.1 Create .env.local File**
Create or update your `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://fluxone.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Google API Configuration
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-api-key

# Hunter.io API Configuration
NEXT_PUBLIC_HUNTER_API_KEY=your-hunter-api-key
```

### **3.2 Get Your Actual Keys**
1. **Supabase Keys:** From your fluxone project → Settings → API
2. **Google API:** Follow the Google Places API setup guide
3. **Hunter.io:** Optional, get from hunter.io if needed

---

## **Step 4: Choose and Configure Hosting Platform**

### **Option 1: Vercel (Recommended - Free & Easy)**
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Option 2: Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set up build command: `npm run build`
4. Add environment variables

### **Option 3: Railway**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set up Node.js environment
4. Add environment variables

---

## **🚀 Quick Start Actions**

### **Right Now (5 minutes):**
1. **Get Supabase URL & Key** from your fluxone project
2. **Update .env.local** with your actual Supabase credentials
3. **Restart dev server**: `npm run dev`

### **Today (30 minutes):**
1. **Run SQL scripts** in Supabase SQL Editor
2. **Create your user account** with the SQL provided
3. **Test login** with james@minorcleaning.com / password123

### **This Week (1-2 hours):**
1. **Replace authService.js** with new Supabase auth
2. **Set up hosting platform** (Vercel recommended)
3. **Test everything** works with real Supabase

---

## **🔧 What I'll Help You With**

I can create:
- ✅ New authService.js with Supabase Auth
- ✅ Updated login/register pages
- ✅ Environment variable validation
- ✅ Database connection testing
- ✅ Deployment configuration

---

## **📱 Testing Checklist**

After setup, verify:
- [ ] Login works with real Supabase
- [ ] Can create/read employees, clients, invoices
- [ ] Google Places API returns results
- [ ] No more "demo-account-id" errors
- [ ] All pages load without errors

---

## **🎯 Next Steps**

**Tell me which step you want to start with, and I'll help you implement it:**

1. **"Help me get my Supabase credentials"**
2. **"Replace the authService.js file for me"**
3. **"Set up the database with SQL scripts"**
4. **"Configure environment variables"**
5. **"Set up Vercel deployment"**

**Which would you like to tackle first?**
