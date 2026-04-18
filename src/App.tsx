import { useState } from 'react'
import './index.css'
import Topbar from './components/Topbar'
import SummaryCards from './components/SummaryCards'
import WorkersTable from './components/WorkersTable'
import WorkstationsTable from './components/WorkstationsTable'
import DetailModal from './components/DetailModal'
import { useMetrics } from './hooks/useMetrics'
import type { FactoryWorker, Workstation } from './types'

function App() {
  const { factoryMetrics, workers, workstations, loading, error } = useMetrics()
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: 'worker' | 'station' | null
    data: FactoryWorker | Workstation | null
  }>({
    isOpen: false,
    type: null,
    data: null,
  })

  const handleWorkerClick = (worker: FactoryWorker) => {
    setModalState({
      isOpen: true,
      type: 'worker',
      data: worker,
    })
  }

  const handleStationClick = (station: Workstation) => {
    setModalState({
      isOpen: true,
      type: 'station',
      data: station,
    })
  }

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: null,
    })
  }

  if (loading) {
    return (
      <>
        <Topbar />
        <div className="main-wrap">
          <div className="empty-state">
            <i className="bi bi-hourglass-split"></i>
            <p>Loading metrics...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Topbar />
        <div className="main-wrap">
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle"></i>
            <p>Error: {error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar />

      <div className="main-wrap">
        <div className="section-header mb-3">
          <span className="section-label">Factory Overview</span>
          <div className="section-line"></div>
          <span className="section-label" id="shift-label">Shift A</span>
        </div>

        <SummaryCards factoryMetrics={factoryMetrics} />

        <WorkersTable
          workers={workers}
          onWorkerClick={handleWorkerClick}
        />

        <WorkstationsTable
          workstations={workstations}
          onStationClick={handleStationClick}
        />
      </div>

      <DetailModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        data={modalState.data}
        type={modalState.type}
      />
    </>
  )
}

export default App
