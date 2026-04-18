// ════════════════════════════════════════════
//  MOCK DATA — Replace with API calls later
// ════════════════════════════════════════════

const factoryMetrics = {
  totalProductiveTime: "38h 20m",
  totalProductionCount: 1284,
  avgProductionRate: "33.8 units/hr",
  avgUtilization: 76.4,
};

const workers = [
  { id: "W1", name: "Carlos Mendez",  status: "working", activeTime: "6h 45m", idleTime: "1h 15m", utilization: 84, units: 223, unitsPerHr: 33.1 },
  { id: "W2", name: "Anika Sharma",   status: "working", activeTime: "7h 10m", idleTime: "0h 50m", utilization: 89, units: 248, unitsPerHr: 34.6 },
  { id: "W3", name: "James Okafor",   status: "idle",    activeTime: "5h 30m", idleTime: "2h 30m", utilization: 68, units: 187, unitsPerHr: 34.0 },
  { id: "W4", name: "Mei-Lin Zhang",  status: "working", activeTime: "6h 55m", idleTime: "1h 05m", utilization: 86, units: 231, unitsPerHr: 33.4 },
  { id: "W5", name: "Dmitri Volkov",  status: "absent",  activeTime: "3h 00m", idleTime: "0h 30m", utilization: 42, units:  98, unitsPerHr: 32.7 },
  { id: "W6", name: "Fatima Al-Nour", status: "idle",    activeTime: "5h 50m", idleTime: "2h 10m", utilization: 72, units: 297, unitsPerHr: 50.9 },
];

const workstations = [
  { id: "S1", name: "Station Alpha",   type: "Assembly",   occupancy: "6h 40m", utilization: 83, units: 218, throughput: 32.7 },
  { id: "S2", name: "Station Beta",    type: "Packaging",  occupancy: "7h 00m", utilization: 87, units: 241, throughput: 34.4 },
  { id: "S3", name: "Station Gamma",   type: "Assembly",   occupancy: "5h 20m", utilization: 66, units: 178, throughput: 33.4 },
  { id: "S4", name: "Station Delta",   type: "QA",         occupancy: "6h 50m", utilization: 85, units: 226, throughput: 33.1 },
  { id: "S5", name: "Station Epsilon", type: "Welding",    occupancy: "3h 10m", utilization: 39, units: 101, throughput: 31.9 },
  { id: "S6", name: "Station Zeta",    type: "Packaging",  occupancy: "5h 45m", utilization: 71, units: 320, throughput: 55.7 },
];

// ════════════════════════════════════════════
//  RENDER SUMMARY CARDS
// ════════════════════════════════════════════

function renderSummary() {
  const cards = [
    {
      color: "amber",
      icon: "bi-clock-history",
      value: factoryMetrics.totalProductiveTime,
      label: "Total Productive Time",
      sub: "Across all 6 workers",
    },
    {
      color: "green",
      icon: "bi-box-seam",
      value: factoryMetrics.totalProductionCount.toLocaleString(),
      label: "Total Units Produced",
      sub: `Avg rate: ${factoryMetrics.avgProductionRate}`,
    },
    {
      color: "blue",
      icon: "bi-bar-chart-fill",
      value: factoryMetrics.avgUtilization + "%",
      label: "Avg Worker Utilization",
      sub: null,
      bar: factoryMetrics.avgUtilization,
    },
    {
      color: "red",
      icon: "bi-camera-video",
      value: "6 / 6",
      label: "Active Cameras",
      sub: "All systems operational",
    },
  ];

  const grid = document.getElementById("summary-grid");
  grid.innerHTML = cards.map((c, i) => `
    <div class="stat-card ${c.color}" style="animation-delay:${i * 0.08}s">
      <div class="stat-icon"><i class="bi ${c.icon}"></i></div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
      ${c.sub ? `<div class="stat-sub">${c.sub}</div>` : ""}
      ${c.bar !== undefined ? `
        <div class="util-bar-wrap">
          <div class="util-bar-track">
            <div class="util-bar-fill" style="width:0%; background:var(--blue);"
              data-target="${c.bar}" id="summary-bar"></div>
          </div>
        </div>` : ""}
    </div>
  `).join("");

  // Animate bar after paint
  requestAnimationFrame(() => {
    const bar = document.getElementById("summary-bar");
    if (bar) setTimeout(() => bar.style.width = bar.dataset.target + "%", 100);
  });
}

// ════════════════════════════════════════════
//  RENDER WORKERS TABLE
// ════════════════════════════════════════════

function getStatusBadge(status) {
  const map = {
    working: `<span class="status-badge working"><span class="status-dot"></span>Working</span>`,
    idle:    `<span class="status-badge idle"><span class="status-dot"></span>Idle</span>`,
    absent:  `<span class="status-badge absent"><span class="status-dot"></span>Absent</span>`,
  };
  return map[status] || status;
}

function getUtilColor(pct) {
  if (pct >= 80) return "var(--green)";
  if (pct >= 55) return "var(--amber)";
  return "var(--red)";
}

function renderWorkers(data) {
  const tbody = document.getElementById("workers-tbody");
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state"><i class="bi bi-person-slash"></i><p>No workers found</p></div>
    </td></tr>`;
    document.getElementById("worker-count").textContent = 0;
    return;
  }
  document.getElementById("worker-count").textContent = data.length;
  tbody.innerHTML = data.map((w, i) => {
    const color = getUtilColor(w.utilization);
    return `
    <tr style="animation-delay:${i * 0.06}s">
      <td>
        <div class="worker-name-wrap">
          <div class="id-chip w-color-${workers.indexOf(w) % 6}">${w.id}</div>
          <div>
            <div class="name-text">${w.name}</div>
          </div>
        </div>
      </td>
      <td>${getStatusBadge(w.status)}</td>
      <td class="mono">${w.activeTime}</td>
      <td class="mono">${w.idleTime}</td>
      <td>
        <div class="mini-progress">
          <div class="mini-bar-track">
            <div class="mini-bar-fill" data-target="${w.utilization}"
              style="width:0%; background:${color};"></div>
          </div>
          <div class="mini-bar-pct">${w.utilization}%</div>
        </div>
      </td>
      <td class="mono">${w.units.toLocaleString()}</td>
      <td class="mono">${w.unitsPerHr}</td>
      <td>
        <button class="btn btn-sm worker-details-btn" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);font-size:11px;"
          data-worker-idx="${workers.indexOf(w)}" type="button">
          Details
        </button>
      </td>
    </tr>`;
  }).join("");

  // Animate mini bars
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll(".mini-bar-fill").forEach(el => {
        el.style.width = el.dataset.target + "%";
      });
    }, 150);
  });

  // Note: Click listeners are now handled by event delegation at the document level
  // to work reliably with React's rendering
}

// ════════════════════════════════════════════
//  RENDER STATIONS TABLE
// ════════════════════════════════════════════

const stationTypeIcon = {
  Assembly: "bi-tools",
  Packaging: "bi-box",
  QA: "bi-clipboard-check",
  Welding: "bi-fire",
};

function renderStations(data) {
  const tbody = document.getElementById("stations-tbody");
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><i class="bi bi-grid-slash"></i><p>No stations found</p></div>
    </td></tr>`;
    document.getElementById("station-count").textContent = 0;
    return;
  }
  document.getElementById("station-count").textContent = data.length;
  tbody.innerHTML = data.map((s, i) => {
    const color = getUtilColor(s.utilization);
    const icon  = stationTypeIcon[s.type] || "bi-gear";
    return `
    <tr style="animation-delay:${i * 0.06}s">
      <td>
        <div class="worker-name-wrap">
          <div class="id-chip w-color-${i % 6}">${s.id}</div>
          <div class="name-text">${s.name}</div>
        </div>
      </td>
      <td>
        <span style="color:var(--text-secondary); font-size:13px;">
          <i class="bi ${icon}" style="color:var(--amber); margin-right:5px;"></i>${s.type}
        </span>
      </td>
      <td class="mono">${s.occupancy}</td>
      <td>
        <div class="mini-progress">
          <div class="mini-bar-track">
            <div class="mini-bar-fill" data-target="${s.utilization}"
              style="width:0%; background:${color};"></div>
          </div>
          <div class="mini-bar-pct">${s.utilization}%</div>
        </div>
      </td>
      <td class="mono">${s.units.toLocaleString()}</td>
      <td class="mono">${s.throughput} /hr</td>
      <td>
        <button class="btn btn-sm station-details-btn" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-secondary);font-size:11px;"
          data-station-idx="${i}" type="button">
          Details
        </button>
      </td>
    </tr>`;
  }).join("");

  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll(".mini-bar-fill").forEach(el => {
        el.style.width = el.dataset.target + "%";
      });
    }, 150);
  });
}

// ════════════════════════════════════════════
//  MODAL CONTENT HELPERS (React handles open/close state)
// ════════════════════════════════════════════

// Expose functions on window for button clicks to call
window.openWorkerModal = function(idx) {
  const w = workers[idx];
  const header = document.getElementById("modal-header");
  const stats = document.getElementById("modal-stats");
  const overlay = document.getElementById("modal-overlay");

  if (header) {
    header.innerHTML = `
      <div class="worker-name-wrap">
        <div class="id-chip w-color-${idx % 6}" style="width:36px;height:36px;font-size:13px;">${w.id}</div>
        <div>
          <div class="name-text" style="font-size:17px;">${w.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Worker Detail View</div>
        </div>
      </div>`;
  }
  if (stats) {
    stats.innerHTML = `
      ${modalStat("Active Time",  w.activeTime,  "bi-clock")}
      ${modalStat("Idle Time",    w.idleTime,    "bi-pause-circle")}
      ${modalStat("Utilization",  w.utilization + "%", "bi-bar-chart")}
      ${modalStat("Units Produced", w.units.toLocaleString(), "bi-box-seam")}
      ${modalStat("Units / Hour", w.unitsPerHr,  "bi-speedometer2")}
      ${modalStat("Status",       w.status.charAt(0).toUpperCase() + w.status.slice(1), "bi-activity")}
    `;
  }
  // Open modal by adding class directly
  if (overlay) {
    overlay.classList.add("open");
  }
};

window.openStationModal = function(idx) {
  const s = workstations[idx];
  const header = document.getElementById("modal-header");
  const stats = document.getElementById("modal-stats");
  const overlay = document.getElementById("modal-overlay");

  if (header) {
    header.innerHTML = `
      <div class="worker-name-wrap">
        <div class="id-chip w-color-${idx % 6}" style="width:36px;height:36px;font-size:13px;">${s.id}</div>
        <div>
          <div class="name-text" style="font-size:17px;">${s.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${s.type} Station</div>
        </div>
      </div>`;
  }
  if (stats) {
    stats.innerHTML = `
      ${modalStat("Occupancy",    s.occupancy,   "bi-clock")}
      ${modalStat("Utilization",  s.utilization + "%", "bi-bar-chart")}
      ${modalStat("Units Produced", s.units.toLocaleString(), "bi-box-seam")}
      ${modalStat("Throughput/Hr", s.throughput + " units", "bi-speedometer2")}
    `;
  }
  // Open modal by adding class directly
  if (overlay) {
    overlay.classList.add("open");
  }
};

function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.remove("open");
  }
}
window.closeModal = closeModal;

function modalStat(label, value, icon) {
  return `
    <div class="modal-stat">
      <div style="color:var(--amber);font-size:13px;margin-bottom:8px;"><i class="bi ${icon}"></i> <span style="font-size:11px;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;">${label}</span></div>
      <div class="modal-stat-val">${value}</div>
    </div>`;
}

// Modal functions removed - now handled by React in App.tsx

// ════════════════════════════════════════════
//  EVENT DELEGATION FOR BUTTON CLICKS
// ════════════════════════════════════════════

// Event delegation will be set up in the INIT section after everything is loaded

// ════════════════════════════════════════════
//  FILTERING
// ════════════════════════════════════════════

function applyWorkerFilters() {
  const q = document.getElementById("worker-search")?.value.toLowerCase();
  const status = document.getElementById("worker-status-filter")?.value;
  if (!q && !status) return;
  let filtered = workers.filter(w => {
    const matchQ = !q || w.name.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
    const matchS = !status || w.status === status;
    return matchQ && matchS;
  });
  renderWorkers(filtered);
}

// ════════════════════════════════════════════
//  CLOCK
// ════════════════════════════════════════════

function updateClock() {
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toTimeString().slice(0, 8);
  }
}

// ════════════════════════════════════════════
//  INIT - Wait for DOM to be ready
// ════════════════════════════════════════════

// In a React app, we need to wait for React to render the DOM elements first
// Use a small delay to let React mount before manipulating DOM
setTimeout(() => {
  renderSummary();
  renderWorkers(workers);
  renderStations(workstations);

  // Attach event listeners after DOM is ready
  const workerSearch = document.getElementById("worker-search");
  const workerStatusFilter = document.getElementById("worker-status-filter");
  const stationSearch = document.getElementById("station-search");

  if (workerSearch) workerSearch.addEventListener("input", applyWorkerFilters);
  if (workerStatusFilter) workerStatusFilter.addEventListener("change", applyWorkerFilters);
  if (stationSearch) stationSearch.addEventListener("input", function() {
    const q = this.value.toLowerCase();
    const filtered = workstations.filter(s =>
      !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.type.toLowerCase().includes(q)
    );
    renderStations(filtered);
  });

  // Start clock
  setInterval(updateClock, 1000);
  updateClock();

  // Set up event delegation for button clicks
  // // console.log("Setting up event delegation for .worker-details-btn and .station-details-btn");
  document.addEventListener("click", function(e) {
    // console.log("Click detected, target:", e.target.className);
    const workerBtn = e.target.closest(".worker-details-btn");
    if (workerBtn) {
      // console.log("!!! Worker button found!");
      e.preventDefault();
      e.stopPropagation();
      const idx = workerBtn.getAttribute("data-worker-idx");
      // // console.log("Worker button clicked, idx:", idx);
      // // console.log("window.openWorkerModal exists:", !!window.openWorkerModal);
      if (idx !== null && window.openWorkerModal) {
        // console.log("Calling window.openWorkerModal with", parseInt(idx, 10));
        window.openWorkerModal(parseInt(idx, 10));
      } else {
        // console.log("SKIP: idx=", idx, "openWorkerModal=", !!window.openWorkerModal);
      }
    }

    const stationBtn = e.target.closest(".station-details-btn");
    if (stationBtn) {
      // // console.log("!!! Station button found!");
      e.preventDefault();
      e.stopPropagation();
      const idx = stationBtn.getAttribute("data-station-idx");
      // // console.log("Station button clicked, idx:", idx);
      // // console.log("window.openStationModal exists:", !!window.openStationModal);
      if (idx !== null && window.openStationModal) {
        // // console.log("Calling window.openStationModal with", parseInt(idx, 10));
        window.openStationModal(parseInt(idx, 10));
      } else {
        // // console.log("SKIP: idx=", idx, "openStationModal=", !!window.openStationModal);
      }
    }
  });
}, 100);