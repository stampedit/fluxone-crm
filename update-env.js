const fs = require('fs');
const path = require('path');

// Updated environment variables content with correct Supabase credentials
const envContent = `# Hunter.io API for Email Enrichment
NEXT_PUBLIC_HUNTER_API_KEY=ec175579ca379adc1acd3399f2cbd952ca0ec57b

# Supabase Backend (Updated with correct credentials)
NEXT_PUBLIC_SUPABASE_URL=https://glcrfbtfadvcnpnyklxo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsY3JmYnRmYWR2Y25wbnlrbHhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTEzNTMsImV4cCI6MjA5MjU2NzM1M30.gpygpkfSW-0it3C-LctAQrAzTqTn4MhdKulw_T9wcWw

# Google Places API for Business Search
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC8um-gbkcir6dAS80OqmgEQT1jczPl-Ok
`;

// Path to .env.local
const envPath = path.join(__dirname, '.env.local');

// Write the file
fs.writeFileSync(envPath, envContent);

console.log('✅ .env.local file updated with correct Supabase credentials!');
console.log('📁 File location:', envPath);
console.log('🔑 Supabase URL: https://glcrfbtfadvcnpnyklxo.supabase.co');
console.log('🔑 Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('🔄 Please restart your development server: npm run dev');
console.log('🗄️  Next: Run the SUPABASE_SETUP.sql script in your Supabase project');
