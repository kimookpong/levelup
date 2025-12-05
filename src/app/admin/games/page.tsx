import { createServerClient } from '@/lib/supabase/server';
import AdminGamesClient from '@/components/AdminGamesClient';

export default async function AdminGames() {
    const supabase = await createServerClient();
    const { data: games } = await supabase.from('games').select('*').order('created_at', { ascending: false });

    return <AdminGamesClient initialGames={games || []} />;
}

