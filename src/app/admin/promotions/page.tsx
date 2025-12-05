'use client';

import Navbar from '@/components/Navbar';
import AdminSidebar from '@/components/AdminSidebar';
import { FaPlus, FaTrash } from 'react-icons/fa';

const PROMOTIONS = [
    { id: 1, code: 'WELCOME10', discount: '10%', uses: 50, expires: '2023-12-31' },
    { id: 2, code: 'GAMER50', discount: '50 THB', uses: 100, expires: '2023-11-30' },
];

export default function AdminPromotions() {
    return (


        < >
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">จัดการโปรโมชั่น</h1>
                <button className="flex items-center gap-2 bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                    <FaPlus />
                    เพิ่มโค้ด
                </button>
            </div>

            <div className="bg-card-bg border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 font-bold">โค้ด</th>
                            <th className="p-4 font-bold">ส่วนลด</th>
                            <th className="p-4 font-bold">จำนวนการใช้</th>
                            <th className="p-4 font-bold">วันหมดอายุ</th>
                            <th className="p-4 font-bold text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PROMOTIONS.map((promo) => (
                            <tr key={promo.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-mono text-primary">{promo.code}</td>
                                <td className="p-4">{promo.discount}</td>
                                <td className="p-4">{promo.uses}</td>
                                <td className="p-4">{promo.expires}</td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:text-red-500 transition-colors"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>

    );
}
