const CARDS = [
  { key: "total", label: "Total visits" },
  { key: "scheduled", label: "Scheduled" },
  { key: "in_progress", label: "In progress" },
  { key: "urgent_or_emergency", label: "Urgent / ER" },
];

export default function KpiCards({ stats, loading }) {
  return (
    <section className="kpis" aria-label="Clinic KPIs">
      {CARDS.map((card) => (
        <article key={card.key} className="kpi">
          <p>{card.label}</p>
          <strong>{loading || !stats ? "—" : stats[card.key]}</strong>
        </article>
      ))}
    </section>
  );
}
