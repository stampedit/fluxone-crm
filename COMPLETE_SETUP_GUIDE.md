# Complete FluxOne Setup Guide

## 🎯 Step 1: Create Supabase Auth User
1. Go to: https://glcrfbtfadvcnpnyklxo.supabase.co
2. Click Authentication → Users
3. Click "Add user"
4. Enter:
   - Email: james@minorcleaning.com
   - Password: password123
   - Confirm Password: password123
   - Role: authenticated
   - Email confirmed: ✅

## 🎯 Step 2: Test Authentication
1. Go to: http://localhost:3000/login
2. Login with: james@minorcleaning.com / password123
3. Should redirect to dashboard

## 🎯 Step 3: Test All Features
1. Dashboard: http://localhost:3000
2. Employees: http://localhost:3000/employees
3. Clients: http://localhost:3000/clients
4. Invoices: http://localhost:3000/invoices
5. Leads: http://localhost:3000/leads
6. Schedule: http://localhost:3000/schedule
7. Dev-Test: http://localhost:3000/dev-test

## 🎯 Step 4: Test CRUD Operations
- Add/Edit/Delete Employees
- Add/Edit/Delete Clients
- Add/Edit/Delete Invoices
- Add/Edit/Delete Leads
- Business Search on Leads page

## 🎯 Step 5: Run System Health Check
Go to: http://localhost:3000/dev-test
Click "Run System Health Check"
Should show 100% score

## 🎯 Step 6: Verify Error Handling
- Try invalid UUID operations
- Test network errors
- Check console for proper error logging

## 🎯 Step 7: Test Mobile Responsiveness
- Resize browser to mobile size
- Test all pages on mobile view

## ✅ Expected Results
- Login works with real Supabase
- All CRUD operations functional
- No UUID errors
- Proper error handling
- Mobile responsive
- System health check passes
