export default function FreelancerHome() {
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  return (
    <div className="home-page">
      <div className="home-shell">
        <header className="home-top">
          <div className="home-brand">
            <div>
              <h1 className="home-title">Freelancer dashboard</h1>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="hero-left">
            <h2 className="hero-heading">Pronađi projekte i pošalji ponudu.</h2>
            <p className="hero-text">
              Pregledaj najnovije projekte, odaberi one koji ti odgovaraju i pošalji jasnu ponudu sa cenom i porukom.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" type="button">
                Pregledaj projekte
              </button>
            </div>
          </div>

          <div className="hero-right">
            <img className="hero-img" src="/images/freelancer.png" alt="Freelancer" />
          </div>
        </section>
      </div>
    </div>
  );
}
