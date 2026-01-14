
import React from 'react';
import { GuestData } from '../types';

interface PrintableDocumentProps {
  guest: GuestData;
  type: 'RR3' | 'RECEIPT' | 'TAX_INVOICE';
  amount: number;
  roomNumber: string;
  description: string;
  resortInfo: {
    resortName: string;
    resortAddress: string;
    taxId: string;
    phone: string;
  };
  checkInDate?: string;
  checkOutDate?: string;
}

const PrintableDocument: React.FC<PrintableDocumentProps> = ({ 
  guest, type, amount, roomNumber, description, resortInfo, checkInDate, checkOutDate 
}) => {
  const formatThaiId = (id: string) => {
    if (!id || id.length < 13) return id;
    return `${id[0]} - ${id.slice(1, 5)} - ${id.slice(5, 10)} - ${id.slice(10, 12)} - ${id[12]}`;
  };

  const renderRR3 = () => {
    return (
      <div className="relative w-[210mm] min-h-[297mm] p-[15mm] bg-white text-black font-serif text-[11pt] leading-normal mx-auto border border-gray-100">
        <style>{`
          .dotted-line { border-bottom: 1px dotted #000; min-width: 50px; display: inline-block; padding: 0 5px; }
          .id-box { border: 1px solid #000; display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 25px; margin: 0 1px; font-weight: bold; }
          .checkbox { border: 1px solid #000; width: 14px; height: 14px; display: inline-block; margin-right: 5px; position: relative; top: 2px; }
          .checkbox.checked::after { content: '✓'; position: absolute; top: -4px; left: 1px; font-size: 14px; font-weight: bold; }
        `}</style>

        <div className="text-right text-[10pt] mb-2 font-bold">ร.ร. ๓</div>
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-lg font-bold">บัตรทะเบียนผู้พักโรงแรม <span className="dotted-line font-normal">{resortInfo.resortName}</span></h1>
          <p className="text-sm">(Lodger Registration Card)</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-y-4">
            <div className="w-1/2">
              ชื่อตัว <span className="dotted-line flex-1 ml-2 font-bold">{guest.firstNameTH}</span>
              <br/><span className="text-[9pt]">(Name)</span>
            </div>
            <div className="w-1/2">
              ชื่อสกุล <span className="dotted-line flex-1 ml-2 font-bold">{guest.lastNameTH}</span>
              <br/><span className="text-[9pt]">(Surname)</span>
            </div>
          </div>

          <div>
            เลขประจำตัวประชาชน 
            <span className="ml-4">
              {guest.idNumber.split('').map((char, i) => (
                <React.Fragment key={i}>
                  <span className="id-box">{char}</span>
                  {(i === 0 || i === 4 || i === 9 || i === 11) && <span className="mx-1">-</span>}
                </React.Fragment>
              ))}
            </span>
            <br/><span className="text-[9pt]">(Identification Card No.)</span>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              ใบสำคัญประจำตัวคนต่างด้าวเลขที่ <span className="dotted-line flex-1">....................................................................</span>
              <br/><span className="text-[9pt]">(Alien Registration Book No.)</span>
            </div>
          </div>

          <div>
            หนังสือเดินทางเลขที่ <span className="dotted-line w-2/3">...............................................................................................</span>
            <br/><span className="text-[9pt]">(Passport No.)</span>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              อาชีพ <span className="dotted-line w-3/4">{guest.occupation || ''}</span>
              <br/><span className="text-[9pt]">(Occupation)</span>
            </div>
            <div className="w-1/2">
              สัญชาติ <span className="dotted-line w-3/4 font-bold">{guest.nationality || 'ไทย'}</span>
              <br/><span className="text-[9pt]">(Nationality)</span>
            </div>
          </div>

          <div>
            ที่อยู่ปัจจุบัน <span className="dotted-line w-[85%] font-bold">{guest.address}</span>
            <br/><span className="text-[9pt]">(Current Address)</span>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
               <span className="dotted-line w-full h-6"></span>
            </div>
            <div className="w-1/3">
              หมายเลขโทรศัพท์ <span className="dotted-line w-2/3 font-bold">{guest.phone || ''}</span>
              <br/><span className="text-[9pt]">(Telephone No.)</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="font-bold">1. เดินทางมาจากสถานที่ใด (Place of Departure)</div>
            <div className="pl-6">
              <span className="checkbox checked"></span> 1.1 เดินทางมาจากที่อยู่ปัจจุบันที่เป็นภูมิลำเนาข้างต้น (Depart from the current address above)
            </div>
            <div className="pl-6">
              <span className="checkbox"></span> 1.2 เดินทางมาจากสถานที่พักอื่น (บ้านเลขที่ ตำบล อำเภอ จังหวัด ประเทศ) <span className="dotted-line w-1/2"></span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="font-bold">2. ประสงค์จะเดินทางต่อไปยังสถานที่ใด (Next Destination)</div>
            <div className="pl-6">
              <span className="checkbox checked"></span> 2.1 เดินทางกลับไปยังที่อยู่ปัจจุบันที่เป็นภูมิลำเนา (Back to the current address above)
            </div>
            <div className="pl-6">
              <span className="checkbox"></span> 2.2 เดินทางต่อไปยังสถานที่พักอื่น (บ้านเลขที่ ตำบล อำเภอ จังหวัด ประเทศ) <span className="dotted-line w-1/2"></span>
            </div>
          </div>
        </div>

        <table className="w-full mt-12 border-collapse border border-black">
          <tbody>
            <tr>
              <td className="w-1/3 border border-black p-4 text-center">
                <div className="font-bold mb-2">วัน เดือน ปี ที่เข้าพัก</div>
                <div className="text-[9pt] mb-4">(Date of Arrival)</div>
                <div className="font-bold mb-4">{checkInDate ? new Date(checkInDate).toLocaleDateString('th-TH') : '...........................................'}</div>
                <div className="flex justify-between items-center text-[9pt]">
                  <span>เวลา <span className="dotted-line font-bold">14:00</span></span>
                  <span>(Time)</span>
                </div>
              </td>
              <td className="w-1/3 border border-black p-4 text-center">
                <div className="font-bold mb-2">วัน เดือน ปี ที่ออกไป</div>
                <div className="text-[9pt] mb-4">(Expected Departure)</div>
                <div className="font-bold mb-4">{checkOutDate ? new Date(checkOutDate).toLocaleDateString('th-TH') : '...........................................'}</div>
                <div className="flex justify-between items-center text-[9pt]">
                  <span>เวลา <span className="dotted-line font-bold">12:00</span></span>
                  <span>(Time)</span>
                </div>
              </td>
              <td className="w-1/3 border border-black p-4 flex flex-col justify-between min-h-[120px]">
                <div className="mb-4">
                  ห้องพักเลขที่ <span className="dotted-line font-bold">{roomNumber || ''}</span>
                  <br/><span className="text-[9pt]">(Room No.)</span>
                </div>
                <div className="text-center mt-auto">
                  <div className="font-bold mb-1">ลายมือชื่อผู้พัก</div>
                  <div className="text-[9pt] mb-6">(Guest Signature)</div>
                  <div className="dotted-line w-4/5"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderFinancial = () => {
    const getTitle = () => {
      switch(type) {
        case 'RECEIPT': return 'ใบรับเงินชั่วคราว / เงินมัดจำ';
        case 'TAX_INVOICE': return 'ใบเสร็จรับเงิน / ใบกำกับภาษี';
        default: return '';
      }
    };

    const vatRate = 0.07;
    const preVat = amount / (1 + vatRate);
    const vat = amount - preVat;

    return (
      <div id="print-area" className="w-[210mm] min-h-[297mm] p-[20mm] bg-white text-black font-serif text-[12pt] leading-relaxed shadow-lg mx-auto">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; margin: 0; padding: 15mm; }
            .no-print { display: none !important; }
          }
        `}</style>
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-10">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold uppercase text-slate-900">{resortInfo.resortName}</h1>
            <p className="text-xs text-slate-600 whitespace-pre-line">{resortInfo.resortAddress}</p>
            <p className="text-xs text-slate-600">เลขประจำตัวผู้เสียภาษี: {resortInfo.taxId}</p>
            <p className="text-xs text-slate-600">โทร: {resortInfo.phone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-2 text-indigo-900">{getTitle()}</h2>
            <p className="text-sm">เลขที่เอกสาร: {(Date.now().toString().slice(-8))}</p>
            <p className="text-sm">วันที่ออก: {new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Guest Section */}
        <div className="grid grid-cols-2 gap-8 mb-12 border p-6 rounded-md bg-slate-50/50">
          <div>
            <h4 className="text-[10pt] font-bold text-gray-500 uppercase mb-2">ลูกค้า / ผู้เข้าพัก</h4>
            <p className="font-bold text-lg">{guest.title} {guest.firstNameTH} {guest.lastNameTH}</p>
            <p className="text-sm text-slate-500">({guest.firstNameEN} {guest.lastNameEN})</p>
            <p className="text-sm mt-2 leading-snug">{guest.address}</p>
          </div>
          <div>
            <h4 className="text-[10pt] font-bold text-gray-500 uppercase mb-2">รายละเอียด</h4>
            <p><span className="font-bold">เลขห้อง:</span> {roomNumber || '-'}</p>
            <p><span className="font-bold">ID Number:</span> {guest.idNumber}</p>
            <p><span className="font-bold">ระยะเวลา:</span> {checkInDate && checkOutDate ? `${new Date(checkInDate).toLocaleDateString('th-TH')} - ${new Date(checkOutDate).toLocaleDateString('th-TH')}` : '-'}</p>
          </div>
        </div>

        {/* Items Section */}
        <table className="w-full mb-12 border-collapse">
          <thead>
            <tr className="border-y-2 border-black bg-slate-100">
              <th className="py-4 px-2 text-left">รายละเอียดรายการ</th>
              <th className="py-4 px-2 text-center w-24">จำนวน</th>
              <th className="py-4 px-2 text-right w-40">ราคาหน่วย</th>
              <th className="py-4 px-2 text-right w-40">รวมเงิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-4 px-2">
                <p className="font-bold">{description || 'ค่าบริการห้องพัก'}</p>
                <p className="text-xs text-slate-500">Room: {roomNumber}</p>
              </td>
              <td className="py-4 px-2 text-center">1</td>
              <td className="py-4 px-2 text-right">{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
              <td className="py-4 px-2 text-right">{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            {type === 'TAX_INVOICE' ? (
              <>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-sm text-slate-600">รวมเงิน (Subtotal)</span>
                  <span>{preVat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>ภาษีมูลค่าเพิ่ม 7% (VAT)</span>
                  <span>{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm text-slate-600">รวมเงินทั้งสิ้น</span>
                <span>{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl border-t-2 border-black pt-2 text-indigo-900">
              <span>ยอดสุทธิ (Total)</span>
              <span>฿{amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <div className="mt-40 grid grid-cols-2 gap-20 text-center">
          <div className="space-y-12">
            <div className="border-b border-black"></div>
            <p className="text-sm font-bold">ลายมือชื่อลูกค้า</p>
          </div>
          <div className="space-y-12">
            <div className="border-b border-black"></div>
            <p className="text-sm font-bold">ผู้รับเงิน / พนักงาน</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="print-wrapper">
      <div className="no-print flex justify-center mb-6 gap-4">
        <button 
          onClick={() => window.print()} 
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          🖨️ พิมพ์เอกสาร
        </button>
      </div>
      {type === 'RR3' ? renderRR3() : renderFinancial()}
    </div>
  );
};

export default PrintableDocument;
