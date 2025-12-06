import { createServerClient } from '@/lib/supabase/server';
import AdminPromotionsClient from '@/components/AdminPromotionsClient';

export default async function AdminPromotions() {
    const supabase = await createServerClient();

    const { data: promotions } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

    return <AdminPromotionsClient initialPromotions={promotions || []} />;
}
