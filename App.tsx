
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SimulationView from './components/SimulationView';
import Controls from './components/Controls';
import MeasurementTable from './components/MeasurementTable';
import { Measurement, SimulationState } from './types';
import { gaussianRandom, PHYSICS_CONSTANTS, calculateMagneticForce } from './utils/math';
import { 
  CheckCircle2, 
  Calculator, 
  CloudUpload, 
  Loader2, 
  Target, 
  ChevronRight, 
  BookOpen, 
  ArrowRight, 
  Settings2,
  RefreshCcw,
  AlertCircle,
  Trophy,
  PartyPopper
} from 'lucide-react';

const App: React.FC = () => {
  // Trạng thái phiên thí nghiệm
  const [session, setSession] = useState<SimulationState>(() => ({
    targetB: 0.0175 + (Math.random() - 0.5) * 0.003, 
    fOffset: 0.210, 
    currentI: 0,
    isBalanced: true,
    isOverheated: false,
    tiltAngle: 0,
  }));

  // Khởi tạo bảng đo
  const initMeasurements = () => {
    const defaultI = [0.2, 0.4, 0.6, 0.8];
    return defaultI.map(i => ({
      id: crypto.randomUUID(),
      trueCurrent: i,
      trueF1: 0.210,
      trueF2: 0, 
      trueF: 0,
      inputI: i.toFixed(2),
      inputF1: '',
      inputF2: '',
      inputF: '',
      inputB: '',
      isValidated: false
    }));
  };

  const [measurements, setMeasurements] = useState<Measurement[]>(initMeasurements);
  const [displayedForce, setDisplayedForce] = useState<number>(session.fOffset);
  const [studentName, setStudentName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<string>('');
  const [studentAvgB, setStudentAvgB] = useState<string>('');
  const [studentDeltaB, setStudentDeltaB] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: 'success' | 'warning', message: string, percent: string } | null>(null);

  // Hiệu ứng vật lý
  useEffect(() => {
    const fMag = calculateMagneticForce(session.currentI, session.targetB);
    const currentTilt = session.isBalanced ? 0 : fMag * 55;
    
    setSession(prev => ({ 
      ...prev, 
      tiltAngle: currentTilt, 
      isOverheated: session.currentI > 0.8 
    }));
    
    const timer = setInterval(() => {
      const noise = gaussianRandom(0, 0.0035);
      setDisplayedForce(session.fOffset + fMag + noise);
    }, 100);
    
    return () => clearInterval(timer);
  }, [session.currentI, session.targetB, session.fOffset, session.isBalanced]);

  const handleCurrentChange = (val: number) => {
    if (hasSubmitted) return;
    setSession(prev => ({ 
      ...prev, 
      currentI: val, 
      isBalanced: val === 0 
    }));
  };

  const handleBalance = () => {
    if (hasSubmitted) return;
    const captured = displayedForce;
    setMeasurements(prev => prev.map(m => {
      if (Math.abs(parseFloat(m.inputI) - session.currentI) < 0.01) {
        return {
          ...m,
          trueF1: session.fOffset,
          trueF2: captured,
          trueF: captured - session.fOffset
        };
      }
      return m;
    }));
    setSession(prev => ({ ...prev, isBalanced: true }));
  };

  const handleReset = () => {
    setMeasurements(initMeasurements());
    setSession({
      targetB: 0.0175 + (Math.random() - 0.5) * 0.003,
      fOffset: 0.210,
      currentI: 0,
      isBalanced: true,
      isOverheated: false,
      tiltAngle: 0,
    });
    setStudentAvgB('');
    setStudentDeltaB('');
    setHasSubmitted(false);
    setSubmissionFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tính toán LỜI GIẢI CHUẨN (với nhiễu thực tế)
  const solutionData = useMemo(() => {
    const iValues = [0.2, 0.4, 0.6, 0.8];
    const rawTrials = iValues.map((i, index) => {
      const jitter = (Math.sin(index * 1.5 + session.targetB * 1000) * 0.0004);
      const bTrial = session.targetB + jitter;
      const fMag = calculateMagneticForce(i, bTrial);
      return { i, f1: session.fOffset, f2: session.fOffset + fMag, f: fMag, b: bTrial };
    });

    const avgB = rawTrials.reduce((sum, t) => sum + t.b, 0) / rawTrials.length;
    const trials = rawTrials.map(t => ({
      ...t,
      deltaBi: Math.abs(avgB - t.b)
    }));
    const avgDeltaB = trials.reduce((sum, t) => sum + t.deltaBi, 0) / trials.length;

    return {
      trials,
      avgB,
      avgBRounded: avgB.toFixed(4),
      avgDeltaB,
      avgDeltaBRounded: avgDeltaB.toFixed(4)
    };
  }, [session.targetB, session.fOffset]);

  const handleSync = async () => {
    if (!studentName || !studentClass) return alert("Vui lòng nhập Tên và Lớp.");
    if (!studentAvgB) return alert("Vui lòng nhập giá trị B trung bình.");
    
    setIsSyncing(true);
    setTimeout(() => {
      const studentVal = parseFloat(studentAvgB.replace(',', '.'));
      const errorPercentValue = (Math.abs(studentVal - solutionData.avgB) / solutionData.avgB) * 100;
      const formattedPercent = errorPercentValue.toFixed(2);

      if (errorPercentValue <= 8) {
        setSubmissionFeedback({ 
          type: 'success', 
          message: `Chúc mừng bạn ${studentName}! Bạn đã hoàn thành xuất sắc bài thực hành.`,
          percent: formattedPercent
        });
      } else {
        setSubmissionFeedback({ 
          type: 'warning', 
          message: `Chào bạn ${studentName}, kết quả của bạn có sai lệch khá cao so với hệ thống. Hãy làm cẩn thận hơn!`,
          percent: formattedPercent
        });
      }
      setHasSubmitted(true);
      setIsSyncing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans text-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <SimulationView 
              currentI={session.currentI} 
              tiltAngle={session.tiltAngle} 
              isBalanced={session.isBalanced} 
              displayedForce={displayedForce} 
            />
            
            <MeasurementTable 
              measurements={measurements} 
              onRemove={() => {}} 
              onClear={() => {}} 
              onUpdateRow={(id, f, v) => setMeasurements(prev => prev.map(m => m.id === id ? {...m, [f]: v} : m))} 
              onValidateRow={() => {}} 
            />

            {/* BÁO CÁO KẾT QUẢ - DARK THEME */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-orange-500" />
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Báo cáo thực hành</h3>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Học sinh</label>
                    <input type="text" disabled={hasSubmitted} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Tên..." className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lớp</label>
                    <input type="text" disabled={hasSubmitted} value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="Lớp..." className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-orange-500" />
                  </div>
                </div>

                <div className="bg-[#050914] text-white rounded-[2.5rem] p-10 space-y-10 shadow-2xl border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold italic text-sm">
                    <ChevronRight className="w-4 h-4" />
                    <span>Kết quả tính toán của bạn:</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
                    <div className="space-y-4">
                      <label className="text-[11px] text-slate-400 font-bold tracking-wider uppercase ml-1">B trung bình (Tesla):</label>
                      <input type="text" disabled={hasSubmitted} value={studentAvgB} onChange={(e) => setStudentAvgB(e.target.value)} placeholder="0.0" className="w-full px-8 py-6 rounded-2xl border border-slate-800 bg-[#0f172a] font-mono font-black text-3xl text-orange-400 focus:ring-2 focus:ring-indigo-500 outline-none text-center shadow-inner" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] text-slate-400 font-bold tracking-wider uppercase ml-1">Sai số (Tesla):</label>
                      <input type="text" disabled={hasSubmitted} value={studentDeltaB} onChange={(e) => setStudentDeltaB(e.target.value)} placeholder="0.0" className="w-full px-8 py-6 rounded-2xl border border-slate-800 bg-[#0f172a] font-mono font-black text-3xl text-orange-400 focus:ring-2 focus:ring-indigo-500 outline-none text-center shadow-inner" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center py-4">
                    <div className="bg-[#5a46ff] text-white px-16 py-6 rounded-3xl font-mono font-black text-4xl shadow-[0_0_40px_rgba(90,70,255,0.4)] tracking-tight">
                      B = {studentAvgB || "---"} ± {studentDeltaB || "---"} (T)
                    </div>
                  </div>
                </div>

                {/* THÔNG BÁO SAI LỆCH VÀ PHẢN HỒI */}
                {hasSubmitted && submissionFeedback && (
                  <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 animate-in zoom-in-95 duration-500 ${submissionFeedback.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className={`p-4 rounded-xl ${submissionFeedback.type === 'success' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-orange-500 shadow-orange-200'} shadow-lg text-white`}>
                      {submissionFeedback.type === 'success' ? <PartyPopper className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-lg ${submissionFeedback.type === 'success' ? 'text-emerald-800' : 'text-orange-800'}`}>
                        {submissionFeedback.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold opacity-60">Độ sai lệch so với hệ thống:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${submissionFeedback.type === 'success' ? 'bg-emerald-200 text-emerald-700' : 'bg-orange-200 text-orange-700'}`}>
                          {submissionFeedback.percent}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSync} 
                  disabled={isSyncing || hasSubmitted} 
                  className={`w-full flex items-center justify-center gap-3 py-6 rounded-2xl font-black transition-all shadow-xl active:scale-95 uppercase tracking-widest text-lg ${hasSubmitted ? 'bg-[#f0f4ff] text-[#6b7cff] cursor-default border border-[#e0e7ff]' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                >
                  {isSyncing ? <Loader2 className="w-6 h-6 animate-spin" /> : (hasSubmitted ? <CheckCircle2 className="w-6 h-6" /> : <CloudUpload className="w-6 h-6" />)}
                  {hasSubmitted ? 'ĐÃ NỘP BÁO CÁO' : 'NỘP BÀI VÀ XEM GIẢI CHI TIẾT'}
                </button>

                {hasSubmitted && (
                  <div className="mt-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 space-y-12">
                    <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-indigo-50 space-y-12">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-8">
                        <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl"><BookOpen className="w-8 h-8 text-white" /></div>
                        <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Hướng dẫn giải chi tiết</h4>
                      </div>

                      <div className="space-y-16">
                        <section className="space-y-8">
                          <h5 className="font-black text-xl text-slate-800 flex items-center gap-3 italic">1. Kết quả chi tiết cho 4 lần đo</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {solutionData.trials.map((t, i) => (
                              <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 group-hover:bg-orange-500 transition-colors" />
                                <h6 className="font-black text-indigo-700 text-lg uppercase tracking-tight underline">LẦN ĐO {i+1} (I = {t.i.toFixed(1)} A)</h6>
                                <div className="font-mono text-sm space-y-6">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• Bước 1: Tính B<sub>{i+1}</sub></p>
                                    <div className="flex items-center gap-4">
                                      <span className="font-black text-slate-800">B<sub>{i+1}</sub> =</span>
                                      <div className="flex flex-col items-center">
                                        <span className="border-b border-slate-400 px-6 font-bold">{t.f.toFixed(3)}</span>
                                        <span className="pt-1 text-[10px] font-bold text-slate-400">200 · {t.i.toFixed(1)} · 0,08</span>
                                      </div>
                                      <span className="font-black text-orange-600">≈ {t.b.toFixed(6)} T</span>
                                    </div>
                                  </div>
                                  <div className="pt-4 border-t border-slate-200 space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• Bước 2: Sai số tuyệt đối ΔB<sub>{i+1}</sub></p>
                                    <p className="text-slate-700">
                                      ΔB<sub>{i+1}</sub> = |{solutionData.avgBRounded} - {t.b.toFixed(6)}| = <span className="font-black text-emerald-600">{t.deltaBi.toFixed(6)} T</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <section className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100 text-center space-y-4">
                            <h5 className="font-black text-slate-800 text-lg italic uppercase">2. Giá trị trung bình B̄</h5>
                            <div className="font-mono">
                               B̄ = ΣB<sub>i</sub> / 4 ≈ <span className="text-2xl font-black text-indigo-600">{solutionData.avgB.toFixed(8)}</span>
                               <div className="mt-4 bg-white inline-block px-8 py-2 rounded-full border border-indigo-200 text-emerald-600 font-black shadow-sm">Làm tròn: {solutionData.avgBRounded} T</div>
                            </div>
                          </section>
                          <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 text-center space-y-4">
                            <h5 className="font-black text-slate-800 text-lg italic uppercase">3. Sai số tuyệt đối ΔB̄</h5>
                            <div className="font-mono">
                               ΔB̄ = ΣΔB<sub>i</sub> / 4 ≈ <span className="text-2xl font-black text-indigo-600">{solutionData.avgDeltaB.toFixed(8)}</span>
                               <div className="mt-4 bg-white inline-block px-8 py-2 rounded-full border border-indigo-200 text-emerald-600 font-black shadow-sm">Làm tròn: {solutionData.avgDeltaBRounded} T</div>
                            </div>
                          </section>
                        </div>

                        <section className="flex flex-col items-center gap-10 pt-16 border-t border-slate-100">
                           <div className="text-center space-y-4">
                              <p className="font-black text-slate-400 uppercase text-[10px] tracking-[0.6em]">KẾT QUẢ CUỐI CÙNG CHUẨN XÁC</p>
                              <div className="bg-[#050914] text-white px-20 py-12 rounded-[3.5rem] font-mono font-black text-5xl shadow-2xl relative">
                                 <span className="text-indigo-400">B = </span>{solutionData.avgBRounded} ± {solutionData.avgDeltaBRounded} (T)
                              </div>
                           </div>
                           <div className="p-10 bg-indigo-50/50 rounded-[3rem] border border-indigo-100 w-full max-w-2xl text-center space-y-8">
                             <div className="space-y-2">
                               <p className="text-xl font-black text-slate-800">Bạn muốn cải thiện kỹ năng đo lường?</p>
                               <p className="text-sm text-slate-500 italic">Nhấn nút bên dưới để thử thách với cấu hình nam châm mới.</p>
                             </div>
                             <button onClick={handleReset} className="flex items-center justify-center gap-4 w-full py-6 bg-[#5a46ff] hover:bg-[#4a36ef] text-white rounded-2xl font-black shadow-2xl shadow-indigo-300 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xl group">
                                <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> THỰC HÀNH LẠI THÍ NGHIỆM MỚI
                             </button>
                           </div>
                        </section>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
              <h4 className="font-black text-slate-800 mb-6 uppercase text-xs flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings2 className="w-4 h-4 text-indigo-600" /> Thông số thiết bị (11.1)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Số vòng dây (N)</div>
                  <div className="text-2xl font-black text-indigo-700 font-mono">200</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Chiều dài (L)</div>
                  <div className="text-2xl font-black text-indigo-700 font-mono">0,08<span className="text-xs ml-1 font-sans">m</span></div>
                </div>
              </div>
            </div>

            <Controls currentI={session.currentI} onCurrentChange={handleCurrentChange} onBalance={handleBalance} onReset={() => { if(window.confirm("Bắt đầu thí nghiệm mới?")) handleReset(); }} isBalanced={session.isBalanced} isOverheated={session.isOverheated} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
