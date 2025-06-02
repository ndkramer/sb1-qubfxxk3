import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl === '${VITE_SUPABASE_URL}') {
  throw new Error(
    'Invalid VITE_SUPABASE_URL environment variable. ' +
    'Make sure it is properly set in your .env file.'
  );
}

if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey === '${VITE_SUPABASE_ANON_KEY}') {
  throw new Error(
    'Invalid VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Make sure it is properly set in your .env file.'
  );
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey?.slice(0, 8) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'student-learning-platform'
    }
  }
  
});