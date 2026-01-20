
import React from 'react';
import { PHYSICS_CONSTANTS } from '../utils/math';

interface SimulationViewProps {
  currentI: number;
  tiltAngle: number; // in degrees
  isBalanced: boolean;
  displayedForce: number; // The force currently "read" by the dynamometer
}

const SimulationView: React.FC<SimulationViewProps> = ({ currentI, tiltAngle, isBalanced, displayedForce }) => {
  // SVG proportions
  const width = 600;
  const height = 400;
  const pivotX = width / 2 - 40; 
  const pivotY = 80; 
  const beamLength = 420;

  // Visual constants
  const hangOffsetFromPivot = 202.5; 
  const hangLength = 130; 
  const dX = 60; 
  const dY = -40; 
  const coilHeight = 70;

  // Physics-based rotation
  const rad = (tiltAngle * Math.PI) / 180;
  
  // Toạ độ điểm treo trên đòn cân (World Space)
  const rightHangWorldX = pivotX + hangOffsetFromPivot * Math.cos(rad);
  const rightHangWorldY = pivotY + hangOffsetFromPivot * Math.sin(rad);

  const leftHangOffset = -170;
  const leftHangWorldX = pivotX + leftHangOffset * Math.cos(rad);
  const leftHangWorldY = pivotY + leftHangOffset * Math.sin(rad);

  // Dynamometer positioning
  const tableY = height - 30; 
  const dynamometerHeight = 110;
  const dynoBodyY = (leftHangWorldY + tableY) / 2 - dynamometerHeight / 2;

  // Magnet Dimensions
  const magnetCenterX = pivotX + hangOffsetFromPivot - 15; 
  const magnetBaseY = tableY - 10; 
  const magW = 160; 
  const poleH = 100;
  const baseH = 20;

  const xL = -magW / 2;
  const xR = magW / 2;
  const xIL = -45; 
  const xIR = 45;  

  // Colors
  const greyTop = '#cbd5e1'; const greyFront = '#94a3b8'; const greySide = '#64748b';
  const redTop = '#f87171'; const redFront = '#ef4444'; const redSide = '#b91c1c';
  const blueTop = '#60a5fa'; const blueFront = '#3b82f6'; const blueSide = '#1d4ed8';

  // Coil Path (3D Rectangle)
  const coilPath = `M 0 0 L ${dX} ${dY} L ${dX} ${coilHeight + dY} L 0 ${coilHeight} Z`;

  // Common transition class for all moving parts
  const motionClass = "transition-all duration-700 ease-out";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
      <div className="absolute top-4 left-4 bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-mono shadow-sm z-10">
        MÔ PHỎNG 3D: CÂN DÒNG ĐIỆN
      </div>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none bg-slate-50">
        <defs>
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#cbd5e1', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#94a3b8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#92400e', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Support Table */}
        <path d={`M 0 ${tableY} L ${dX} ${tableY+dY} H ${width+dX} L ${width} ${tableY} Z`} fill="#1e293b" />
        <rect x="0" y={tableY} width={width} height={height - tableY} fill="#0f172a" />
        
        {/* Main Pillar */}
        <rect x={pivotX - 8} y={pivotY} width="16" height={tableY - pivotY} fill="url(#metalGradient)" />

        {/* Magnet (Fixed) */}
        <g transform={`translate(${magnetCenterX}, ${magnetBaseY})`}>
          <g stroke="#000" strokeWidth="1" strokeLinejoin="round">
            <path d={`M ${xL} ${-baseH} L ${xL+dX} ${-baseH+dY} H ${xR+dX} L ${xR} ${-baseH} Z`} fill={greyTop} />
            <rect x={xL} y={-baseH} width={magW} height={baseH} fill={greyFront} />
            <path d={`M ${xR} ${-baseH} L ${xR+dX} ${-baseH+dY} V ${0+dY} L ${xR} 0 Z`} fill={greySide} />
          </g>
          <g stroke="#000" strokeWidth="1">
            <path d={`M ${xL} ${-poleH} L ${xL+dX} ${-poleH+dY} H ${xIL+dX} L ${xIL} ${-poleH} Z`} fill={redTop} />
            <rect x={xL} y={-poleH} width={xIL - xL} height={poleH - baseH} fill={redFront} />
            <path d={`M ${xIL} ${-poleH} L ${xIL+dX} ${-poleH+dY} V ${-baseH+dY} L ${xIL} ${-baseH} Z`} fill={redSide} />
            <text x={xL + (xIL-xL)/2} y={-poleH/2 - 10} textAnchor="middle" className="text-[12px] fill-white font-black italic">N</text>
          </g>
          <g stroke="#000" strokeWidth="1">
            <path d={`M ${xIR} ${-poleH} L ${xIR+dX} ${-poleH+dY} H ${xR+dX} L ${xR} ${-poleH} Z`} fill={blueTop} />
            <rect x={xIR} y={-poleH} width={xR - xIR} height={poleH - baseH} fill={blueFront} />
            <path d={`M ${xR} ${-poleH} L ${xR+dX} ${-poleH+dY} V ${-baseH+dY} L ${xR} ${-baseH} Z`} fill={blueSide} />
            <text x={xIR + (xR-xIR)/2} y={-poleH/2 - 10} textAnchor="middle" className="text-[12px] fill-white font-black italic">S</text>
          </g>
        </g>

        {/* Dynamometer Connection (Synchronized) */}
        <g className={motionClass}>
          <line x1={leftHangWorldX} y1={leftHangWorldY} x2={leftHangWorldX} y2={dynoBodyY} stroke="#475569" strokeWidth="1.5" />
          <line x1={leftHangWorldX} y1={dynoBodyY + dynamometerHeight} x2={leftHangWorldX} y2={tableY} stroke="#475569" strokeWidth="1.5" />
          <g transform={`translate(${leftHangWorldX - 25}, ${dynoBodyY})`}>
            <rect width="50" height={dynamometerHeight} rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            <rect x="5" y="5" width="40" height={dynamometerHeight - 10} rx="3" fill="#fff" stroke="#e2e8f0" />
            <rect x="8" y="35" width="34" height="20" rx="2" fill="#000" />
            <text x="25" y="49" textAnchor="middle" className="text-[10px] font-mono fill-emerald-400 font-bold">{displayedForce.toFixed(3)}</text>
          </g>
        </g>

        {/* Hanging Coil Assembly (Synchronized) */}
        <g className={motionClass}>
          {/* Hanging Wires */}
          <line 
            x1={rightHangWorldX} y1={rightHangWorldY} 
            x2={rightHangWorldX - dX/2} y2={rightHangWorldY + hangLength} 
            stroke="#334155" strokeWidth="1.2" 
          />
          <line 
            x1={rightHangWorldX} y1={rightHangWorldY} 
            x2={rightHangWorldX + dX/2} y2={rightHangWorldY + hangLength + dY} 
            stroke="#334155" strokeWidth="1.2" 
          />
          
          {/* Coil 3D Rectangle */}
          <g transform={`translate(${rightHangWorldX - dX/2}, ${rightHangWorldY + hangLength})`}>
            <path 
              d={coilPath} 
              fill="rgba(217, 119, 6, 0.2)" 
              stroke="url(#wireGradient)" 
              strokeWidth="6" 
              strokeLinejoin="round"
              filter={currentI > 0 ? "url(#glow)" : ""}
            />
            <path 
              d={coilPath} 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth="0.5" 
              strokeDasharray="3,2" 
              opacity="0.5"
            />
          </g>
        </g>

        {/* Rotating Beam (Base Motion) */}
        <g transform={`rotate(${tiltAngle}, ${pivotX}, ${pivotY})`} className={motionClass}>
          <rect x={pivotX - beamLength / 2} y={pivotY - 6} width={beamLength} height="12" rx="3" fill="url(#metalGradient)" stroke="#475569" strokeWidth="1" />
          <circle cx={pivotX} cy={pivotY} r="8" fill="#0f172a" />
          <circle cx={pivotX + hangOffsetFromPivot} cy={pivotY} r="3" fill="#334155" />
          <circle cx={pivotX + leftHangOffset} cy={pivotY} r="3" fill="#334155" />
        </g>

        {/* Ammeter Visual */}
        <g transform="translate(490, 10)">
           <rect width="100" height="70" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
           <path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
           <g transform={`rotate(${-90 + (currentI * 180)}, 50, 50)`} className="transition-transform duration-500">
             <line x1="50" y1="50" x2="50" y2="28" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
           </g>
           <text x="50" y="62" textAnchor="middle" className="text-[9px] font-mono fill-blue-400 font-bold">{currentI.toFixed(2)} A</text>
        </g>
      </svg>
      
      <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Dòng điện (I)</p>
          <p className="text-sm text-slate-200 font-mono">{currentI.toFixed(3)} A</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Lực kế (F)</p>
          <p className="text-sm text-emerald-400 font-mono">{displayedForce.toFixed(3)} N</p>
        </div>
      </div>
    </div>
  );
};

export default SimulationView;
