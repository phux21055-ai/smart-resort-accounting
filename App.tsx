
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Transaction, 
  TransactionType, 
  Category,
  Booking,
  GuestData
} from './types';
import OCRUpload from './components/OCRUpload';
import TransactionList from './components/TransactionList';
import PMSIntegration from './components/PMSIntegration';
import SystemReport from './components/SystemReport';
import CloudArchive from './components/CloudArchive';
import ManualEntry from './components/ManualEntry';
import FrontDesk from './components/FrontDesk';

const STORAGE_KEY = 'resort_finance_data_v2.6';
const COLORS = {
  INCOME: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'],
  EXPENSE: ['#ef4444', '#f87171', '#fb7185', '#fda4af', '#fecaca']
};

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading saved data", e);
        return [];
      }
    }
    return [];
  });

  const [view, setView] = useState<'dashboard' | 'transactions' | 'pms' | 'archive' | 'frontdesk'>('dashboard');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pieMode, setPieMode] = useState<TransactionType>(TransactionType.EXPENSE);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9)
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่? การลบจะรวมถึงรูปภาพหลักฐานที่เกี่ยวข้องด้วย')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleReconcile = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, isReconciled: !t.isReconciled } : t));
  };

  const handleFrontDeskCheckIn = (data: { guest: GuestData, amount: number, room: string, description: string }) => {
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.INCOME,
      category: Category.ROOM_REVENUE,
      amount: data.amount,
      description: data.description,
      isReconciled: true,
      guestData: data.guest
    });
  };

  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: income, totalExpense: expense, netProfit: income - expense };
  }, [transactions]);

  const monthlyChartData = useMemo(() => {
    const monthsMap: Record<string, { month: string, income: number, expense: number, timestamp: number }> = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
      if (!monthsMap[key]) monthsMap[key] = { month: label, income: 0, expense: 0, timestamp: d.getTime() };
      if (t.type === TransactionType.INCOME) monthsMap[key].income += t.amount;
      else monthsMap[key].expense += t.amount;
    });
    const sortedData = Object.values(monthsMap).sort((a, b) => a.timestamp - b.timestamp);
    return sortedData.length > 0 ? sortedData : [{ month: 'ยังไม่มีข้อมูล', income: 0, expense: 0, timestamp: 0 }];
  }, [transactions]);

  const categoryPieData = useMemo(() => {
    const filtered = transactions.filter(t => t.type === pieMode);
    const groups = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(groups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions, pieMode]);

  const exportCSV = () => {
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'รายละเอียด', 'จำนวนเงิน', 'ตรวจสอบแล้ว'];
    const rows = transactions.map(t => [t.date, t.type, t.category, t.description.replace(/,/g, ' '), t.amount, t.isReconciled ? 'ใช่' : 'ยัง']);
    const csvContent = "data:text/csv;charset=utf-8,\ufeff" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `resort_finance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-0 md:pl-64">
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed left-0 top-0 h-full z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-xl shadow-indigo-100 font-black">SR</div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">Smart Resort</h1>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Finance Hub v2.6</p>
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span>📊</span> แดชบอร์ด</button>
          <button onClick={() => setView('frontdesk')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'frontdesk' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span>🛎️</span> หน้าเช็คอิน</button>
          <button onClick={() => setView('transactions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'transactions' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span>📝</span> รายการเดินบัญชี</button>
          <button onClick={() => setView('archive')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'archive' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span>☁️</span> คลังหลักฐาน</button>
          <button onClick={() => setView('pms')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'pms' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}><span>🏨</span> ระบบจอง (PMS)</button>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-8 space-y-3">
          <OCRUpload onTransactionDetected={addTransaction} label="Scan Receipt" subLabel="Quick Scan & Auto Categories" />
          <button onClick={() => setIsManualEntryOpen(true)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">จดบันทึกด้วยมือ</button>
        </div>
      </nav>

      <header className="md:hidden flex justify-between items-center p-5 bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black">SR</div>
          <h1 className="font-bold text-slate-800">Smart Resort</h1>
        </div>
        <button onClick={() => setIsManualEntryOpen(true)} className="bg-slate-100 p-2 rounded-xl"><span className="text-xs font-black text-slate-600">+ บันทึก</span></button>
      </header>

      <main className="p-5 md:p-10 max-w-6xl mx-auto">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <OCRUpload onTransactionDetected={addTransaction} label="Scan Income Slip" subLabel="Room Payments & Deposits" intent="INCOME" />
              <OCRUpload onTransactionDetected={addTransaction} label="Scan Expense Receipt" subLabel="Bills, Supplies & Maintenance" intent="EXPENSE" colorClass="bg-rose-500 shadow-rose-100 hover:bg-rose-600" />
              <button 
                onClick={() => setView('frontdesk')}
                className="bg-white border-2 border-dashed border-indigo-200 rounded-[2rem] p-5 flex items-center justify-center gap-3 text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50 transition-all group lg:col-span-1 md:col-span-2"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">🛎️</span>
                <span className="text-sm font-black uppercase">Check-in Guest</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
               <div className="relative z-10">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">กำไรสุทธิคงเหลือ</p>
                 <h2 className={`text-5xl font-black mb-10 tracking-tighter ${netProfit < 0 ? 'text-rose-400' : 'text-white'}`}>
                   {netProfit < 0 ? '-' : ''}฿{Math.abs(netProfit).toLocaleString()}
                 </h2>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                      <p className="text-[10px] text-emerald-400 uppercase font-black mb-1">รายรับรวม</p>
                      <p className="text-xl font-bold">฿{totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                      <p className="text-[10px] text-rose-400 uppercase font-black mb-1">รายจ่ายรวม</p>
                      <p className="text-xl font-bold">฿{totalExpense.toLocaleString()}</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-black text-slate-800">แนวโน้มการเงิน</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div><span className="text-[10px] text-slate-500 font-bold uppercase">Income</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div><span className="text-[10px] text-slate-500 font-bold uppercase">Expense</span></div>
                  </div>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', padding: '12px' }} />
                      <Bar dataKey="income" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={20} />
                      <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 6, 6]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex flex-col gap-4 mb-6">
                  <h3 className="text-sm font-black text-slate-800">สัดส่วนตามหมวดหมู่</h3>
                  <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    <button onClick={() => setPieMode(TransactionType.INCOME)} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${pieMode === TransactionType.INCOME ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>รายรับ</button>
                    <button onClick={() => setPieMode(TransactionType.EXPENSE)} className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${pieMode === TransactionType.EXPENSE ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>รายจ่าย</button>
                  </div>
                </div>
                {categoryPieData.length > 0 ? (
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieMode === TransactionType.INCOME ? COLORS.INCOME[index % COLORS.INCOME.length] : COLORS.EXPENSE[index % COLORS.EXPENSE.length]} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => `฿${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-slate-300 italic text-[11px]">ยังไม่มีข้อมูล</div>
                )}
                <div className="mt-6 space-y-2">
                   {categoryPieData.slice(0, 3).map((c, i) => (
                     <div key={i} className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-2 truncate">
                           <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: pieMode === TransactionType.INCOME ? COLORS.INCOME[i % COLORS.INCOME.length] : COLORS.EXPENSE[i % COLORS.EXPENSE.length]}}></div>
                           <span className="text-slate-600 font-bold truncate">{c.name}</span>
                        </div>
                        <span className="text-slate-800 font-black">฿{c.value.toLocaleString()}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
            <SystemReport transactions={transactions} onReconcile={toggleReconcile} />
          </div>
        )}

        {view === 'frontdesk' && (
          <FrontDesk onCheckIn={handleFrontDeskCheckIn} />
        )}

        {view === 'transactions' && (
          <div className="space-y-6">
             <div className="flex justify-between items-end px-2">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">รายการเดินบัญชี</h3>
                  <p className="text-xs text-slate-400 font-bold">บันทึกทั้งหมด {transactions.length} รายการ</p>
                </div>
                <button onClick={exportCSV} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[11px] font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Export CSV
                </button>
             </div>
             <TransactionList transactions={transactions} onDelete={deleteTransaction} onReconcile={toggleReconcile} onViewImage={(url) => setSelectedImage(url)} />
          </div>
        )}

        {view === 'archive' && <CloudArchive transactions={transactions} onViewImage={(url) => setSelectedImage(url)} />}
        {view === 'pms' && <PMSIntegration transactions={transactions} onAddTransaction={addTransaction} />}
      </main>

      {isManualEntryOpen && <ManualEntry onAdd={addTransaction} onClose={() => setIsManualEntryOpen(false)} />}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 md:p-10" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-5xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="absolute top-8 right-8 z-10"><button className="bg-white/90 backdrop-blur-md text-slate-800 w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl hover:bg-white transition-all" onClick={() => setSelectedImage(null)}>✕</button></div>
            <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
              <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-hidden p-8"><img src={selectedImage} alt="Receipt Proof" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" /></div>
              <div className="w-full md:w-80 p-10 flex flex-col justify-between border-l border-slate-100 bg-white">
                <div><div className="bg-indigo-50 text-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 font-black">AI</div><h3 className="font-black text-2xl text-slate-800 mb-3 leading-tight">คลังหลักฐาน</h3><p className="text-slate-400 text-[11px] font-bold leading-relaxed mb-10 italic">ภาพสลิปนี้ถูกเข้ารหัสและจัดเก็บไว้อย่างปลอดภัยบนคลังดิจิทัลของ Smart Resort</p></div>
                <div className="mt-12"><button onClick={() => setSelectedImage(null)} className="w-full bg-slate-900 text-white py-4 rounded-3xl text-xs font-black hover:bg-slate-800 transition-all">ปิดหน้าต่าง</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center z-40 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        {[
          { id: 'dashboard', label: 'หน้าแรก', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'frontdesk', label: 'เช็คอิน', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { id: 'transactions', label: 'บัญชี', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { id: 'archive', label: 'คลังภาพ', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
          { id: 'pms', label: 'จองห้อง', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id as any)} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400 opacity-60'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={view === item.id ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d={item.icon} /></svg>
            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
