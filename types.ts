
export interface Measurement {
  id: string;
  current: number; // I (A)
  f1: number;      // F1 (N) - systematic offset
  f2: number;      // F2 (N) - measured total force
  f: number;       // F = F2 - F1 (N)
}

export interface SimulationState {
  targetB: number;
  fOffset: number;
  currentI: number;
  isBalanced: boolean;
  isOverheated: boolean;
  tiltAngle: number;
}
