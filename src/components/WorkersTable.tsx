import { useState, useMemo, useEffect } from 'react';

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

interface WorkersTableProps {
  workers: Worker[];
  onWorkerClick: (worker: Worker) => void;
}

interface StatusConfig {
  label: string;
  className: string;
}

export default function WorkersTable({ workers, onWorkerClick }: WorkersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, StatusConfig> = {
      working: { label: 'Working', className: 'working' },
      idle: { label: 'Idle', className: 'idle' },
      absent: { label: 'Absent', className: 'absent' },
    };
    const config = statusConfig[status] || { label: status, className: '' };
    return (
      <span className={`status-badge ${config.className}`}>
        <span className="status-dot"></span>
        {config.label}
      </span>
    );
  };

  const getUtilColor = (pct: number) => {
    if (pct >= 80) return 'var(--green)';
    if (pct >= 55) return 'var(--amber)';
    return 'var(--red)';
  };

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = !searchQuery ||
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || worker.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [workers, searchQuery, statusFilter]);

  const sortedWorkers = useMemo(() => {
    return [...filteredWorkers].sort((a, b) => {
      let aVal: number | string = a[sortField as keyof Worker];
      let bVal: number | string = b[sortField as keyof Worker];

      // Handle numeric values
      if (typeof aVal === 'string' && aVal.includes('h')) {
        const parseTime = (time: string) => {
          const match = time.match(/(\d+)h\s*(\d*)m?/);
          if (match) {
            return parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
          }
          return 0;
        };
        aVal = parseTime(aVal);
        bVal = parseTime(bVal as string);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredWorkers, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getWorkerColorIndex = (worker: Worker) => {
    const index = workers.findIndex(w => w.id === worker.id);
    return index % 6;
  };

  // Animate progress bars after render
  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.worker-util-bar').forEach(el => {
        el.style.width = el.dataset.target + '%';
      });
    }, 150);
  }, [sortedWorkers]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">
          <i className="bi bi-people-fill"></i>
          Workers
          <span className="badge-count">{sortedWorkers.length}</span>
        </div>
        <div className="filter-wrap">
          <div className="filter-wrap-inner">
            <i className="bi bi-search"></i>
            <input
              className="filter-input"
              type="text"
              placeholder="Search worker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-input"
            style={{ width: '130px', paddingLeft: '10px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="working">Working</option>
            <option value="idle">Idle</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" id="workers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                Worker <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th>Status</th>
              <th onClick={() => handleSort('activeTime')}>
                Active Time <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('idleTime')}>
                Idle Time <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('utilization')}>
                Utilization <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('units')}>
                Units Produced <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('unitsPerHr')}>
                Units / Hr <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody id="workers-tbody">
            {sortedWorkers.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <i className="bi bi-person-slash"></i>
                    <p>No workers found</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedWorkers.map((worker, index) => {
                const utilColor = getUtilColor(worker.utilization);
                return (
                  <tr
                    key={worker.id}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <td>
                      <div className="worker-name-wrap">
                        <div className={`id-chip w-color-${getWorkerColorIndex(worker)}`}>
                          {worker.id}
                        </div>
                        <div>
                          <div className="name-text">{worker.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(worker.status)}</td>
                    <td className="mono">{worker.activeTime}</td>
                    <td className="mono">{worker.idleTime}</td>
                    <td>
                      <div className="mini-progress">
                        <div className="mini-bar-track">
                          <div
                            className="mini-bar-fill worker-util-bar"
                            data-target={worker.utilization}
                            style={{ width: '0%', background: utilColor }}
                          ></div>
                        </div>
                        <div className="mini-bar-pct">{worker.utilization}%</div>
                      </div>
                    </td>
                    <td className="mono">{worker.units.toLocaleString()}</td>
                    <td className="mono">{worker.unitsPerHr}</td>
                    <td>
                      <button
                        className="btn btn-sm worker-details-btn"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                        }}
                        onClick={() => onWorkerClick(worker)}
                        type="button"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
