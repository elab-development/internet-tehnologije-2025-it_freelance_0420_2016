export default function ClientHome() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  return (
    <div className="home-page">
      <div className="home-shell">
        <header className="home-top">
          <div className="home-brand">
            <div>
              <h1 className="home-title">Client dashboard</h1>
              <p className="home-subtitle">
                Dobrodošla{user?.name ? `, ${user.name}` : ""}. Kreiraj projekat, pregledaj ponude i ostavi review.
              </p>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-left">
            <h2 className="hero-heading">Objavi projekat i pronađi freelancera.</h2>
            <p className="hero-text">
              Dodaj projekat sa opisom, budžetom i kategorijom. Pregledaj ponude i izaberi najbolju.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" type="button">
                Kreiraj projekat
              </button>
            </div>
          </div>

          <div className="hero-right">
            <img className="hero-img" src="/images/client.png" alt="Client" />
          </div>
        </section>
      </div>
    </div>
  );
}
