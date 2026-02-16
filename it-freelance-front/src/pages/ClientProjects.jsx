import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiSearch, FiEye, FiX, FiSend } from "react-icons/fi";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

function normalizeList(res) {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.projects)) return d.data.projects;
  if (Array.isArray(d?.projects)) return d.projects;
  if (Array.isArray(d?.data?.offers)) return d.data.offers;
  if (Array.isArray(d?.data?.reviews)) return d.data.reviews;
  return [];
}

// "YYYY-MM-DD HH:MM:SS" (MySQL friendly)
function nowMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export default function ClientProjects() {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const role = user?.role || null;

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, [token]);

  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Details state
  const [selectedId, setSelectedId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Review form
  const [freelancerId, setFreelancerId] = useState("");
  const [grade, setGrade] = useState(5);
  const [comment, setComment] = useState("");
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  // Izvuci freelancere iz offers (bez duplikata).
  const freelancerOptions = useMemo(() => {
    const map = new Map();

    offers.forEach((o) => {
      const id = o?.freelancer?.id ?? o?.freelancer_id ?? null;
      const name = o?.freelancer?.name ?? (id ? `Freelancer #${id}` : null);

      if (id && !map.has(id)) {
        map.set(id, { id, name });
      }
    });

    return Array.from(map.values());
  }, [offers]);

  const loadProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/projects");
      setProjects(normalizeList(res));
    } catch (e) {
      setError("Ne mogu da učitam projekte (GET /projects). Proveri backend i rutu.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectBundle = async (id) => {
    setSelectedId(id);
    setDetailsLoading(true);
    setDetailsError("");
    setProjectDetails(null);
    setOffers([]);
    setReviews([]);
    setReviewMsg("");

    // reset forme kad se promeni projekat
    setFreelancerId("");
    setGrade(5);
    setComment("");

    try {
      const pRes = await api.get(`/projects/${id}`);
      const p = pRes?.data?.data?.project || pRes?.data?.data || pRes?.data || null;
      setProjectDetails(p);

      const oRes = await api.get(`/projects/${id}/offers`);
      setOffers(normalizeList(oRes));

      const rRes = await api.get(`/projects/${id}/reviews`);
      setReviews(normalizeList(rRes));
    } catch (e) {
      setDetailsError("Ne mogu da učitam detalje projekta/offers/reviews. Proveri backend rute.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const submitReview = async () => {
    setReviewMsg("");

    if (!token) {
      setReviewMsg("Moraš biti ulogovana da bi ostavila review.");
      return;
    }
    if (role !== "client") {
      setReviewMsg("Samo client može da ostavi review.");
      return;
    }
    if (!selectedId) return;

    if (!freelancerId) {
      setReviewMsg("Moraš da izabereš freelancera (iz ponuda) pre slanja review-a.");
      return;
    }

    setSendingReview(true);
    try {
      await api.post(`/projects/${selectedId}/reviews`, {
        grade: Number(grade),
        comment: comment || null,
        freelancer_id: Number(freelancerId),
        date_and_time: nowMysql(),
      });

      setComment("");
      setGrade(5);
      setFreelancerId("");
      setReviewMsg("Review uspešno dodat.");

      const rRes = await api.get(`/projects/${selectedId}/reviews`);
      setReviews(normalizeList(rRes));
    } catch (e) {
      const msg = e?.response?.data?.message;
      const errs = e?.response?.data?.errors;

      if (errs) {
        const flat = Object.entries(errs)
          .map(([k, arr]) => `${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`)
          .join(" | ");
        setReviewMsg(`${msg || "Greška validacije."} ${flat}`);
      } else {
        setReviewMsg(msg || "Neuspešno dodavanje review-a. Proveri validaciju ili permissions.");
      }
    } finally {
      setSendingReview(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      const n = (p?.name || "").toLowerCase();
      const d = (p?.description || "").toLowerCase();
      const c = (p?.category?.name || p?.category_name || "").toLowerCase();
      return n.includes(q) || d.includes(q) || c.includes(q);
    });
  }, [projects, query]);

  const pillBase = {
    fontSize: 12,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    height: "fit-content",
    whiteSpace: "nowrap",
  };

  return (
    <div className="home-page">
      <div className="home-shell">
        <div className="auth-card" style={{ maxWidth: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>Projects</h2>
            </div>
          </div>

          {error ? <div className="alert" style={{ marginTop: 12 }}>{error}</div> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <div className="input-wrap" style={{ minWidth: 260, flex: 1 }}>
              <FiSearch className="input-icon" />
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pretraga (naziv, opis, kategorija)"
              />
            </div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 0.9fr", gap: 12 }}>
            {/* LISTA */}
            <div>
              {loading ? (
                <p style={{ color: "var(--muted)" }}>Učitavam projekte...</p>
              ) : filtered.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>Nema projekata za prikaz.</p>
              ) : (
                <div className="cards" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                  {filtered.map((p) => {
                    const catName = p?.category?.name || p?.category_name || null;

                    return (
                      <div key={p.id} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <h3 className="card-title" style={{ marginRight: 8, marginBottom: 0 }}>
                            {p?.name || "Untitled project"}
                          </h3>

                          {p?.status ? (
                            <span
                              style={{
                                ...pillBase,
                                color: "var(--blue-1)",
                                background: "rgba(79, 180, 255, 0.10)",
                                border: "1px solid rgba(26, 111, 214, 0.14)",
                              }}
                            >
                              {p.status}
                            </span>
                          ) : null}
                        </div>

                        {/* KATEGORIJA (u kartici) */}
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              ...pillBase,
                              color: "rgba(15,27,45,0.85)",
                              background: "rgba(15,27,45,0.06)",
                              border: "1px solid rgba(15,27,45,0.10)",
                            }}
                          >
                            {catName || "No category"}
                          </span>
                        </div>

                        <p className="card-text" style={{ marginTop: 8 }}>
                          {p?.description ? p.description : "Nema opisa."}
                        </p>

                        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button className="btn-ghost" type="button" onClick={() => loadProjectBundle(p.id)}>
                            <FiEye /> Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div>
              <div className="card" style={{ height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Project details</h3>
                  {selectedId ? (
                    <button className="btn-ghost" type="button" onClick={() => setSelectedId(null)}>
                      <FiX /> Close
                    </button>
                  ) : null}
                </div>

                {!selectedId ? (
                  <p className="card-text" style={{ marginTop: 10 }}>
                    Izaberi projekat sa leve strane.
                  </p>
                ) : detailsLoading ? (
                  <p className="card-text" style={{ marginTop: 10 }}>
                    Učitavam detalje + offers + reviews...
                  </p>
                ) : detailsError ? (
                  <div className="alert" style={{ marginTop: 12 }}>{detailsError}</div>
                ) : (
                  <>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 900 }}>{projectDetails?.name}</div>

                      {/* KATEGORIJA i STATUS i u details (opciono, ali korisno). */}
                      <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            ...pillBase,
                            color: "rgba(15,27,45,0.85)",
                            background: "rgba(15,27,45,0.06)",
                            border: "1px solid rgba(15,27,45,0.10)",
                          }}
                        >
                          {projectDetails?.category?.name || projectDetails?.category_name || "No category"}
                        </span>

                        {projectDetails?.status ? (
                          <span
                            style={{
                              ...pillBase,
                              color: "var(--blue-1)",
                              background: "rgba(79, 180, 255, 0.10)",
                              border: "1px solid rgba(26, 111, 214, 0.14)",
                            }}
                          >
                            {projectDetails.status}
                          </span>
                        ) : null}
                      </div>

                      <div className="card-text" style={{ marginTop: 6 }}>
                        {projectDetails?.description || "Nema opisa."}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>Offers</div>
                      {offers.length === 0 ? (
                        <div className="card-text">Nema ponuda.</div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {offers.slice(0, 5).map((o) => (
                            <div
                              key={o.id}
                              style={{
                                border: "1px solid rgba(15,27,45,0.10)",
                                borderRadius: 14,
                                padding: "10px 12px",
                                background: "rgba(255,255,255,0.85)",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <span style={{ fontWeight: 900 }}>Price: {o.price}</span>
                                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                                  {o.status || "—"}
                                </span>
                              </div>
                              <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
                                {o.comment || "Bez komentara."}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>Reviews</div>
                      {reviews.length === 0 ? (
                        <div className="card-text">Nema review-a.</div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {reviews.slice(0, 5).map((r) => (
                            <div
                              key={r.id}
                              style={{
                                border: "1px solid rgba(15,27,45,0.10)",
                                borderRadius: 14,
                                padding: "10px 12px",
                                background: "rgba(255,255,255,0.85)",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <span style={{ fontWeight: 900 }}>Grade: {r.grade}</span>
                                <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                                  {r.date_and_time || "—"}
                                </span>
                              </div>
                              <div style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
                                {r.comment || "Bez komentara."}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ADD REVIEW */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>Add review</div>

                      {reviewMsg ? (
                        <div className="alert" style={{ marginBottom: 10 }}>{reviewMsg}</div>
                      ) : null}

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div className="input-wrap" style={{ minWidth: 240 }}>
                          <select
                            className="input select"
                            value={freelancerId}
                            onChange={(e) => setFreelancerId(e.target.value)}
                            disabled={!token || role !== "client" || sendingReview}
                          >
                            <option value="">Izaberi freelancera *</option>
                            {freelancerOptions.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="input-wrap" style={{ minWidth: 160 }}>
                          <select
                            className="input select"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            disabled={!token || role !== "client" || sendingReview}
                          >
                            {[5, 4, 3, 2, 1].map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="input-wrap" style={{ flex: 1, minWidth: 220 }}>
                          <input
                            className="input"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Komentar (opciono)"
                            disabled={!token || role !== "client" || sendingReview}
                          />
                        </div>

                        <button
                          className="btn-ghost"
                          type="button"
                          onClick={submitReview}
                          disabled={!token || role !== "client" || sendingReview}
                        >
                          <FiSend /> {sendingReview ? "Slanje..." : "Pošalji"}
                        </button>
                      </div>

                      {!token ? (
                        <p className="card-text" style={{ marginTop: 8 }}>
                          Moraš biti ulogovana da bi dodala review.
                        </p>
                      ) : role !== "client" ? (
                        <p className="card-text" style={{ marginTop: 8 }}>
                          Samo korisnik sa ulogom <b>client</b> može da dodaje review.
                        </p>
                      ) : freelancerOptions.length === 0 ? (
                        <p className="card-text" style={{ marginTop: 8 }}>
                          Nema ponuda na projektu, pa nema ni freelancera za izbor.
                        </p>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
