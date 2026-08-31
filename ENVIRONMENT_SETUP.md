# FluxOne Environment Setup Guide

## 🚀 Complete Environment Configuration

### **Required Environment Variables**

Create or update your `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google API Configuration
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-api-key

# Hunter.io API Configuration (for email verification)
NEXT_PUBLIC_HUNTER_API_KEY=your-hunter-api-key
```

### **🔧 Google Places API Setup**

#### **Step 1: Get Google API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Places API** and **Geocoding API**
4. Create API key with restrictions

#### **Step 2: Configure API Key Restrictions**
1. Go to **APIs & Services** → **Credentials**
2. Click on your API key
3. Set **Application restrictions** → **HTTP referrers**:
   ```
   http://localhost:3000/*
   https://yourdomain.com/*
   ```
4. Set **API restrictions** → **Restrict key**:
   - Places API
   - Geocoding API

#### **Step 3: Test Google API**
```bash
# Test the API endpoint directly
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+minneapolis&key=YOUR_API_KEY"
```

### **🗄️ Supabase Setup**

#### **Step 1: Get Supabase Credentials**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `glcrfbtfadvcnpnyklxo`
3. Go to **Settings** → **API**
4. Copy **URL** and **anon public key**

#### **Step 2: Run Database Setup**
1. Go to **SQL Editor** in Supabase
2. Run the `SUPABASE_SETUP.sql` file first
3. Then run the `FIXED_RLS_POLICIES.sql` file

#### **Step 3: Verify Tables**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('accounts', 'users', 'leads', 'clients', 'jobs', 'employees', 'invoices');
```

### **🔍 Hunter.io API Setup** (Optional)

#### **Step 1: Get Hunter.io API Key**
1. Go to [Hunter.io](https://hunter.io/)
2. Sign up for free account
3. Get your API key from dashboard

#### **Step 2: Configure**
```bash
NEXT_PUBLIC_HUNTER_API_KEY=your-hunter-api-key
```

### **🧪 Testing Environment**

#### **Step 1: Verify Environment Variables**
```javascript
// In browser console
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Google API Key:', process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? 'Present' : 'Missing');
console.log('Hunter API Key:', process.env.NEXT_PUBLIC_HUNTER_API_KEY ? 'Present' : 'Missing');
```

#### **Step 2: Test with Dev Tools**
1. Go to: http://localhost:3000/dev-test
2. Click "Run System Health Check"
3. Check environment status

### **🐛 Common Issues & Solutions**

#### **Google API Issues**
- **Error:** "API key not configured"
  - **Solution:** Check `.env.local` file and restart dev server
- **Error:** "Request denied"
  - **Solution:** Check API key restrictions in Google Cloud Console
- **Error:** "Invalid request"
  - **Solution:** Ensure Places API is enabled

#### **Supabase Issues**
- **Error:** "Invalid input syntax for type uuid"
  - **Solution:** Fixed with UUID validation in code
- **Error:** "new row violates row-level security policy"
  - **Solution:** Run `FIXED_RLS_POLICIES.sql` in Supabase
- **Error:** "No current user found"
  - **Solution:** Login with james@minorcleaning.com / password123

#### **Environment Issues**
- **Error:** "Environment variable not found"
  - **Solution:** Create `.env.local` file with required variables
- **Error:** "API key missing"
  - **Solution:** Check variable names in `.env.local`

### **📱 Quick Test Checklist**

#### **1. Environment Check**
- [ ] `.env.local` file exists
- [ ] All required variables are set
- [ ] Dev server restarted after changes

#### **2. Google API Test**
- [ ] API key is valid
- [ ] Places API is enabled
- [ ] API restrictions are set correctly
- [ ] Test search returns results

#### **3. Supabase Test**
- [ ] Tables exist in database
- [ ] RLS policies are applied
- [ ] Can fetch and create records
- [ ] UUID validation works

#### **4. Full System Test**
- [ ] Login works
- [ ] Employee CRUD works
- [ ] Client CRUD works
- [ ] Invoice CRUD works
- [ ] Business search works

### **🔧 Debug Commands**

#### **Check Environment Variables**
```bash
# List all environment variables
npm run dev
# Then in browser console:
console.log(process.env)
```

#### **Test Google API**
```bash
# Test Google Places API
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=test&key=YOUR_KEY"
```

#### **Check Supabase Connection**
```bash
# Test Supabase connection
curl "https://your-project.supabase.co/rest/v1/employees?select=*&apikey=YOUR_ANON_KEY"
```

### **📞 Support**

If you're still having issues:

1. **Check console logs** in browser dev tools
2. **Run system health check** at http://localhost:3000/dev-test
3. **Verify all environment variables** are set correctly
4. **Ensure all SQL scripts** have been run in Supabase

### **🎯 Success Indicators**

- ✅ Environment variables are loaded
- ✅ Google API returns search results
- ✅ Supabase operations work without errors
- ✅ All CRUD operations function
- ✅ System health check shows 100% score

**Once all these are working, your FluxOne system is fully operational!**
