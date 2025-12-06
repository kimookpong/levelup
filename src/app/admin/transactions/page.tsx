import { createServerClient } from '@/lib/supabase/server';
import AdminTransactionsClient from '@/components/AdminTransactionsClient';

export default async function AdminTransactions() {
    const supabase = await createServerClient();

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*, users(email, full_name), games(name), packages(name)')
        .order('created_at', { ascending: false })
        .limit(100);

    return <AdminTransactionsClient initialTransactions={transactions || []} />;
}
