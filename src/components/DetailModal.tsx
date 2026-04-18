interface Worker {
  id: string;
  name: string;
  status: string;
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

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Worker | Workstation | null;
  type: 'worker' | 'station' | null;
}

interface ModalStat {
  label: string;
  value: string;
  icon: string;
}

export default function DetailModal({ isOpen, onClose, data, type }: DetailModalProps) {
  if (!isOpen || !data || !type) return null;

  const getModalStats = (): ModalStat[] => {
    if (type === 'worker' && 'activeTime' in data) {
      return [
        { label: 'Active Time', value: data.activeTime, icon: 'bi-clock' },
        { label: 'Idle Time', value: data.idleTime, icon: 'bi-pause-circle' },
        { label: 'Utilization', value: `${data.utilization}%`, icon: 'bi-bar-chart' },
        { label: 'Units Produced', value: data.units.toLocaleString(), icon: 'bi-box-seam' },
        { label: 'Units / Hour', value: data.unitsPerHr.toString(), icon: 'bi-speedometer2' },
        { label: 'Status', value: data.status.charAt(0).toUpperCase() + data.status.slice(1), icon: 'bi-activity' },
      ];
    } else if ('occupancy' in data) {
      return [
        { label: 'Occupancy', value: data.occupancy, icon: 'bi-clock' },
        { label: 'Utilization', value: `${data.utilization}%`, icon: 'bi-bar-chart' },
        { label: 'Units Produced', value: data.units.toLocaleString(), icon: 'bi-box-seam' },
        { label: 'Throughput/Hr', value: `${data.throughput} units`, icon: 'bi-speedometer2' },
      ];
    }
    return [];
  };

  const getColorIndex = () => {
    const index = type === 'worker'
      ? parseInt(data.id.replace('W', '')) - 1
      : parseInt(data.id.replace('S', '')) - 1;
    return index % 6;
  };

  return (
    <div
      className="detail-modal-overlay open"
      onClick={onClose}
    >
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div id="modal-header">
            <div className="worker-name-wrap">
              <div
                className={`id-chip w-color-${getColorIndex()}`}
                style={{ width: '36px', height: '36px', fontSize: '13px' }}
              >
                {data.id}
              </div>
              <div>
                <div className="name-text" style={{ fontSize: '17px' }}>
                  {'name' in data ? data.name : data.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {type === 'worker' ? 'Worker Detail View' : `${(data as Workstation).type} Station`}
                </div>
              </div>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        <div className="modal-stat-grid" id="modal-stats">
          {getModalStats().map((stat, index) => (
            <div key={index} className="modal-stat">
              <div style={{ color: 'var(--amber)', fontSize: '13px', marginBottom: '8px' }}>
                <i className={`bi ${stat.icon}`}></i>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {stat.label}
                </span>
              </div>
              <div className="modal-stat-val">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
