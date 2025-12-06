import { getPromotions } from '@/actions/promotions';
import AdminPromotionsClient from './AdminPromotionsClient';

export default async function AdminPromotions() {
    const { data: promotions, error } = await getPromotions();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">จัดการโปรโมชั่น (Promotion Management)</h1>
            {error ? (
                <div className="text-red-500">Error loading promotions: {error}</div>
            ) : (
                <AdminPromotionsClient
                    // @ts-ignore
                    initialPromotions={promotions || []}
                />
            )}
        </div>
    );
}
