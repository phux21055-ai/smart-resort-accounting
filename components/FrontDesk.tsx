
import React, { useState, useRef } from 'react';
import { processIDCardOCR } from '../services/geminiService';
import { GuestData, Booking, TransactionType, Category } from '../types';
import PrintableDocument from './PrintableDocument';

interface FrontDeskProps {
  onCheckIn: (data: { guest: GuestData, amount: number, room: string, description: string }) => void;
}

const FrontDesk: React.FC<FrontDeskProps> = ({ onCheckIn }) => {
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showDoc, setShowDoc] = useState<'NONE' | 'RR3' | 'RECEIPT' | 'TAX_INVOICE'>('NONE');
  
  // Form fields for check-in
  const [roomNumber, setRoomNumber] = useState('');
  const [amount, setAmount] = useState('1500');
  const [description, setDescription] = useState('ค่าบริการห้องพัก Standard');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });
      const result = await processIDCardOCR(base64Data);
      setGuest(result);
    } catch (err) {
      alert("สแกนไม่สำเร็จ กรุณาลองใหม่หรือพิมพ์ข้อมูลเอง");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCompleteCheckIn = () => {
    if (!guest || !roomNumber || !amount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนก่อนเช็คอิน");
      return;
    }

    onCheckIn({
      guest,
      room: roomNumber,
      amount: parseFloat(amount),
      description: `${description} - ห้อง ${roomNumber}`
    });

    alert("เช็คอินสำเร็จ! ระบบบันทึกรายได้เข้าสู่หน้าบัญชีแล้ว");
    setGuest(null);
    setRoomNumber('');
    setAmount('1500');
    setDescription('ค่าบริการห้องพัก Standard');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Check-in Management</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ID Scan & Document Issuance</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="bg-indigo-600 text-white px-8 py-4 rounded-3xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
          >
            {isScanning ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {isScanning ? "AI กำลังอ่านข้อมูล..." : "สแกนบัตรประชาชน"}
          </button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleScan} />
        </div>

        {guest ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลผู้เข้าพัก (แก้ไขได้)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">ชื่อ-นามสกุล (TH)</label>
                    <input 
                      type="text" 
                      value={`${guest.title} ${guest.firstNameTH} ${guest.lastNameTH}`}
                      className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">เลขห้องพัก</label>
                    <input 
                      type="text" 
                      placeholder="เช่น 101, 204"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm font-bold focus:border-indigo-500 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1">ราคาค่าห้อง (฿)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border-2 border-indigo-100 rounded-xl p-3 text-sm font-bold focus:border-indigo-500 focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ออกเอกสารด่วน</h4>
                <div className="grid grid-cols-3 gap-3">
                   <button onClick={() => setShowDoc('RR3')} className="bg-slate-900 text-white p-4 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all flex flex-col items-center gap-2"><span>📄</span> ใบ ร.ร. 3</button>
                   <button onClick={() => setShowDoc('RECEIPT')} className="bg-emerald-500 text-white p-4 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all flex flex-col items-center gap-2"><span>💵</span> ใบมัดจำ</button>
                   <button onClick={() => setShowDoc('TAX_INVOICE')} className="bg-indigo-600 text-white p-4 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all flex flex-col items-center gap-2"><span>🧾</span> ใบกำกับภาษี</button>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 flex flex-col justify-between">
               <div className="text-center">
                 <div className="bg-white w-16 h-16 rounded-2xl shadow-sm mb-4 mx-auto flex items-center justify-center text-2xl">🏨</div>
                 <h4 className="font-black text-slate-800 text-xl mb-2">Check-in Summary</h4>
                 <p className="text-xs text-slate-500 leading-relaxed mb-6">ตรวจสอบข้อมูล และราคาให้เรียบร้อย<br/>ก่อนกดปุ่ม "ยืนยันการเช็คอิน" ด้านล่าง</p>
               </div>
               
               <div className="space-y-3">
                 <button 
                    onClick={handleCompleteCheckIn}
                    className="w-full bg-indigo-600 text-white py-5 rounded-3xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    ยืนยันการเช็คอินและบันทึกบัญชี
                  </button>
                 <button 
                    onClick={() => setGuest(null)}
                    className="w-full text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 py-3 rounded-2xl transition-all"
                  >
                    ยกเลิกและล้างข้อมูล
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-6 grayscale opacity-50">🪪</div>
            <p className="text-slate-600 text-lg font-black">พร้อมรับลูกค้าคนใหม่</p>
            <p className="text-[11px] text-slate-400 mt-2 uppercase font-black tracking-widest max-w-xs mx-auto">สแกนบัตรประชาชนเพื่อดึงข้อมูลชื่อและที่อยู่เข้าสู่ระบบโดยอัตโนมัติ</p>
          </div>
        )}
      </div>

      {showDoc !== 'NONE' && guest && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black">PDF</div>
                    <h3 className="font-black text-slate-800">Preview เอกสารราชการ / บัญชี</h3>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                      สั่งพิมพ์ทันที
                    </button>
                    <button onClick={() => setShowDoc('NONE')} className="text-slate-400 font-bold hover:text-slate-600 px-4">✕ ปิด</button>
                 </div>
              </div>
              <div className="flex-1 overflow-auto bg-slate-200/50 p-10 flex justify-center">
                 <PrintableDocument 
                    guest={guest} 
                    type={showDoc} 
                    amount={parseFloat(amount) || 0}
                    roomNumber={roomNumber}
                    description={description}
                 />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FrontDesk;
