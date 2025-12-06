import { getActiveGames } from '@/actions/games';
import GamesClient from '@/components/GamesClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function GamesPage() {
    let games: any[] = [];
    try {
        const { data, error } = await getActiveGames();
        if (data) games = data;
    } catch (error) {
        console.error("Database error:", error);
    }

    return (
        <main className="min-h-screen bg-[#0f1014] text-white selection:bg-primary selection:text-white">
            <Navbar />
            <GamesClient games={games} />
            <Footer />
        </main>
    );
}
