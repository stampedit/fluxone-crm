# 🎯 Supabase API Key Guide

## Step 1: Go to Supabase Dashboard
1. Open your browser
2. Go to: https://supabase.com/dashboard
3. Sign in to your account

## Step 2: Select Your Project
1. You'll see a list of your projects
2. Click on your FluxOne project (the one with reference glcrfbtfadvcnpnyklxo)

## Step 3: Go to Settings
1. Look at the left sidebar
2. Click on the **⚙️ Settings** icon (gear icon)

## Step 4: Go to API Settings
1. In the Settings menu, click on **API**
2. This will show you the API configuration page

## Step 5: Find the Anon Public Key
On the API page, you'll see:

### 📋 What You'll See:
```
Project URL: https://glcrfbtfadvcnpnyklxo.supabase.co

API Keys
├── anon public
│   └── eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← ✅ COPY THIS ONE
├── service_role  
│   └── eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└── publishable
    └── sb_publishable_DK5nAHAb7ox7eeGV1Nx12Q_tvJEKZNF  ← ❌ NOT THIS ONE
```

## Step 6: Copy the Correct Key
1. Find the section labeled **"anon public"**
2. Copy the key that starts with **eyJ...**
3. This key will be very long (like 200+ characters)

## 🔑 What the Correct Key Looks Like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsY3JmYnRmYWR2Y25ueWtseG8iLCJpYXQiOjE2NzQ...
```

## ❌ What NOT to Copy:
```
sb_publishable_DK5nAHAb7ox7eeGV1Nx12Q_tvJEKZNF
```

## 🎯 Once You Have the Key:
1. Share it with me here
2. I'll update your .env.local file
3. Then you can run the SQL setup script

---

**📱 Visual Guide:**
- Left Sidebar: ⚙️ Settings → API
- Look for: "anon public" section
- Copy: The long key starting with "eyJ"

**Need help? Let me know what you see on your screen!**
