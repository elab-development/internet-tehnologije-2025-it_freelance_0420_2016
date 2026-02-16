import useRandomQuotes from "../hooks/useRandomQuotes";

const people = [
  { id: 1, name: "Manson Ratch", img: "/images/client1.jpg" },
  { id: 2, name: "Qeen Eastwood", img: "/images/client2.jpg" },
  { id: 3, name: "Parri Sujana", img: "/images/client3.jpg" },
];

export default function HomeSuccessStory() {
  const { quotes, loading, error, reload } = useRandomQuotes(3);

  return (
    <section style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Success stories.</h2>
          <p style={{ marginTop: 6, color: "var(--muted)" }}>
            Random inspirativni citati (DummyJSON) uz naše klijente.
          </p>
        </div>

        <button className="btn-ghost" type="button" onClick={reload} disabled={loading}>
          {loading ? "Učitavam..." : "Novi citati"}
        </button>
      </div>

      {error ? (
        <div className="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}

      <div
        className="cards"
        style={{
          marginTop: 12,
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        {people.map((p, idx) => {
          const q = quotes[idx];

          return (
            <div key={p.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={p.img}
                  alt={p.name}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 16,
                    objectFit: "cover",
                    border: "1px solid rgba(15,27,45,0.10)",
                    background: "rgba(255,255,255,0.7)",
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                    Verified story.
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(15,27,45,0.08)",
                  background: "rgba(255,255,255,0.85)",
                  borderRadius: 14,
                  padding: "10px 12px",
                }}
              >
                {loading ? (
                  <div style={{ color: "var(--muted)" }}>Učitavam quote...</div>
                ) : q?.quote ? (
                  <>
                    <div style={{ fontWeight: 900 }}>&ldquo;{q.quote}&rdquo;</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                      — {q.author || "Unknown"}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--muted)" }}>
                    Nema quote-a za prikaz. Klikni “Novi citati”.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive fallback bez dodatnog CSS-a. */}
      <style>{`
        @media (max-width: 980px) {
          .cards[style*="repeat(3, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .cards[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
