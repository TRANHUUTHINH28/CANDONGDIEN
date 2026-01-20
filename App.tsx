
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SimulationView from './components/SimulationView';
import Controls from './components/Controls';
import MeasurementTable from './components/MeasurementTable';
import { Measurement, SimulationState } from './types';
import { gaussianRandom, PHYSICS_CONSTANTS, calculateMagneticForce } from './utils/math';
import { CheckCircle2, AlertCircle, Info, Calculator } from 'lucide-react';

const App: React.FC = () => {
  // Session Constants
  const [session, setSession] = useState<SimulationState>(() => ({
    targetB: 0.02 + Math.random() * 0.03, // Random [0.02, 0.05]
    fOffset: 0.200 + Math.random() * 0.02, // System error offset ~0.210N
    currentI: 0,
    isBalanced: true,
    isOverheated: false,
    tiltAngle: 0,
  }));

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [displayedForce, setDisplayedForce] = useState<number>(session.fOffset);
  
  // Student Submission State
  const [studentAvgB, setStudentAvgB] = useState<string>('');
  const [studentErrorB, setStudentErrorB] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<'success' | 'fail' | null>(null);

  // Update logic when Current changes
  useEffect(() => {
    const fMag = calculateMagneticForce(session.currentI, session.targetB);
    const calculatedTilt = fMag * 20; 
    
    setSession(prev => ({
      ...prev,
      tiltAngle: calculatedTilt,
      isBalanced: session.currentI === 0, 
      isOverheated: session.currentI > 0.8
    }));

    const noise = gaussianRandom(0, 0.0005);
    setDisplayedForce(session.fOffset + fMag + noise);
  }, [session.currentI, session.targetB, session.fOffset]);

  const handleCurrentChange = (val: number) => {
    setSession(prev => ({ ...prev, currentI: val }));
  };

  const handleBalance = () => {
    const { currentI, targetB, fOffset, isOverheated } = session;
    const fMagBase = calculateMagneticForce(currentI, targetB);
    const errorMagnitude = isOverheated ? 0.05 : 0.015;
    const f2Raw = fOffset + fMagBase;
    const f2WithNoise = gaussianRandom(f2Raw, Math.max(0.001, f2Raw * errorMagnitude));
    
    const f2 = Math.round(f2WithNoise * 1000) / 1000;
    const f1 = Math.round(fOffset * 1000) / 1000;
    const f = Math.round((f2 - f1) * 1000) / 1000;
    
    const newMeasurement: Measurement = {
      id: crypto.randomUUID(),
      current: currentI,
      f1,
      f2,
      f
    };

    setMeasurements(prev => [...prev, newMeasurement]);
    setSession(prev => ({ ...prev, isBalanced: true, tiltAngle: 0 }));
    setDisplayedForce(f2);
  };

  const handleReset = () => {
    if (confirm("Bạn có muốn đặt lại toàn bộ phiên thí nghiệm không? (Giá trị B sẽ được tạo mới)")) {
      const newOffset = 0.200 + Math.random() * 0.02;
      setSession({
        targetB: 0.02 + Math.random() * 0.03,
        fOffset: newOffset,
        currentI: 0,
        isBalanced: true,
        isOverheated: false,
        tiltAngle: 0,
      });
      setDisplayedForce(newOffset);
      setMeasurements([]);
      setStudentAvgB('');
      setStudentErrorB('');
      setSubmissionResult(null);
    }
  };

  const verifyResult = () => {
    const avg = parseFloat(studentAvgB);
    if (isNaN(avg)) {
      alert("Vui lòng nhập giá trị trung bình B hợp lệ.");
      return;
    }

    const diffPercent = Math.abs(avg - session.targetB) / session.targetB;
    if (diffPercent <= 0.1) {
      setSubmissionResult('success');
    } else {
      setSubmissionResult('fail');
    }
  };

  // Helper for explanation data
  const validMeasurements = measurements.filter(m => m.current > 0);
  const bValues = validMeasurements.map(m => m.f / (PHYSICS_CONSTANTS.N * m.current * PHYSICS_CONSTANTS.L));
  const avgB_Actual = bValues.length > 0 ? bValues.reduce((a, b) => a + b, 0) / bValues.length : session.targetB;
  const deltaBValues = bValues.map(b => Math.abs(avgB_Actual - b));
  const avgDeltaB = deltaBValues.length > 0 ? deltaBValues.reduce((a, b) => a + b, 0) / deltaBValues.length : 0.001;

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <SimulationView 
              currentI={session.currentI} 
              tiltAngle={session.tiltAngle}
              isBalanced={session.isBalanced}
              displayedForce={displayedForce}
            />
            
            <MeasurementTable 
              measurements={measurements} 
              onRemove={(id) => setMeasurements(prev => prev.filter(m => m.id !== id))}
              onClear={() => setMeasurements([])}
            />

            {/* Báo cáo kết quả của Học sinh */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-500" />
                Nộp Báo Cáo Tính Toán
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Giá trị trung bình B̄ (Tesla)</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    placeholder="VD: 0.0350"
                    value={studentAvgB}
                    onChange={(e) => setStudentAvgB(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sai số tuyệt đối ΔB (Tesla)</label>
                  <input 
                    type="number" 
                    step="0.0001"
                    placeholder="VD: 0.0012"
                    value={studentErrorB}
                    onChange={(e) => setStudentErrorB(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={verifyResult}
                disabled={measurements.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Kiểm tra kết quả
              </button>

              {/* Phản hồi cho học sinh */}
              {submissionResult === 'success' && (
                <div className="mt-6 bg-emerald-50 border-2 border-emerald-200 p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-lg font-bold text-emerald-800">Tuyệt vời! Chính xác!</h4>
                      <p className="text-emerald-700">Bạn đã thực hiện phép đo và tính toán rất tốt. Giá trị bạn đưa ra hoàn toàn khớp với thực tế trong phòng thí nghiệm. Chúc mừng bạn!</p>
                    </div>
                  </div>
                </div>
              )}

              {submissionResult === 'fail' && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-rose-50 border-2 border-rose-100 p-5 rounded-2xl flex items-center gap-4 text-rose-800">
                    <AlertCircle className="w-8 h-8 shrink-0" />
                    <p className="font-medium">Giá trị tính toán chưa chính xác. Hãy rà soát lại các bước thay số và tính toán sai số bên dưới nhé!</p>
                  </div>
                  
                  <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-inner border border-slate-800">
                    <div className="flex items-center gap-2 mb-4 text-indigo-400">
                      <Info className="w-5 h-5" />
                      <span className="text-sm font-black uppercase tracking-widest">Hướng dẫn tính toán chi tiết</span>
                    </div>
                    
                    <div className="space-y-5 font-mono text-[13px] leading-relaxed">
                      {/* Bước 1 */}
                      <div>
                        <p className="text-white font-bold border-l-4 border-indigo-500 pl-3 uppercase mb-2">Bước 1: Công thức lý thuyết</p>
                        <div className="bg-slate-800 p-3 rounded-lg text-center text-blue-300">
                          B = F / (N * I * L)
                        </div>
                        <p className="mt-1 text-slate-400">N={PHYSICS_CONSTANTS.N}, L={PHYSICS_CONSTANTS.L}m ⇒ (N*L)={PHYSICS_CONSTANTS.N * PHYSICS_CONSTANTS.L}</p>
                      </div>

                      {/* Bước 2 */}
                      <div>
                        <p className="text-white font-bold border-l-4 border-indigo-500 pl-3 uppercase mb-2">Bước 2: Tính giá trị B cho từng lần đo</p>
                        <div className="space-y-1 bg-slate-800 p-3 rounded-lg overflow-x-auto">
                          {validMeasurements.map((m, i) => (
                            <div key={i}>
                              B_{i+1} = {m.f.toFixed(3)} / ({PHYSICS_CONSTANTS.N * PHYSICS_CONSTANTS.L} * {m.current.toFixed(2)}) = <span className="text-emerald-400">{bValues[i].toFixed(4)} T</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2">
                          <span className="text-white font-bold">⇒ B̄ = </span> (Tổng B_i) / {bValues.length} = <span className="text-indigo-400 font-bold underline text-lg">{avgB_Actual.toFixed(4)} T</span>
                        </p>
                      </div>

                      {/* Bước 3 */}
                      <div>
                        <p className="text-white font-bold border-l-4 border-indigo-500 pl-3 uppercase mb-2">Bước 3: Tính sai số tuyệt đối từng lần đo</p>
                        <p className="text-[11px] text-slate-400 mb-2 italic">Công thức: ΔB_i = |B̄ - B_i|</p>
                        <div className="space-y-1 bg-slate-800 p-3 rounded-lg overflow-x-auto">
                          {deltaBValues.map((db, i) => (
                            <div key={i}>
                              ΔB_{i+1} = |{avgB_Actual.toFixed(4)} - {bValues[i].toFixed(4)}| = <span className="text-amber-400">{db.toFixed(4)} T</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bước 4 */}
                      <div>
                        <p className="text-white font-bold border-l-4 border-indigo-500 pl-3 uppercase mb-2">Bước 4: Sai số tuyệt đối trung bình</p>
                        <div className="bg-slate-800 p-3 rounded-lg">
                          ΔB̄ = (Σ ΔB_i) / {deltaBValues.length} = <span className="text-amber-400 font-bold underline text-lg">{avgDeltaB.toFixed(4)} T</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800 text-center">
                        <p className="text-white font-bold">Kết quả cần ghi: B = {avgB_Actual.toFixed(4)} ± {avgDeltaB.toFixed(4)} (T)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Controls 
              currentI={session.currentI}
              onCurrentChange={handleCurrentChange}
              onBalance={handleBalance}
              onReset={handleReset}
              isBalanced={session.isBalanced}
              isOverheated={session.isOverheated}
            />
            
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
              <h4 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>THÔNG SỐ MÁY</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Lab Ver 2.1</span>
              </h4>
              <ul className="space-y-3 text-sm text-slate-600 font-mono">
                <li className="flex justify-between items-center">
                  <span className="text-slate-400">Số vòng dây:</span>
                  <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">N = {PHYSICS_CONSTANTS.N}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-400">Chiều dài PQ:</span>
                  <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">L = {PHYSICS_CONSTANTS.L} m</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-[11px] font-bold text-indigo-800 uppercase mb-2 tracking-wider">Cơ sở lý thuyết</p>
                <div className="text-[12px] text-indigo-900 italic font-serif leading-relaxed">
                  "Lực từ tác dụng lên đoạn dây dẫn tỉ lệ thuận với cường độ dòng điện, cảm ứng từ và chiều dài đoạn dây."
                </div>
                <div className="mt-2 text-center font-mono font-bold text-indigo-600">F = N.I.B.L</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
            <span>Thiết bị: Current Balance Model B-200</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Trường THPT Chuyên - Vật Lý 12</span>
          </div>
          <div className="hidden sm:block text-[11px] text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Thực hiện bởi Chuyên Gia Sư Phạm Vật Lý
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
