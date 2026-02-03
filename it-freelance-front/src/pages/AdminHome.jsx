export default function AdminHome() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  return (
    <div className="home-page">
      <div className="home-shell">
        <header className="home-top">
          <div className="home-brand">
            <div>
              <h1 className="home-title">Admin dashboard</h1>
              <p className="home-subtitle">
                Dobrodošla{user?.name ? `, ${user.name}` : ""}. Upravljaj kategorijama i prati metrike.
              </p>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-left">
            <h2 className="hero-heading">Kontrola sistema i pregled metrike.</h2>
            <p className="hero-text">
              Upravljaj kategorijama, prati broj projekata/ponuda/review-ova i prepoznaj najaktivnije korisnike.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" type="button">
                Pregled metrike
              </button>
            </div>
          </div>

          <div className="hero-right">
            <img className="hero-img" src="/images/admin.png" alt="Admin" />
          </div>
        </section>
      </div>
    </div>
  );
}
