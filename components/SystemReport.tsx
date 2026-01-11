
import React from 'react';
import { Transaction, TransactionType } from '../types';

interface SystemReportProps {
  transactions: Transaction[];
  onReconcile: (id: string) => void;
}

const SystemReport: React.FC<SystemReportProps> = ({ transactions, onReconcile }) => {
  // กรองรายการที่ยังไม่ได้ตรวจสอบ (Pending)
  const pendingItems = transactions
    .filter(t => !t.isReconciled)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const pendingCount = transactions.filter(t => !t.isReconciled).length;
  const totalPendingAmount = transactions
    .filter(t => !t.isReconciled)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative group transition-all hover:shadow-md">
      {/* Glow Effect */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Active</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800">ศูนย์ปฏิบัติการล่าสุด</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Real-time Operation Hub</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
             <div className="text-right">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">ยอดรอตรวจสอบ</p>
               <p className="text-lg font-black text-indigo-600">฿{totalPendingAmount.toLocaleString()}</p>
             </div>
             <div className="w-[1px] h-8 bg-slate-200"></div>
             <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">จำนวน</p>
                <p className="text-lg font-black text-slate-800">{pendingCount}</p>
             </div>
          </div>
        </div>

        <div className="space-y-3">
          {pendingItems.length > 0 ? (
            pendingItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 rounded-[2rem] transition-all border border-transparent hover:border-slate-100 group/item"
              >
                {/* Thumbnail / Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/item:scale-105 overflow-hidden ${
                  item.type === TransactionType.INCOME 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'bg-rose-50 text-rose-600'
                }`}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="Proof" />
                  ) : (
                    <span className="font-black text-base">{item.type === TransactionType.INCOME ? '↓' : '↑'}</span>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-black text-slate-800 truncate">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                      item.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">฿{item.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onReconcile(item.id)}
                    className="hidden sm:flex bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-slate-100 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all active:scale-95 items-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    คอนเฟิร์ม
                  </button>
                  
                  {/* Mobile Only Check */}
                  <button 
                    onClick={() => onReconcile(item.id)}
                    className="sm:hidden w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="bg-emerald-50 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner animate-in zoom-in duration-500">
                <span className="text-3xl">✨</span>
              </div>
              <h4 className="text-base font-black text-slate-800">ข้อมูลเป็นปัจจุบันแล้ว</h4>
              <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed">
                ไม่มีเอกสารหรือรายการที่รอดำเนินการในขณะนี้
              </p>
            </div>
          )}
        </div>

        {pendingItems.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between items-center">
             <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
             </div>
             <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">
               End-to-end Resort Finance
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemReport;
