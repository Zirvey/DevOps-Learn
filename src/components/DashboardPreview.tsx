/** CSS fallback when hero video is not available — Basedash-style metric cards */
export function DashboardPreview() {
  return (
    <div className="dashboard-preview" aria-hidden="true">
      <div className="dashboard-preview-frame">
        <div className="dashboard-preview-card">
          <span className="dashboard-preview-label">Пройдено глав</span>
          <span className="dashboard-preview-value">50</span>
          <span className="dashboard-preview-delta">+12% за неделю</span>
          <div className="dashboard-preview-chart dashboard-preview-chart--lavender">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
        <div className="dashboard-preview-card">
          <span className="dashboard-preview-label">Модулей</span>
          <span className="dashboard-preview-value">15</span>
          <span className="dashboard-preview-delta dashboard-preview-delta--mint">
            DevOps + IT
          </span>
          <div className="dashboard-preview-chart dashboard-preview-chart--mint">
            <span /><span /><span /><span /><span /><span />
          </div>
        </div>
        <div className="dashboard-preview-card dashboard-preview-card--wide">
          <span className="dashboard-preview-label">Прогресс курса</span>
          <div className="dashboard-preview-bars">
            {[72, 45, 88, 34, 60, 91, 55].map((h, i) => (
              <span
                key={i}
                className="dashboard-preview-bar"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
