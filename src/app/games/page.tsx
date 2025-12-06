import { createServerClient } from '@/lib/supabase/server';
import GamesClient from '@/components/GamesClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function GamesPage() {
    let games = [];

    try {
        const supabase = await createServerClient();
        const { data } = await supabase
            .from('games')
            .select('*')
            .eq('active', true)
            .order('name');

        games = data || [];
    } catch (error) {
        console.error("Error fetching games:", error);
    }

    return (
        <main className="min-h-screen bg-[#0f1014] text-white selection:bg-primary selection:text-white">
            <Navbar />
            <GamesClient games={games} />
            <Footer />
        </main>
    );
}
