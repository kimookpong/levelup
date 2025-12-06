import { FaUsers, FaGamepad, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

export default function AdminDashboard() {
    // Mock Dashboard for now
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h3 className="text-gray-400 text-sm mb-1">ผู้ใช้งานทั้งหมด</h3>
                    <div className="text-3xl font-bold text-white">0</div>
                    <div className="text-green-500 text-xs mt-2 flex items-center gap-1">
                        +0% <span className="text-gray-500">จากเดือนที่แล้ว</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-xl">
                    <FaUsers />
                </div>
            </div>
            <div className="bg-[#1a1b26] border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h3 className="text-gray-400 text-sm mb-1">ยอดขายรวม</h3>
                    <div className="text-3xl font-bold text-white">฿0</div>
                    <div className="text-green-500 text-xs mt-2 flex items-center gap-1">
                        +0% <span className="text-gray-500">จากเดือนที่แล้ว</span>
                    </div>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500 text-xl">
                    <FaMoneyBillWave />
                </div>
            </div>
        </div>
    );
}
