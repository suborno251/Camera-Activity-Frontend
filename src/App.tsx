import './index.css'

function App() {
  // Modal is now controlled by vanilla JS in script.js via CSS class
  // React just renders the container structure

  return (
    <>
      {/* ════════════════════ TOPBAR ════════════════════ */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon"><i className="bi bi-camera-video-fill"></i></div>
          <div className="brand-name">Factory<span>IQ</span></div>
        </div>
        <div className="topbar-right">
          <div className="live-badge">
            <div className="live-dot"></div>
            LIVE
          </div>
          <div className="topbar-time" id="clock">--:--:--</div>
        </div>
      </header>

      {/* ════════════════════ MAIN ════════════════════ */}
      <div className="main-wrap">

        {/* ── FACTORY SUMMARY ── */}
        <div className="section-header mb-3">
          <span className="section-label">Factory Overview</span>
          <div className="section-line"></div>
          <span className="section-label" id="shift-label">Shift A</span>
        </div>

        <div className="summary-grid" id="summary-grid">
          {/* Populated by JS */}
        </div>

        {/* ── WORKERS TABLE ── */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <i className="bi bi-people-fill"></i>
              Workers
              <span className="badge-count" id="worker-count">6</span>
            </div>
            <div className="filter-wrap">
              <div className="filter-wrap-inner">
                <i className="bi bi-search"></i>
                <input className="filter-input" type="text" id="worker-search" placeholder="Search worker..." />
              </div>
              <select className="filter-input" style={{ width: "130px", paddingLeft: "10px" }} id="worker-status-filter">
                <option value="">All Status</option>
                <option value="working">Working</option>
                <option value="idle">Idle</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" id="workers-table">
              <thead>
                <tr>
                  <th>Worker <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Status</th>
                  <th>Active Time <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Idle Time <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Utilization <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Units Produced <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Units / Hr <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="workers-tbody"></tbody>
            </table>
          </div>
        </div>

        {/* ── WORKSTATIONS TABLE ── */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <i className="bi bi-grid-3x2-gap-fill"></i>
              Workstations
              <span className="badge-count" id="station-count">6</span>
            </div>
            <div className="filter-wrap">
              <div className="filter-wrap-inner">
                <i className="bi bi-search"></i>
                <input className="filter-input" type="text" id="station-search" placeholder="Search station..." />
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table" id="stations-table">
              <thead>
                <tr>
                  <th>Station <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Type</th>
                  <th>Occupancy Time <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Utilization <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Units Produced <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th>Throughput / Hr <i className="bi bi-chevron-expand sort-icon"></i></th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="stations-tbody"></tbody>
            </table>
          </div>
        </div>

      </div>
      {/* /main-wrap */}

      {/* ════════════════════ DETAIL MODAL ════════════════════ */}
      <div className="detail-modal-overlay" id="modal-overlay" onClick={() => window.closeModal?.()}>
        <div className="detail-modal" id="modal-box" onClick={(e) => e.stopPropagation()}>
          <div className="modal-top">
            <div id="modal-header" />
            <button className="modal-close-btn" onClick={() => window.closeModal?.()}><i className="bi bi-x"></i></button>
          </div>
          <div className="modal-stat-grid" id="modal-stats" />
        </div>
      </div>

    </>
  )
}

export default App
