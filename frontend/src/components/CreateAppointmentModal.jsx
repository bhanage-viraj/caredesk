import { useState } from "react";

const initial = {
  patient_name: "",
  doctor_name: "",
  reason: "",
  priority: "routine",
  status: "scheduled",
  scheduled_at: "",
};

export default function CreateAppointmentModal({ onClose, onSubmit, saving }) {
  const [form, setForm] = useState(initial);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="create-title">Schedule appointment</h2>
          <button type="button" className="btn ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Patient name
            <input
              required
              value={form.patient_name}
              onChange={(e) => update("patient_name", e.target.value)}
            />
          </label>
          <label>
            Doctor
            <input
              required
              value={form.doctor_name}
              onChange={(e) => update("doctor_name", e.target.value)}
            />
          </label>
          <label className="full">
            Reason
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
            />
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(e) => update("priority", e.target.value)}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </label>
          <label>
            Scheduled at
            <input
              required
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => update("scheduled_at", e.target.value)}
            />
          </label>
          <div className="modal-actions full">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
