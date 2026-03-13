
import { createClient } from '@supabase/supabase-js';

// YOUR PROJECT URL
const supabaseUrl = 'https://ljnnkiyczxsibxwihsbl.supabase.co';

/**
 * ACTION REQUIRED: 
 * 1. Go to Supabase > Project Settings > API.
 * 2. Copy the 'anon' 'public' key (NOT the service_role key).
 * 3. Paste it between the quotes below.
 */
const hardcodedAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqbm5raXljenhzaWJ4d2loc2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDU3MDcsImV4cCI6MjA4NjkyMTcwN30.6lpHkHc5VxdYDH3xLZHZQVoWLInTpvJPlt_8syk-t5Y'; 

// We check the environment variable first, then fall back to your hardcoded key.
const supabaseAnonKey = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) || (import.meta && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || hardcodedAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseAnonKey !== '');

// Initialize the client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any);

if (!isSupabaseConfigured) {
  console.warn("Supabase is not configured. Go to services/supabaseClient.ts and paste your Anon Key to go live.");
}
