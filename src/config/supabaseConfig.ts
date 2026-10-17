/**
 * Supabase Project Configuration for M7 Grand Prix RSVP
 * 
 * Credentials are loaded securely from environment variables:
 * - Local: defined in .env (ignored by git)
 * - Production: defined in Vercel / Netlify / Cloudflare Environment Variables dashboard
 * - Fallback / Admin override: configurable via Pit Wall Admin modal (stored in localStorage)
 */

export const DEFAULT_SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';

export const DEFAULT_SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';
