
import React, { useState, useRef, useEffect } from 'react';
import { processIDCardOCR } from '../services/geminiService';
import { GuestData, TransactionType, Category, CustomerType, Booking } from '../types';
import PrintableDocument from './PrintableDocument';
import CameraCapture from './CameraCapture';
import toast from 'react-hot-toast';
import { getRoomTypeByNumber, calculateNights, calculateTotalAmount, EXTRA_GUEST_PRICE } from '../config/rooms';

interface FrontDeskProps {
  onCheckIn: (data: { 
    guest: GuestData, 
    amount: number, 
    room: string, 
    description: string, 
    customerType: CustomerType,
    checkIn: string,
    checkOut: string,
    imageUrl?: string
  }) => void;
  onQuickBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  resortInfo: any;
}

const FrontDesk: React.FC<FrontDeskProps> = ({ onCheckIn, onQuickBooking, resortInfo }) => {
  const [mode, setMode] = useState<'CHECKIN' | 'QUICKBOOK'>('CHECKIN');
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'ID' | 'SLIP'>('ID');
  const [showDoc, setShowDoc] = useState<'NONE' | 'RR3' | 'RECEIPT' | 'TAX_INVOICE'>('NONE');
  
  const [roomNumber, setRoomNumber] = useState('');
  const [extraGuests, setExtraGuests] = useState(0);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'TRANSFER'>('CASH');
  const [paymentSlip, setPaymentSlip] = useState<string | null>(null);

  const [totalAmount, setTotalAmount] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (roomNumber && checkInDate && checkOutDate) {
      const amount = calculateTotalAmount(roomNumber, checkInDate, checkOutDate, extraGuests);
      const roomType = getRoomTypeByNumber(roomNumber);
      const nights = calculateNights(checkInDate, checkOutDate);
      
      setTotalAmount(amount);
      setDescription(`ค่าที่พัก ${roomType?.name || 'ห้อง ' + roomNumber} (${nights} คืน)${extraGuests > 0 ? ' + เสริม ' + extraGuests + ' ท่าน' : ''} [ชำระด้วย${paymentMethod === 'CASH' ? 'เงินสด' : 'เงินโอน'}]`);
    }
  }, [roomNumber, checkInDate, checkOutDate, extraGuests, paymentMethod]);

  const idFileInputRef = useRef<HTMLInputElement>(null);
  const slipFileInputRef = useRef<HTMLInputElement>(null);

  const handleIDOCRResult = async (base64Data: string) => {
    setIsScanning(true);
    try {
      const result = await processIDCardOCR(base64Data);
      setGuest(result);
      toast.success("สแกนบัตรประชาชนสำเร็จ: " + result.firstNameTH);
    } catch (err: any) {
      toast.error(err.message || "สแกนไม่สำเร็จ กรุณาลองใหม่");
      console.error(err);
    } finally {
      setIsScanning(false);
      setIsCameraOpen(false);
    }
  };

  const handleSlipCapture = (base64Data: string) => {
    setPaymentSlip(`data:image/jpeg;base64,${base64Data}`);
    toast.success("บันทึกรูปสลิปเรียบร้อย");
    setIsCameraOpen(false);
  };

  const handleCompleteCheckIn = () => {
    if (!guest || !roomNumber || totalAmount <= 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและสแกนบัตรแขก");
      return;
    }

    if (paymentMethod === 'TRANSFER' && !paymentSlip) {
      toast.error("กรณีเงินโอน กรุณาแนบรูปสลิปหลักฐาน");
      return;
    }

    onCheckIn({
      guest, room: roomNumber, amount: totalAmount,
      description,
      customerType: CustomerType.CHECK_IN, 
      checkIn: checkInDate, 
      checkOut: checkOutDate,
      imageUrl: paymentSlip || undefined
    });
    
    // Reset form
    setGuest(null);
    setRoomNumber('');
    setPaymentSlip(null);
    setPaymentMethod('CASH');
    toast.success("เช็คอินเรียบร้อย");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">ระบบฟรอนต์เดสก์</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Check-in Management</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={() => setMode('CHECKIN')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${mode === 'CHECKIN' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>🛎️ เช็คอินแขก</button>
            <button onClick={() => setMode('QUICKBOOK')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${mode === 'QUICKBOOK' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>📞 จองด่วน</button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => { setCameraMode('ID'); setIsCameraOpen(true); }} 
              disabled={isScanning}
              className={`${isScanning ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-4 rounded-2xl text-xs font-black shadow-xl transition-all flex items-center gap-3`}
            >
              {isScanning ? '⏳ กำลังสแกน...' : '📸 สแกนบัตรประชาชน'}
            </button>
            <button 
              onClick={() => idFileInputRef.current?.click()} 
              disabled={isScanning}
              className="bg-slate-100 text-slate-600 px-6 py-4 rounded-2xl text-xs font-black hover:bg-slate-200 transition-all"
            >
              📁 เลือกบัตรจากไฟล์
            </button>
            <input type="file" accept="image/*" className="hidden" ref={idFileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => handleIDOCRResult((ev.target?.result as string).split(',')[1]);
                reader.readAsDataURL(file);
              }
            }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลผู้เข้าพักจากบัตร</h4>
              {isScanning ? (
                <div className="py-20 text-center animate-pulse">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-indigo-600 font-black">AI กำลังวิเคราะห์บัตรประชาชน...</p>
                </div>
              ) : guest ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">ชื่อ-นามสกุล</label>
                    <input value={`${guest.title}${guest.firstNameTH} ${guest.lastNameTH}`} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm text-slate-800" readOnly />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">เลขบัตรประชาชน</label>
                    <input value={guest.idNumber} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm text-indigo-600" readOnly />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">วันเกิด</label>
                    <input value={guest.dob} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm" readOnly />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">ที่อยู่ตามบัตร</label>
                    <textarea value={guest.address} className="w-full p-4 bg-white rounded-2xl font-bold border-none shadow-sm h-24 text-sm" readOnly />
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <div className="text-5xl mb-4">💳</div>
                  <p className="font-bold">ยังไม่มีข้อมูล</p>
                  <p className="text-xs">กรุณาสแกนบัตรหรือเลือกไฟล์เพื่อเริ่ม</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-indigo-600 rounded-[3rem] p-8 text-white flex flex-col gap-6 shadow-2xl shadow-indigo-200">
              <h4 className="font-black text-xl flex items-center gap-2">
                <span>🏨</span> ข้อมูลการเข้าพัก
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-200 uppercase">เลขห้อง</label>
                    <input placeholder="เลขห้อง" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-xs font-bold border border-white/20 focus:bg-white/20 transition-all outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-200 uppercase">ผู้ใหญ่เสริม (300/คน)</label>
                    <input type="number" min="0" value={extraGuests} onChange={e => setExtraGuests(parseInt(e.target.value) || 0)} className="w-full bg-white/10 p-4 rounded-2xl text-xs font-bold border border-white/20 focus:bg-white/20 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-200 uppercase">Check-in</label>
                    <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-[10px] font-bold border border-white/20 outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-indigo-200 uppercase">Check-out</label>
                    <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full bg-white/10 p-4 rounded-2xl text-[10px] font-bold border border-white/20 outline-none" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">วิธีชำระเงิน</label>
                  <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/20">
                    <button 
                      onClick={() => setPaymentMethod('CASH')} 
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${paymentMethod === 'CASH' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60'}`}
                    >
                      💵 เงินสด
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('TRANSFER')} 
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${paymentMethod === 'TRANSFER' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white/60'}`}
                    >
                      📱 เงินโอน
                    </button>
                  </div>
                </div>

                {paymentMethod === 'TRANSFER' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setCameraMode('SLIP'); setIsCameraOpen(true); }}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2"
                      >
                        📸 ถ่ายสลิป
                      </button>
                      <button 
                        onClick={() => slipFileInputRef.current?.click()}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2"
                      >
                        📁 อัปโหลด
                      </button>
                      <input type="file" accept="image/*" className="hidden" ref={slipFileInputRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setPaymentSlip(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                    {paymentSlip && (
                      <div className="relative group aspect-video bg-white/10 rounded-2xl overflow-hidden border border-white/20">
                        <img src={paymentSlip} className="w-full h-full object-cover" alt="Slip Preview" />
                        <button onClick={() => setPaymentSlip(null)} className="absolute top-2 right-2 bg-rose-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center shadow-lg">✕</button>
                      </div>
                    )}
                  </div>
                )}
                
                {totalAmount > 0 && (
                  <div className="bg-white/10 p-5 rounded-2xl border border-white/20 space-y-1 animate-in slide-in-from-right-4">
                    <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">ยอดชำระสุทธิ</p>
                    <p className="text-3xl font-black">฿{totalAmount.toLocaleString()}</p>
                    <p className="text-[9px] opacity-80 font-bold">{description}</p>
                  </div>
                )}

                <button 
                  onClick={handleCompleteCheckIn} 
                  disabled={!guest}
                  className={`w-full py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all ${guest ? 'bg-white text-indigo-600' : 'bg-white/20 text-white/40 cursor-not-allowed'}`}
                >
                  {guest ? 'ยืนยันเช็คอินทันที' : 'กรุณาสแกนบัตรก่อน'}
                </button>

                {guest && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button onClick={() => setShowDoc('RR3')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl text-[9px] font-black uppercase transition-all">พิมพ์ ร.ร. ๓</button>
                    <button onClick={() => setShowDoc('RECEIPT')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl text-[9px] font-black uppercase transition-all">ใบมัดจำ</button>
                    <button onClick={() => setShowDoc('TAX_INVOICE')} className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl text-[9px] font-black uppercase transition-all">ใบเสร็จ</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCameraOpen && (
        <CameraCapture 
          onCapture={cameraMode === 'ID' ? handleIDOCRResult : handleSlipCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}
      
      {showDoc !== 'NONE' && guest && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4" onClick={() => setShowDoc('NONE')}>
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                 <h3 className="font-black text-slate-800 uppercase tracking-tight">Document Preview</h3>
                 <button onClick={() => setShowDoc('NONE')} className="text-slate-400 font-bold hover:text-slate-600 px-4 transition-colors">✕ ปิด</button>
              </div>
              <div className="flex-1 overflow-auto bg-slate-100/50 p-10 flex justify-center">
                 <PrintableDocument guest={guest} type={showDoc} amount={totalAmount} roomNumber={roomNumber} description={description} resortInfo={resortInfo} checkInDate={checkInDate} checkOutDate={checkOutDate} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FrontDesk;
