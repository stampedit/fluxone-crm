// Debug script to check API setup
console.log('🔍 Debugging API Setup...\n');

// Check if environment variables are accessible
console.log('1. 📋 Checking Environment Variables:');
console.log('   Google API Key:', process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ? '✅ Present' : '❌ Missing');
console.log('   Hunter API Key:', process.env.NEXT_PUBLIC_HUNTER_API_KEY ? '✅ Present' : '❌ Missing');
console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('   Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');

console.log('\n2. 🔑 API Key Details:');
console.log('   Google API Key starts with:', process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.substring(0, 10) + '...');
console.log('   Hunter API Key starts with:', process.env.NEXT_PUBLIC_HUNTER_API_KEY?.substring(0, 10) + '...');

console.log('\n3. 🌐 Testing Google API Key:');
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
if (googleApiKey && googleApiKey !== 'your_google_api_key_here') {
  console.log('   ✅ Google API key is configured');
  console.log('   📝 Try this test URL in browser:');
  console.log(`   https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants%20in%20minneapolis&key=${googleApiKey}`);
} else {
  console.log('   ❌ Google API key not configured or using placeholder');
}

console.log('\n4. 📋 Next Steps:');
console.log('   1. Check browser console (F12) for detailed errors');
console.log('   2. Test the Google API URL above in browser');
console.log('   3. Share the exact error message you see');
console.log('   4. I can help fix the specific issue');
