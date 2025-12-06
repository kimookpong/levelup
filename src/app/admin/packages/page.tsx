import { getPackages } from '@/actions/packages';
import { getGames } from '@/actions/games';
import AdminPackagesClient from './AdminPackagesClient';

export default async function AdminPackages() {
    const { data: packages, error: pkgError } = await getPackages();
    const { data: games, error: gameError } = await getGames();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">จัดการแพ็กเกจ (Package Management)</h1>
            {pkgError || gameError ? (
                <div className="text-red-500">Error: {pkgError || gameError}</div>
            ) : (
                <AdminPackagesClient
                    // @ts-ignore
                    initialPackages={packages || []}
                    games={games || []}
                />
            )}
        </div>
    );
}
