import { getTransactions } from '@/actions/transactions';
import AdminTransactionsClient from './AdminTransactionsClient';

export default async function AdminTransactions() {
    const { data: transactions, error } = await getTransactions();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">จัดการคำสั่งซื้อ (Transaction Management)</h1>
            {error ? (
                <div className="text-red-500">Error loading transactions: {error}</div>
            ) : (
                <AdminTransactionsClient
                    // @ts-ignore
                    initialTransactions={transactions || []}
                />
            )}
        </div>
    );
}
