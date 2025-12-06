// For backward compatibility, this file re-exports from the appropriate client/server files
// For Client Components: use `supabase` from '@/lib/supabase/client'
// For Server Components: use `createServerClient` from '@/lib/supabase/server'

// Re-export client-side supabase instance
export { supabase } from './supabase/client';

// Re-export server-side functions
export { createServerClient } from './supabase/server';