
import React from 'react';
import { Measurement } from '../types';
import { Trash2, FileSpreadsheet } from 'lucide-react';

interface MeasurementTableProps {
  measurements: Measurement[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const MeasurementTable: React.FC<MeasurementTableProps> = ({ measurements, onRemove, onClear }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
          Bảng Kết Quả Thí Nghiệm (Dữ liệu thô)
        </h3>
        {measurements.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Lần đo</th>
              <th className="px-4 py-3 font-semibold">I (A)</th>
              <th className="px-4 py-3 font-semibold">F₁ (N)</th>
              <th className="px-4 py-3 font-semibold">F₂ (N)</th>
              <th className="px-4 py-3 font-semibold">F = F₂-F₁ (N)</th>
              <th className="px-4 py-3 font-semibold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {measurements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                  Chưa có dữ liệu. Hãy thực hiện phép đo và ghi lại số liệu để tính B.
                </td>
              </tr>
            ) : (
              measurements.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono">{m.current.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono">{m.f1.toFixed(3)}</td>
                  <td className="px-4 py-3 font-mono">{m.f2.toFixed(3)}</td>
                  <td className="px-4 py-3 font-mono text-blue-600 font-semibold">{m.f.toFixed(3)}</td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => onRemove(m.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50 text-[11px] text-slate-400 italic">
        * Học sinh sử dụng dữ liệu trên để tự tính toán cảm ứng từ B theo công thức đã học.
      </div>
    </div>
  );
};

export default MeasurementTable;
