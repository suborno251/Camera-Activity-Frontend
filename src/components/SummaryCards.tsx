import { useEffect } from 'react';

interface FactoryMetrics {
  totalProductiveTime: string;
  totalProductionCount: number;
  avgProductionRate: string;
  avgUtilization: number;
}

interface SummaryCardsProps {
  factoryMetrics: FactoryMetrics;
}

interface Card {
  color: string;
  icon: string;
  value: string;
  label: string;
  sub: string | null;
  bar?: number;
}

export default function SummaryCards({ factoryMetrics }: SummaryCardsProps) {
  const cards: Card[] = [
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

  useEffect(() => {
    const bar = document.getElementById("summary-bar");
    if (bar) {
      setTimeout(() => {
        bar.style.width = bar.dataset.target + "%";
      }, 100);
    }
  }, [factoryMetrics.avgUtilization]);

  return (
    <div className="summary-grid" id="summary-grid">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`stat-card ${card.color}`}
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          <div className="stat-icon">
            <i className={`bi ${card.icon}`}></i>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-label">{card.label}</div>
          {card.sub && <div className="stat-sub">{card.sub}</div>}
          {card.bar !== undefined && (
            <div className="util-bar-wrap">
              <div className="util-bar-track">
                <div
                  className="util-bar-fill"
                  id="summary-bar"
                  data-target={card.bar}
                  style={{ width: '0%', background: 'var(--blue)' }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
