import AdminGamesClient from '@/components/AdminGamesClient';
import { getGames } from '@/actions/games';

export default async function AdminGames() {
    const { data: games, error } = await getGames();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">จัดการเกม (Game Management)</h1>
            {error ? (
                <div className="text-red-500">Error loading games: {error}</div>
            ) : (
                <AdminGamesClient initialGames={games || []} />
            )}
        </div>
    );
}
