import type { Metadata, ResolvingMetadata } from 'next';
import { getGameBySlug } from '@/actions/games';
import GameDetailsClient from './GameDetailsClient';

type Props = {
    params: Promise<{ gameSlug: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = (await params).gameSlug;
    const { data: game, error } = await getGameBySlug(slug);

    if (error || !game) {
        return {
            title: 'Game Not Found - LevelUp',
        }
    }

    return {
        title: `เติมเกม ${game.name} - LevelUp`,
        description: `เติมเงินเกม ${game.name} ราคาถูก สะดวก รวดเร็ว เชื่อถือได้ 100% ที่ LevelUp`,
        openGraph: {
            images: [game.image_url || ''],
        },
    }
}

export default async function TopUpPage({ params }: Props) {
    const slug = (await params).gameSlug;
    const { data: game, error } = await getGameBySlug(slug);

    if (error || !game) {
        return (
            <div className="min-h-screen bg-[#0f1014] text-white flex items-center justify-center">
                <h1 className="text-2xl">ไม่พบเกม</h1>
            </div>
        );
    }

    // @ts-ignore
    const packages = game.packages || [];

    return <GameDetailsClient game={game} packages={packages} />;
}
