
import React from 'react';
import { Booking, Transaction, TransactionType, Category } from '../types';

interface PMSIntegrationProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 'BK001', guestName: 'John Doe', roomNumber: '101', checkIn: '2024-05-20', checkOut: '2024-05-22', totalAmount: 4800, status: 'confirmed' },
  { id: 'BK002', guestName: 'Lisa Black', roomNumber: '205', checkIn: '2024-05-21', checkOut: '2024-05-23', totalAmount: 5200, status: 'confirmed' },
  { id: 'BK003', guestName: 'สมชาย รักดี', roomNumber: '103', checkIn: '2024-05-21', checkOut: '2024-05-21', totalAmount: 1500, status: 'pending' },
];

const PMSIntegration: React.FC<PMSIntegrationProps> = ({ transactions, onAddTransaction }) => {
  const isPaid = (bookingId: string) => {
    return transactions.some(tx => tx.description.includes(bookingId) && tx.type === TransactionType.INCOME);
  };

  const handleQuickAdd = (booking: Booking) => {
    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: booking.totalAmount,
      type: TransactionType.INCOME,
      category: Category.ROOM_REVENUE,
      description: `Payment for Booking ${booking.id} - ${booking.guestName}`,
      isReconciled: true
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-2">Property Management Sync</h3>
        <p className="text-blue-100 text-sm opacity-90">
          รายการการจองจากระบบหน้าบ้าน (PMS) ที่ยังไม่ได้บันทึกรับเงินในระบบบัญชี
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_BOOKINGS.map(booking => {
          const paid = isPaid(booking.id);
          return (
            <div key={booking.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${paid ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Room {booking.roomNumber} - {booking.guestName}</h4>
                  <p className="text-xs text-slate-500">
                    {booking.id} • {booking.checkIn} ถึง {booking.checkOut}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">฿{booking.totalAmount.toLocaleString()}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${paid ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {paid ? 'ชำระเงินแล้ว' : 'ยังไม่ชำระ'}
                  </p>
                </div>

                {!paid && (
                  <button 
                    onClick={() => handleQuickAdd(booking)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
                  >
                    ลงบันทึกรับเงิน
                  </button>
                )}
                
                {paid && (
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-xs text-slate-500 text-center">
          ระบบเชื่อมต่อกับ PMS ผ่าน API อัตโนมัติ เพื่อดึงรายการการจองจาก Agoda, Booking.com และ Walk-in
        </p>
      </div>
    </div>
  );
};

export default PMSIntegration;
