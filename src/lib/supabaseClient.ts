// For backward compatibility, this file re-exports from the appropriate client/server files
// For Client Components: use `supabase` from this file
// For Server Components: use `createServerClient` from '@/lib/supabase/server'

export { supabase } from './supabase/client';

