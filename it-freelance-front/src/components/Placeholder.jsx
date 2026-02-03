export default function Placeholder({ title, text }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p style={{ marginTop: 8, color: "var(--muted)" }}>
          {text || "Ovu stranicu ćemo implementirati kasnije."}
        </p>
      </div>
    </div>
  );
}
