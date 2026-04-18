export interface FactoryWorker {
  id: string;
  name: string;
  status: 'working' | 'idle' | 'absent';
  activeTime: string;
  idleTime: string;
  utilization: number;
  units: number;
  unitsPerHr: number;
}

export interface Workstation {
  id: string;
  name: string;
  type: string;
  occupancy: string;
  utilization: number;
  units: number;
  throughput: number;
}