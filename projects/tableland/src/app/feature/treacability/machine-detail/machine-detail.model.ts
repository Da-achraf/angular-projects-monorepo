import { BOM } from '../../../core/crud/boms/bom.model';

export type VerificationRecord = {
  bomItemId: number;
  threeSCode: string;
  component: string;
  verifiedAt: Date;
  position: string;
};

export const MachineStatus = {
  Ready: 'ready',
  Active: 'active',
  Starved: 'starved',
  Idle: 'idle',
} as const;

export type MachineStatus = (typeof MachineStatus)[keyof typeof MachineStatus];

export interface Machine {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface LoadingState {
  machine: boolean;
  status: boolean;
  cachedData: boolean;
  bom: boolean;
  verificationRecords: boolean;
}

export interface AppState {
  machine: Machine | null;
  status: MachineStatus | undefined;
  pn: string;
  po: string;
  bom: BOM[];
  verifiedRecords: VerificationRecord[];
  loading: LoadingState;
  error: string | null;
}

// Computed view state interface
export interface ViewState {
  isLoading: boolean;
  showScanning: boolean;
  showBom: boolean;
  showMaterialReplenishment: boolean;
  canShowInterface: boolean;
}

