import { useEffect, useState } from 'react';

export default function Topbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-icon">
          <i className="bi bi-camera-video-fill"></i>
        </div>
        <div className="brand-name">
          Factory<span>IQ</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="live-badge">
          <div className="live-dot"></div>
          LIVE
        </div>
        <div className="topbar-time">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
}
