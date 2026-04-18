import { useState, useMemo, useEffect } from 'react';

interface Workstation {
  id: string;
  name: string;
  type: string;
  occupancy: string;
  utilization: number;
  units: number;
  throughput: number;
}

interface WorkstationsTableProps {
  workstations: Workstation[];
  onStationClick: (station: Workstation) => void;
}

const stationTypeIcon: Record<string, string> = {
  Assembly: 'bi-tools',
  Packaging: 'bi-box',
  QA: 'bi-clipboard-check',
  Welding: 'bi-fire',
};

export default function WorkstationsTable({ workstations, onStationClick }: WorkstationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getUtilColor = (pct: number) => {
    if (pct >= 80) return 'var(--green)';
    if (pct >= 55) return 'var(--amber)';
    return 'var(--red)';
  };

  const filteredStations = useMemo(() => {
    return workstations.filter(station => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        station.name.toLowerCase().includes(query) ||
        station.id.toLowerCase().includes(query) ||
        station.type.toLowerCase().includes(query)
      );
    });
  }, [workstations, searchQuery]);

  const sortedStations = useMemo(() => {
    return [...filteredStations].sort((a, b) => {
      let aVal: number | string = a[sortField as keyof Workstation];
      let bVal: number | string = b[sortField as keyof Workstation];

      // Handle time values
      if (typeof aVal === 'string' && aVal.includes('h')) {
        const parseTime = (time: string) => {
          const match = time.match(/(\d+)h\s*(\d*)m?/);
          if (match) {
            return parseInt(match[1]) * 60 + (match[2] ? parseInt(match[2]) : 0);
          }
          return 0;
        };
        aVal = parseTime(aVal);
        bVal = parseTime(bVal as string );
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStations, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Animate progress bars after render
  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll<HTMLElement>('.station-util-bar').forEach(el => {
        el.style.width = el.dataset.target + '%';
      });
    }, 150);
  }, [sortedStations]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">
          <i className="bi bi-grid-3x2-gap-fill"></i>
          Workstations
          <span className="badge-count">{sortedStations.length}</span>
        </div>
        <div className="filter-wrap">
          <div className="filter-wrap-inner">
            <i className="bi bi-search"></i>
            <input
              className="filter-input"
              type="text"
              placeholder="Search station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" id="stations-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                Station <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th>Type</th>
              <th onClick={() => handleSort('occupancy')}>
                Occupancy Time <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('utilization')}>
                Utilization <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('units')}>
                Units Produced <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th onClick={() => handleSort('throughput')}>
                Throughput / Hr <i className="bi bi-chevron-expand sort-icon"></i>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody id="stations-tbody">
            {sortedStations.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <i className="bi bi-grid-slash"></i>
                    <p>No stations found</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedStations.map((station, index) => {
                const utilColor = getUtilColor(station.utilization);
                const icon = stationTypeIcon[station.type] || 'bi-gear';
                return (
                  <tr
                    key={station.id}
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <td>
                      <div className="worker-name-wrap">
                        <div className={`id-chip w-color-${index % 6}`}>
                          {station.id}
                        </div>
                        <div className="name-text">{station.name}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <i className={`bi ${icon}`} style={{ color: 'var(--amber)', marginRight: '5px' }}></i>
                        {station.type}
                      </span>
                    </td>
                    <td className="mono">{station.occupancy}</td>
                    <td>
                      <div className="mini-progress">
                        <div className="mini-bar-track">
                          <div
                            className="mini-bar-fill station-util-bar"
                            data-target={station.utilization}
                            style={{ width: '0%', background: utilColor }}
                          ></div>
                        </div>
                        <div className="mini-bar-pct">{station.utilization}%</div>
                      </div>
                    </td>
                    <td className="mono">{station.units.toLocaleString()}</td>
                    <td className="mono">{station.throughput} /hr</td>
                    <td>
                      <button
                        className="btn btn-sm station-details-btn"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                          fontSize: '11px',
                        }}
                        onClick={() => onStationClick(station)}
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
