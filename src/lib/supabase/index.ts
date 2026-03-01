// Only export browser client for client-side usage
export { getSupabaseClient, createSupabaseBrowserClient } from './client';

// Server client should be imported directly in server components/API routes
// Do NOT re-export server client here to avoid client-side bundling issues
