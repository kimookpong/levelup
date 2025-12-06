import { createServerClient } from '@/lib/supabase/server';
import AdminPackagesClient from '@/components/AdminPackagesClient';

export default async function AdminPackages() {
    const supabase = await createServerClient();

    const { data: packages } = await supabase
        .from('packages')
        .select('*, games(id, name, image_url)')
        .order('created_at', { ascending: false });

    const { data: games } = await supabase
        .from('games')
        .select('id, name, image_url')
        .eq('active', true)
        .order('name');

    return (
        <AdminPackagesClient
            initialPackages={packages || []}
            initialGames={games || []}
        />
    );
}
