import { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
import KpiCards from "./components/KpiCards";
import Sidebar from "./components/Sidebar";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "checked_in", label: "Checked in" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatWhen(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadData(filter = statusFilter) {
    setLoading(true);
    setError("");
    try {
      const params = filter === "all" ? {} : { status: filter };
      const [list, nextStats] = await Promise.all([api.list(params), api.stats()]);
      setAppointments(list);
      setStats(nextStats);
    } catch (err) {
      setError(err.message || "Backend unavailable");
      setAppointments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData("all");
  }, []);

  const activity = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5),
    [appointments]
  );

  async function handleCreate(payload) {
    setSaving(true);
    try {
      await api.create(payload);
      setModalOpen(false);
      await loadData(statusFilter);
    } catch (err) {
      setError(err.message || "Could not create appointment");
    } finally {
      setSaving(false);
    }
  }

  async function advanceStatus(item) {
    const sequence = ["scheduled", "checked_in", "in_progress", "completed"];
    const index = sequence.indexOf(item.status);
    if (index === -1 || index === sequence.length - 1) return;
    try {
      await api.update(item.id, { status: sequence[index + 1] });
      await loadData(statusFilter);
    } catch (err) {
      setError(err.message || "Update failed");
    }
  }

  async function cancelAppointment(id) {
    try {
      await api.update(id, { status: "cancelled" });
      await loadData(statusFilter);
    } catch (err) {
      setError(err.message || "Cancel failed");
    }
  }

  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Today&apos;s clinic floor</p>
            <h1>Appointment board</h1>
          </div>
          <div className="topbar-actions">
            <div className="pipeline" aria-label="Delivery pipeline">
              <span>Git</span>
              <span>CI</span>
              <span>GHCR</span>
              <span>EKS</span>
            </div>
            <button type="button" className="btn primary" onClick={() => setModalOpen(true)}>
              New appointment
            </button>
          </div>
        </header>

        <KpiCards stats={stats} loading={loading} />

        <section className="board">
          <div className="board-header">
            <h2>Visits</h2>
            <div className="filters" role="tablist" aria-label="Status filters">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  className={statusFilter === filter.value ? "chip active" : "chip"}
                  aria-selected={statusFilter === filter.value}
                  onClick={() => {
                    setStatusFilter(filter.value);
                    loadData(filter.value);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {error ? <div className="banner error">{error}</div> : null}
          {loading ? <div className="banner">Loading appointments…</div> : null}

          {!loading && !error && appointments.length === 0 ? (
            <div className="empty">No appointments match this filter.</div>
          ) : null}

          {!loading && appointments.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Reason</th>
                    <th>When</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.patient_name}</strong>
                      </td>
                      <td>{item.doctor_name}</td>
                      <td>{item.reason}</td>
                      <td>{formatWhen(item.scheduled_at)}</td>
                      <td>
                        <span className={`badge priority-${item.priority}`}>{item.priority}</span>
                      </td>
                      <td>
                        <span className={`badge status-${item.status}`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="row-actions">
                        <button type="button" className="btn ghost" onClick={() => advanceStatus(item)}>
                          Advance
                        </button>
                        <button
                          type="button"
                          className="btn ghost danger"
                          onClick={() => cancelAppointment(item.id)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="activity">
          <h2>Recent activity</h2>
          <ul>
            {activity.map((item) => (
              <li key={`activity-${item.id}`}>
                <span className={`dot priority-${item.priority}`} />
                <div>
                  <strong>{item.patient_name}</strong> with {item.doctor_name}
                  <p>
                    {item.status.replace("_", " ")} · {formatWhen(item.updated_at)}
                  </p>
                </div>
              </li>
            ))}
            {!activity.length ? <li className="muted">No recent updates yet.</li> : null}
          </ul>
        </section>
      </main>

      {modalOpen ? (
        <CreateAppointmentModal
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
        />
      ) : null}
    </div>
  );
}
