const NAV = [
  { id: "board", label: "Board", active: true },
  { id: "doctors", label: "Doctors" },
  { id: "rooms", label: "Rooms" },
  { id: "reports", label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <div>
          <p className="brand-name">CareDesk</p>
          <p className="brand-sub">Clinic operations</p>
        </div>
      </div>

      <p className="nav-label">Workspace</p>
      <nav>
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.active ? "nav-item active" : "nav-item"}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p>DevOps capstone</p>
        <p>FastAPI · EKS · Helm</p>
      </div>
    </aside>
  );
}
