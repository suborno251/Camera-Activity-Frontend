# FactoryIQ — AI-Powered Worker Productivity Dashboard

A full-stack web application that ingests AI-generated CCTV events, stores them in a database, computes productivity metrics, and displays them in a real-time dashboard.

---

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React.js + Bootstrap 5            |
| Backend        | Node.js + Express.js              |
| Database       | SQLite (via Knex.js)              |
| Containerization | Docker + Docker Compose         |

---

## Project Structure

```
factoryiq/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Knex SQLite connection setup
│   │   ├── controllers/
│   │   │   ├── eventController.js    # Handles POST /api/events
│   │   │   ├── metricController.js   # Handles GET /api/metrics
│   │   │   └── seedController.js     # Handles POST /api/seed/refresh
│   │   ├── routes/
│   │   │   ├── eventRoutes.js
│   │   │   ├── metricRoutes.js
│   │   │   └── seedRoutes.js
│   │   ├── services/
│   │   │   └── metricService.js      # All metric computation logic
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.js # Workers, workstations, events tables
│   │   ├── seeds/
│   │   │   └── seed_data.js          # 6 workers, 6 stations, dummy events
│   │   └── app.js                    # Express app entry point
│   ├── .env
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Topbar.jsx            # Header with live clock
│   │   │   ├── SummaryCards.jsx      # Factory-level metric cards
│   │   │   ├── WorkersTable.jsx      # Workers table with filters
│   │   │   ├── WorkstationsTable.jsx # Workstations table with filters
│   │   │   └── DetailModal.jsx       # Worker / station detail popup
│   │   ├── hooks/
│   │   │   └── useMetrics.js         # Custom hook — fetches API data
│   │   ├── App.jsx                   # Root component, holds state
│   │   ├── App.css                   # Global styles / CSS variables
│   │   └── index.js                  # React DOM entry point
│   ├── .env
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Database Schema

### `workers`
| Column      | Type     | Notes                  |
|-------------|----------|------------------------|
| worker_id   | TEXT     | Primary Key (e.g. W1)  |
| name        | TEXT     | Worker full name        |
| created_at  | DATETIME | Auto timestamp          |

### `workstations`
| Column      | Type     | Notes                       |
|-------------|----------|-----------------------------|
| station_id  | TEXT     | Primary Key (e.g. S1)       |
| name        | TEXT     | Station name                 |
| type        | TEXT     | Assembly / Packaging / QA etc|
| created_at  | DATETIME | Auto timestamp               |

### `events`
| Column         | Type     | Notes                                        |
|----------------|----------|----------------------------------------------|
| id             | INTEGER  | Primary Key, Auto Increment                  |
| timestamp      | DATETIME | Event time from CCTV system                  |
| worker_id      | TEXT     | Foreign Key → workers                        |
| workstation_id | TEXT     | Foreign Key → workstations                   |
| event_type     | TEXT     | working / idle / absent / product_count      |
| confidence     | REAL     | CV model confidence score (0.0 – 1.0)        |
| count          | INTEGER  | Units produced (only for product_count type) |
| created_at     | DATETIME | Auto timestamp                               |

> **Duplicate Prevention:** A `UNIQUE` constraint on `(worker_id, workstation_id, timestamp, event_type)` ensures duplicate events are silently ignored via `INSERT OR IGNORE`.

---

## API Endpoints

### Events
| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| POST   | `/api/events`        | Ingest a single CCTV event         |
| POST   | `/api/events/batch`  | Ingest multiple events at once     |

**Example Request Body:**
```json
{
  "timestamp": "2026-01-15T10:15:00Z",
  "worker_id": "W1",
  "workstation_id": "S3",
  "event_type": "working",
  "confidence": 0.93,
  "count": 1
}
```

### Metrics
| Method | Endpoint                      | Description                         |
|--------|-------------------------------|-------------------------------------|
| GET    | `/api/metrics`                | All metrics (factory + workers + stations) |
| GET    | `/api/metrics/workers`        | Worker-level metrics only           |
| GET    | `/api/metrics/workstations`   | Workstation-level metrics only      |
| GET    | `/api/metrics/factory`        | Factory-level summary only          |

### Seed / Admin
| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/seed/refresh`   | Wipe and re-seed all dummy data      |
| GET    | `/api/seed/status`    | Check current row counts in DB       |

---

## Metric Definitions

### Worker-Level
| Metric             | How It's Computed                                                                 |
|--------------------|-----------------------------------------------------------------------------------|
| Active Time        | Sum of time gaps between consecutive `working` events per worker                  |
| Idle Time          | Sum of time gaps between consecutive `idle` events per worker                     |
| Utilization %      | `(active_time / (active_time + idle_time)) * 100`                                 |
| Units Produced     | `SUM(count)` where `event_type = 'product_count'` for that worker                 |
| Units Per Hour     | `units_produced / active_time_in_hours`                                           |

### Workstation-Level
| Metric             | How It's Computed                                                                 |
|--------------------|-----------------------------------------------------------------------------------|
| Occupancy Time     | Sum of time gaps between consecutive `working` events at that station             |
| Utilization %      | `(occupancy_time / total_shift_duration) * 100`                                   |
| Units Produced     | `SUM(count)` where `event_type = 'product_count'` at that station                |
| Throughput Rate    | `units_produced / occupancy_time_in_hours`                                        |

### Factory-Level
| Metric                  | How It's Computed                                          |
|-------------------------|------------------------------------------------------------|
| Total Productive Time   | Sum of all workers' active time                            |
| Total Production Count  | `SUM(count)` across all `product_count` events            |
| Avg Production Rate     | `total_units / total_active_hours`                        |
| Avg Utilization         | Mean of all individual worker utilization percentages      |

---

## Assumptions & Tradeoffs

- **Time gaps:** Duration of an event is calculated as the time difference between two consecutive events for the same worker. The last event of a shift has no pair, so it is excluded from duration calculations.
- **Max gap cap:** Any time gap exceeding **60 minutes** is capped and not counted, to avoid inflating metrics due to shift breaks or overnight gaps.
- **Shift duration:** Assumed to be **8 hours** per shift for utilization percentage calculations at the workstation level.
- **product_count events:** These contribute only to unit totals, not to time-based calculations.
- **Absent events:** Recorded in the DB but excluded from active/idle time calculations.
- **Confidence threshold:** Events with `confidence < 0.5` are stored but flagged, and excluded from metric computations.

---

## Architecture Overview

```
[AI CCTV Camera / Seed Script]
          │
          │  POST /api/events (JSON)
          ▼
  [Express.js Backend]
          │
          ├──> Validates & stores in SQLite
          ├──> Computes metrics on GET requests
          │
          │  JSON Response
          ▼
    [React Frontend]
          │
          ├──> SummaryCards   (factory metrics)
          ├──> WorkersTable   (per-worker metrics)
          └──> WorkstationsTable (per-station metrics)
```

---

## Theoretical Questions

### 1. How Intermittent Connectivity Is Handled
- The CCTV edge device maintains a **local queue** (file-based or SQLite on-device) that buffers events when the network is unavailable.
- On reconnection, buffered events are **batch-posted** to `POST /api/events/batch`.
- The backend uses `INSERT OR IGNORE` with the unique constraint to safely replay batches without creating duplicates.

### 2. How Duplicate Events Are Handled
- A composite `UNIQUE` constraint on `(worker_id, workstation_id, timestamp, event_type)` is enforced at the database level.
- The backend uses `INSERT OR IGNORE` so duplicates are silently skipped without throwing errors.
- Batch ingestion endpoints deduplicate in-memory before hitting the DB as an additional layer.

### 3. How Out-of-Order Timestamps Are Handled
- Metrics are **never computed based on insertion order**. All queries `ORDER BY timestamp ASC` before calculating time gaps.
- Events arriving late are inserted with their original `timestamp` value, not `created_at`, ensuring they slot correctly into the timeline on the next metric computation.

### 4. How Model Versioning Would Be Added
- Add a `model_version` field to the `events` table (e.g. `"cv-model-v1.2"`).
- Each event ingested carries the version of the CV model that produced it.
- Metrics can then be filtered or compared by model version to evaluate accuracy changes over time.

### 5. How Model Drift Would Be Detected
- Track average `confidence` scores per model version over time.
- A significant drop in average confidence, or a spike in `absent` events not correlated with known absences, signals potential drift.
- Set up automated alerts when rolling average confidence drops below a defined threshold (e.g. `< 0.70`).

### 6. How Retraining Would Be Triggered
- Drift detection (above) logs anomalies to a monitoring table.
- A scheduled job checks this table and triggers a retraining pipeline (e.g. via a webhook to an ML platform) when anomaly count exceeds a threshold within a rolling window.
- Post-retraining, the new model version is deployed and its `model_version` tag appears in new events automatically.

### 7. How This Scales (5 → 100+ Cameras → Multi-Site)

| Scale             | Strategy                                                                 |
|-------------------|--------------------------------------------------------------------------|
| 5 cameras         | Current setup — single Express server + SQLite is sufficient             |
| 100+ cameras      | Replace SQLite with PostgreSQL, add a message queue (Redis / RabbitMQ) in front of the ingest endpoint to handle burst traffic |
| Multi-site        | Deploy one backend instance per site, aggregate to a central dashboard via a separate read-only reporting API |

---

## Running Locally with Docker

```bash
# 1. Clone the repository
git clone https://github.com/your-username/factoryiq.git
cd factoryiq

# 2. Start all services
docker-compose up --build

# 3. Seed the database with dummy data
curl -X POST http://localhost:3000/api/seed/refresh

# 4. Open the dashboard
# Visit http://localhost:5173 in your browser
```

### docker-compose.yml Overview
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    volumes:
      - ./backend/data:/app/data   # Persists SQLite file

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
DB_PATH=./data/factoryiq.db
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## Getting Started (Without Docker)

```bash
# Backend
cd backend
npm install
npm run migrate   # Run DB migrations
npm run seed      # Seed dummy data
npm run dev       # Start Express on port 3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev       # Start React on port 5173
```