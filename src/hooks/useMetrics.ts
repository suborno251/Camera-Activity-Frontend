import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FactoryMetrics {
  totalProductiveTime: string;
  totalProductionCount: number;
  avgProductionRate: string;
  avgUtilization: number;
}

interface Worker {
  id: string;
  name: string;
  status: 'working' | 'idle' | 'absent';
  activeTime: string;
  idleTime: string;
  utilization: number;
  units: number;
  unitsPerHr: number;
}

interface Workstation {
  id: string;
  name: string;
  type: string;
  occupancy: string;
  utilization: number;
  units: number;
  throughput: number;
}

interface MetricsData {
  factory?: FactoryMetrics;
  workers?: Worker[];
  workstations?: Workstation[];
}

// Mock data for development - replace with actual API calls
const mockFactoryMetrics: FactoryMetrics = {
  totalProductiveTime: "38h 20m",
  totalProductionCount: 1284,
  avgProductionRate: "33.8 units/hr",
  avgUtilization: 76.4,
};

const mockWorkers: Worker[] = [
  { id: "W1", name: "Carlos Mendez", status: "working", activeTime: "6h 45m", idleTime: "1h 15m", utilization: 84, units: 223, unitsPerHr: 33.1 },
  { id: "W2", name: "Anika Sharma", status: "working", activeTime: "7h 10m", idleTime: "0h 50m", utilization: 89, units: 248, unitsPerHr: 34.6 },
  { id: "W3", name: "James Okafor", status: "idle", activeTime: "5h 30m", idleTime: "2h 30m", utilization: 68, units: 187, unitsPerHr: 34.0 },
  { id: "W4", name: "Mei-Lin Zhang", status: "working", activeTime: "6h 55m", idleTime: "1h 05m", utilization: 86, units: 231, unitsPerHr: 33.4 },
  { id: "W5", name: "Dmitri Volkov", status: "absent", activeTime: "3h 00m", idleTime: "0h 30m", utilization: 42, units: 98, unitsPerHr: 32.7 },
  { id: "W6", name: "Fatima Al-Nour", status: "idle", activeTime: "5h 50m", idleTime: "2h 10m", utilization: 72, units: 297, unitsPerHr: 50.9 },
];

const mockWorkstations: Workstation[] = [
  { id: "S1", name: "Station Alpha", type: "Assembly", occupancy: "6h 40m", utilization: 83, units: 218, throughput: 32.7 },
  { id: "S2", name: "Station Beta", type: "Packaging", occupancy: "7h 00m", utilization: 87, units: 241, throughput: 34.4 },
  { id: "S3", name: "Station Gamma", type: "Assembly", occupancy: "5h 20m", utilization: 66, units: 178, throughput: 33.4 },
  { id: "S4", name: "Station Delta", type: "QA", occupancy: "6h 50m", utilization: 85, units: 226, throughput: 33.1 },
  { id: "S5", name: "Station Epsilon", type: "Welding", occupancy: "3h 10m", utilization: 39, units: 101, throughput: 31.9 },
  { id: "S6", name: "Station Zeta", type: "Packaging", occupancy: "5h 45m", utilization: 71, units: 320, throughput: 55.7 },
];

export function useMetrics() {
  const [factoryMetrics, setFactoryMetrics] = useState<FactoryMetrics>(mockFactoryMetrics);
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [workstations, setWorkstations] = useState<Workstation[]>(mockWorkstations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/metrics`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data: MetricsData = await response.json();
        setFactoryMetrics(data.factory || mockFactoryMetrics);
        setWorkers(data.workers || mockWorkers);
        setWorkstations(data.workstations || mockWorkstations);
        setError(null);
      } catch (err) {
        console.warn('API unavailable, using mock data:', err instanceof Error ? err.message : err);
        setError(null); 
        setFactoryMetrics(mockFactoryMetrics);
        setWorkers(mockWorkers);
        setWorkstations(mockWorkstations);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return { factoryMetrics, workers, workstations, loading, error };
}
