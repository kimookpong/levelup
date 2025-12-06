import { getAllNews } from '@/actions/news';
import AdminNewsClient from './AdminNewsClient';

export default async function AdminNews() {
    const { data: news, error } = await getAllNews();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">จัดการข่าวสาร (News Management)</h1>
            {error ? (
                <div className="text-red-500">Error loading news: {error}</div>
            ) : (
                <AdminNewsClient
                    // @ts-ignore
                    initialNews={news || []}
                />
            )}
        </div>
    );
}
