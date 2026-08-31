const fs = require('fs');
const path = require('path');

// Environment variables content
const envContent = `# Hunter.io API for Email Enrichment
NEXT_PUBLIC_HUNTER_API_KEY=ec175579ca379adc1acd3399f2cbd952ca0ec57b

# Supabase Backend
NEXT_PUBLIC_SUPABASE_URL=https://glcrfbtfadvcnpnyklxo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=glcrfbtfadvcnpnyklxo

# Google Places API for Business Search
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyC8um-gbkcir6dAS80OqmgEQT1jczPl-Ok
`;

// Path to .env.local
const envPath = path.join(__dirname, '.env.local');

// Write the file
fs.writeFileSync(envPath, envContent);

console.log('✅ .env.local file created successfully!');
console.log('📁 File location:', envPath);
console.log('🔄 Please restart your development server: npm run dev');
console.log('🗄️  Also run the SUPABASE_SETUP.sql script in your Supabase project');
