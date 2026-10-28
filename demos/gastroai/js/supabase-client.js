
// Initialize Supabase Client
// NOTE: You need to replace these with your own project details from https://supabase.com
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

let supabase = null;

try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase Client Initialized');
    } else {
        console.error('❌ Supabase Library not loaded! content CDN script in index.html');
    }
} catch (error) {
    console.error('❌ Error initializing Supabase:', error);
}

// Export for usage in other files
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.supabaseClient = supabase;
