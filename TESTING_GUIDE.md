# FluxOne App Testing Guide

## 🧪 Comprehensive Testing Checklist

### 📱 Step 1: Basic App Access
1. **Open Browser:** Go to http://localhost:3000
2. **Verify App Loads:** Dashboard should appear without errors
3. **Check Console:** Press F12 → Console tab (should be clean)

### 🔐 Step 2: Authentication Test
1. **Login Credentials:** james@minorcleaning.com / password123
2. **Expected:** Successful login and redirect to dashboard
3. **Check Console:** No authentication errors

### 👥 Step 3: Employee Management Test
1. **Navigate:** http://localhost:3000/employees
2. **Test Add Employee:**
   - Click "Add Employee"
   - Fill form: Name, Email, Position, Hourly Rate
   - Click "Add Employee"
3. **Expected:** Employee saves to Supabase, appears in list
4. **Check Console:** Should show "Employee saved to Supabase" message

### 🏢 Step 4: Client Management Test
1. **Navigate:** http://localhost:3000/clients
2. **Test Add Client:**
   - Click "Add Client"
   - Fill form: Name, Email, Phone
   - Click "Add Client"
3. **Expected:** Client saves to Supabase, appears in list
4. **Check Console:** Should show successful client creation

### 🧾 Step 5: Invoice Management Test
1. **Navigate:** http://localhost:3000/invoices
2. **Test Add Invoice:**
   - Click "Create Invoice"
   - Fill form: Client Name, Amount, Due Date
   - Click "Create Invoice"
3. **Expected:** Invoice saves to Supabase, appears in list
4. **Check Console:** Should show successful invoice creation

### 📊 Step 6: Business Search Test
1. **Navigate:** http://localhost:3000/leads
2. **Test Business Search:**
   - Enter: "restaurants in minneapolis"
   - Click "Search Businesses"
3. **Expected:** Google Places API results appear
4. **Check Console:** Should show successful API calls

### 🔄 Step 7: Data Persistence Test
1. **Refresh Pages:** Reload employees, clients, invoices pages
2. **Expected:** All data persists from Supabase
3. **Check Console:** Should show successful data fetching

### 📋 Step 8: Error Handling Test
1. **Test Empty Forms:** Try submitting empty forms
2. **Expected:** Validation messages appear
3. **Test Invalid Data:** Try invalid email formats
4. **Expected:** Proper error messages, no crashes

## ✅ Expected Results

### Working Features:
- ✅ Login authentication
- ✅ Employee CRUD operations
- ✅ Client CRUD operations  
- ✅ Invoice CRUD operations
- ✅ Business search with Google Places API
- ✅ Data persistence across page refreshes
- ✅ Proper error handling and validation

### No Errors:
- ❌ No "invalid input syntax for type uuid" errors
- ❌ No "new row violates row-level security policy" errors
- ❌ No "Query parameter is required" errors
- ❌ No empty error objects `{}` in console
- ❌ No UI crashes or uncaught exceptions

## 🔧 If Issues Occur:

### UUID Errors:
- Check: User is properly logged in
- Check: account_id is a valid UUID (not demo-account-id)
- Check: RLS policies are applied in Supabase

### API Errors:
- Check: Environment variables in .env.local
- Check: Google Places API key is valid
- Check: Hunter.io API key is valid

### Database Errors:
- Check: Supabase tables exist
- Check: RLS policies are properly configured
- Check: User authentication is working

## 📊 Testing Summary

After completing all tests, the app should:
1. Load without errors
2. Allow successful login
3. Support all CRUD operations
4. Persist data to Supabase
5. Handle errors gracefully
6. Provide good user experience

## 🎯 Success Indicators

- **Console Clean:** No red error messages
- **Data Persists:** All CRUD operations save to database
- **UI Responsive:** No crashes or freezes
- **API Working:** Business search returns results
- **Authentication:** Login/logout works properly

## 🚀 Ready for Production

If all tests pass, the FluxOne app is:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Secure with proper data isolation
- ✅ Scalable with cloud database storage
