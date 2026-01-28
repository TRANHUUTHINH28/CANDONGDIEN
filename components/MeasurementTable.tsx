
import React from 'react';
import { Measurement } from '../types';
import { FileSpreadsheet, Info } from 'lucide-react';

interface MeasurementTableProps {
  measurements: Measurement[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onUpdateRow: (id: string, field: keyof Measurement, value: string) => void;
  onValidateRow: (id: string) => void;
}

const MeasurementTable: React.FC<MeasurementTableProps> = ({ 
  measurements, 
  onUpdateRow 
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-100">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Bảng 11.1. Ghi chép số liệu thí nghiệm</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ghi số chỉ lực kế và tính toán các giá trị B</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-slate-500 uppercase bg-slate-50 font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-center">Lần đo</th>
              <th className="px-3 py-5 text-center italic text-indigo-600 bg-indigo-50/30">I (A)</th>
              <th className="px-3 py-5 text-center italic">F1 (N)</th>
              <th className="px-3 py-5 text-center italic">F2 (N)</th>
              <th className="px-3 py-5 text-center text-orange-600 italic font-black">F = F2 - F1 (N)</th>
              <th className="px-3 py-5 text-center text-orange-600 italic font-black">B (T)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {measurements.map((m, idx) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5 font-black text-slate-400 text-center">Lần {idx + 1}</td>
                <td className="px-2 py-4 bg-indigo-50/20">
                  <input type="text" value={m.inputI} readOnly className="w-full bg-transparent border-none rounded-lg px-2 py-2 font-mono text-center text-indigo-600 font-black text-lg" />
                </td>
                <td className="px-2 py-4">
                  <input 
                    type="text" 
                    value={m.inputF1} 
                    onChange={(e) => onUpdateRow(m.id, 'inputF1', e.target.value)} 
                    placeholder="0,210" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 font-mono text-center text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm group-hover:border-orange-200 transition-all" 
                  />
                </td>
                <td className="px-2 py-4">
                  <input 
                    type="text" 
                    value={m.inputF2} 
                    onChange={(e) => onUpdateRow(m.id, 'inputF2', e.target.value)} 
                    placeholder="0,000" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 font-mono text-center text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm group-hover:border-orange-200 transition-all" 
                  />
                </td>
                <td className="px-2 py-4">
                  <input 
                    type="text" 
                    value={m.inputF} 
                    onChange={(e) => onUpdateRow(m.id, 'inputF', e.target.value)} 
                    placeholder="..." 
                    className="w-full bg-orange-50/50 border border-orange-100 rounded-xl px-2 py-2.5 font-mono text-center font-black text-orange-700 placeholder:text-orange-200" 
                  />
                </td>
                <td className="px-2 py-4">
                  <input 
                    type="text" 
                    value={m.inputB} 
                    onChange={(e) => onUpdateRow(m.id, 'inputB', e.target.value)} 
                    placeholder="..." 
                    className="w-full bg-orange-100/50 border border-orange-200 rounded-xl px-2 py-2.5 font-mono text-center font-black text-orange-800 placeholder:text-orange-300" 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-900 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full font-black uppercase text-[9px]">Lưu ý</span>
          <span>Dùng dấu phẩy (,) hoặc dấu chấm (.) cho phần thập phân đều được.</span>
        </div>
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3" />
          <span>B = F / (N.I.L)</span>
        </div>
      </div>
    </div>
  );
};

export default MeasurementTable;
