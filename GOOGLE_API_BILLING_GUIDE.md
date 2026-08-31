# Google Places API Billing Setup Guide

## 🎯 The Error Means You Need to Enable Billing

The `REQUEST_DENIED` error means your Google Places API key requires billing to be enabled.

## 🚀 Quick Setup Steps (5-10 minutes)

### Step 1: Go to Google Cloud Console
1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Make sure you're in the correct project

### Step 2: Enable Billing
1. In the left sidebar, click **Billing**
2. Click **Manage billing accounts**
3. Click **Create account** (if you don't have one)
4. Fill in your business/personal information
5. Add a payment method (credit card or bank account)

### Step 3: Link Billing to Project
1. Go back to your project
2. Click **Billing** → **Manage billing**
3. Click **Link a billing account**
4. Select your billing account
5. Click **Set as billing account**

### Step 4: Enable Google Places API
1. Go to **APIs & Services** → **Library**
2. Search for "Places API"
3. Click **Google Places API**
4. Click **Enable**

### Step 5: Configure Your API Key
1. Go to **APIs & Services** → **Credentials**
2. Find your API key
3. Click on it to edit
4. Set **Application restrictions** → **HTTP referrers**:
   ```
   http://localhost:3000/*
   https://yourdomain.com/*
   ```
5. Set **API restrictions** → **Restrict key** → **Places API**

## 💰 Cost Information

### Google Places API Pricing:
- **Free Tier:** $200 free credit per month
- **Per Request:** $0.032 per 1,000 requests
- **Typical Usage:** 100-500 requests/month = $0.003-$0.016
- **Well Within Free Tier:** You'll likely never pay anything

### Example Monthly Costs:
- 100 searches: $0.003
- 500 searches: $0.016
- 1,000 searches: $0.032
- 5,000 searches: $0.160

## 🎯 After Setup

### Test Your API Key:
```bash
# Test the API directly
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+minneapolis&key=YOUR_API_KEY"
```

### Update Your .env.local:
```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-actual-api-key
```

### Restart Your App:
```bash
npm run dev
```

## ✅ Expected Results

After enabling billing:
- ✅ Google Places API works
- ✅ Business search returns results
- ✅ No more REQUEST_DENIED errors
- ✅ Leads page search functionality works

## 🔧 Troubleshooting

### If Still Getting Errors:
1. Check billing is enabled for the correct project
2. Verify Places API is enabled
3. Check API key restrictions
4. Ensure HTTP referrers include localhost:3000

### Alternative: Free Geocoding API
If you don't want to enable billing, you can use the free Geocoding API instead:
- Enable **Geocoding API** (no billing required for basic usage)
- Update the search to use geocoding instead of Places API

## 🎯 Bottom Line

**Yes, you just need to enable billing and the Google Places API will work perfectly! The free tier covers all normal usage, so you likely won't pay anything.**
