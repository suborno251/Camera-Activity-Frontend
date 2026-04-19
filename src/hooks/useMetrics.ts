import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

// ── Frontend types (camelCase)
interface FactoryMetrics {
  totalProductiveTime:  string;
  totalProductionCount: number;
  avgProductionRate:    string;
  avgUtilization:       number;
  totalEventsIngested:  number;
  activeCameras:        number;
  activeWorkers:        number;
}

interface Worker {
  id:          string;
  name:        string;
  status:      'working' | 'idle' | 'absent';
  activeTime:  string;
  idleTime:    string;
  utilization: number;
  units:       number;
  unitsPerHr:  number;
}

interface Workstation {
  id:          string;
  name:        string;
  type:        string;
  occupancy:   string;
  utilization: number;
  units:       number;
  throughput:  number;
}

// ── Raw API response types (snake_case)
interface RawFactory {
  total_productive_time:  string;
  total_production_count: number;
  avg_production_rate:    string;
  avg_utilization:        number;
  total_events_ingested:  number;
  active_cameras:         number;
  active_workers:         number;
}

interface RawWorker {
  worker_id:      string;
  name:           string;
  status:         'working' | 'idle' | 'absent';
  active_time:    string;
  idle_time:      string;
  utilization:    number;
  units_produced: number;
  units_per_hour: number;
}

interface RawWorkstation {
  station_id:          string;
  name:                string;
  type:                string;
  occupancy_time:      string;
  utilization:         number;
  units_produced:      number;
  throughput_per_hour: number;
}

interface RawMetricsResponse {
  factory:      RawFactory;
  workers:      RawWorker[];
  workstations: RawWorkstation[];
}

// ── Mappers
const mapFactory = (f: RawFactory): FactoryMetrics => ({
  totalProductiveTime:  f.total_productive_time,
  totalProductionCount: f.total_production_count,
  avgProductionRate:    f.avg_production_rate,
  avgUtilization:       f.avg_utilization,
  totalEventsIngested:  f.total_events_ingested,
  activeCameras:        f.active_cameras,
  activeWorkers:        f.active_workers,
});

const mapWorker = (w: RawWorker): Worker => ({
  id:          w.worker_id,
  name:        w.name,
  status:      w.status,
  activeTime:  w.active_time,
  idleTime:    w.idle_time,
  utilization: w.utilization,
  units:       w.units_produced,
  unitsPerHr:  w.units_per_hour,
});

const mapWorkstation = (s: RawWorkstation): Workstation => ({
  id:          s.station_id,
  name:        s.name,
  type:        s.type,
  occupancy:   s.occupancy_time,
  utilization: s.utilization,
  units:       s.units_produced,
  throughput:  s.throughput_per_hour,
});

export function useMetrics() {
  const [factoryMetrics, setFactoryMetrics] = useState<FactoryMetrics | null>(null);
  const [workers, setWorkers]               = useState<Worker[]>([]);
  const [workstations, setWorkstations]     = useState<Workstation[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/metrics`);
        if (!response.ok) throw new Error('Failed to fetch metrics');

        const data: RawMetricsResponse = await response.json();

        setFactoryMetrics(mapFactory(data.factory));
        setWorkers(data.workers.map(mapWorker));
        setWorkstations(data.workstations.map(mapWorkstation));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return { factoryMetrics, workers, workstations, loading, error };
}