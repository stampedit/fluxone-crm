const fs = require('fs');
const { exec } = require('child_process');

// Read the SQL file
const sqlContent = fs.readFileSync('SUPABASE_SETUP.sql', 'utf8');

// Copy to clipboard (Windows)
exec(`echo ${JSON.stringify(sqlContent)} | clip`, (error) => {
  if (error) {
    console.error('Error copying to clipboard:', error);
    console.log('\n📋 Manually copy the SQL content from SUPABASE_SETUP.sql');
  } else {
    console.log('✅ SQL script copied to clipboard!');
  }
  
  console.log('\n🗄️  Next Steps:');
  console.log('1. Go to: https://glcrfbtfadvcnpnyklxo.supabase.co');
  console.log('2. Click on "SQL Editor" in the left sidebar');
  console.log('3. Paste the SQL script (Ctrl+V)');
  console.log('4. Click "Run" to execute');
  console.log('5. Restart your app: npm run dev');
});
