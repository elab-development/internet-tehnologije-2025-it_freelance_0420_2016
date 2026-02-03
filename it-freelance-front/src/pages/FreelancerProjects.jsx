import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiEye,
  FiX,
  FiSend,
  FiTrash2,
  FiRefreshCcw,
} from "react-icons/fi";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

/**
 * Pokušavamo da izvučemo listu iz više mogućih backend formata.
 * Početnički: neka radi i kad backend vrati data.data.offers, ili data.data, ili data.
 */
function normalizeList(res) {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;

  if (Array.isArray(d?.data)) return d.data;

  if (Array.isArray(d?.data?.projects)) return d.data.projects;
  if (Array.isArray(d?.data?.offers)) return d.data.offers;
  if (Array.isArray(d?.data?.reviews)) return d.data.reviews;

  if (Array.isArray(d?.projects)) return d.projects;
  if (Array.isArray(d?.offers)) return d.offers;
  if (Array.isArray(d?.reviews)) return d.reviews;

  return [];
}

/** "YYYY-MM-DD HH:mm:ss" */
function nowMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

export default function FreelancerProjects() {
  const token = sessionStorage.getItem("token");
  const userFromStorage = JSON.parse(sessionStorage.getItem("user") || "null");
  const role = userFromStorage?.role || null;

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, [token]);

  // ====== AUTH ME ======
  const [me, setMe] = useState(null);

  // ====== PROJECTS LIST ======
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====== DETAILS ======
  const [selectedId, setSelectedId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);

  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);

  // ====== OFFER FORM ======
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("pending");
  const [offerMsg, setOfferMsg] = useState("");
  const [savingOffer, setSavingOffer] = useState(false);

  // =========================
  // BACKEND CALLS
  // =========================

  const loadMe = async () => {
    // GET /auth/me (protected)
    const res = await api.get("/auth/me");
    const u =
      res?.data?.data?.user ||
      res?.data?.data ||
      res?.data?.user ||
      null;
    setMe(u);
    return u;
  };

  const loadProjects = async () => {
    // GET /projects (public)
    const res = await api.get("/projects");
    setProjects(normalizeList(res));
  };

  const loadProjectDetails = async (id) => {
    // GET /projects/{project} (public)
    const res = await api.get(`/projects/${id}`);
    return res?.data?.data?.project || res?.data?.data || res?.data || null;
  };

  const loadOffers = async (id) => {
    // GET /projects/{project}/offers (public)
    const res = await api.get(`/projects/${id}/offers`);
    const list = normalizeList(res);
    setOffers(list);
    return list;
  };

  const loadReviews = async (id) => {
    // GET /projects/{project}/reviews (public)
    const res = await api.get(`/projects/${id}/reviews`);
    const list = normalizeList(res);
    setReviews(list);
    return list;
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      if (!token) {
        setError("Nisi ulogovana. Uloguj se kao freelancer.");
        setLoading(false);
        return;
      }
      if (role !== "freelancer") {
        setError("Ova stranica je samo za freelancer ulogu.");
        setLoading(false);
        return;
      }

      await loadMe();
      await loadProjects();
    } catch (e) {
      setError("Ne mogu da učitam podatke. Proveri backend i token.");
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (id) => {
    setSelectedId(id);
    setDetailsLoading(true);
    setDetailsError("");
    setProjectDetails(null);
    setOffers([]);
    setReviews([]);
    setOfferMsg("");

    // reset offer form (posle ćemo popuniti ako postoji moja ponuda)
    setPrice("");
    setComment("");
    setStatus("pending");

    try {
      const p = await loadProjectDetails(id);
      setProjectDetails(p);

      const oList = await loadOffers(id);
      await loadReviews(id);

      // Ako već imam ponudu za projekat, popuni formu.
      if (me?.id) {
        const mine =
          oList.find((o) => o?.freelancer?.id === me.id) ||
          oList.find((o) => o?.freelancer_id === me.id) ||
          null;

        if (mine) {
          setPrice(mine?.price != null ? String(mine.price) : "");
          setComment(mine?.comment || "");
          setStatus(mine?.status || "pending");
        }
      }
    } catch (e) {
      setDetailsError("Ne mogu da učitam detalje/offers/reviews. Proveri backend rute.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeProject = () => {
    setSelectedId(null);
    setProjectDetails(null);
    setOffers([]);
    setReviews([]);
    setOfferMsg("");
    setPrice("");
    setComment("");
    setStatus("pending");
  };

  // =========================
  // MY OFFER (computed)
  // =========================

  const myOffer = useMemo(() => {
    if (!me?.id) return null;

    return (
      offers.find((o) => o?.freelancer?.id === me.id) ||
      offers.find((o) => o?.freelancer_id === me.id) ||
      null
    );
  }, [offers, me]);

  // =========================
  // OFFER CRUD
  // =========================

  const submitOffer = async () => {
    setOfferMsg("");

    if (!token) return setOfferMsg("Moraš biti ulogovana.");
    if (role !== "freelancer") return setOfferMsg("Samo freelancer može da šalje ponude.");
    if (!selectedId) return setOfferMsg("Izaberi projekat prvo.");

    if (price === "" || Number.isNaN(Number(price))) {
      return setOfferMsg("Price je obavezan i mora biti broj.");
    }

    setSavingOffer(true);

    try {
      const payload = {
        price: Number(price),
        comment: comment?.trim() ? comment.trim() : null,
        status: status?.trim() ? status.trim() : null,
        date_and_time: nowMysql(),
      };

      // Ako postoji moja ponuda -> update, inače create
      if (myOffer?.id) {
        // PUT /offers/{offer}
        await api.put(`/offers/${myOffer.id}`, payload);
        setOfferMsg("Ponuda je ažurirana.");
      } else {
        // POST /projects/{project}/offers
        await api.post(`/projects/${selectedId}/offers`, payload);
        setOfferMsg("Ponuda je poslata.");
      }

      // refresh offers
      const oList = await loadOffers(selectedId);

      // ponovo popuni formu iz moje ponude (ako postoji)
      if (me?.id) {
        const mine =
          oList.find((o) => o?.freelancer?.id === me.id) ||
          oList.find((o) => o?.freelancer_id === me.id) ||
          null;

        if (mine) {
          setPrice(mine?.price != null ? String(mine.price) : "");
          setComment(mine?.comment || "");
          setStatus(mine?.status || "pending");
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "Greška pri slanju ponude.";
      const errs = e?.response?.data?.errors;

      if (errs) {
        const flat = Object.entries(errs)
          .map(([k, arr]) => `${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`)
          .join(" | ");
        setOfferMsg(`${msg} ${flat}`);
      } else {
        setOfferMsg(msg);
      }
    } finally {
      setSavingOffer(false);
    }
  };

  const deleteMyOffer = async () => {
    setOfferMsg("");

    if (!token) return setOfferMsg("Moraš biti ulogovana.");
    if (role !== "freelancer") return setOfferMsg("Samo freelancer može da briše ponude.");
    if (!myOffer?.id) return setOfferMsg("Nemaš ponudu za brisanje.");

    if (!window.confirm("Da li sigurno želiš da obrišeš svoju ponudu?")) return;

    setSavingOffer(true);

    try {
      // DELETE /offers/{offer}
      await api.delete(`/offers/${myOffer.id}`);
      setOfferMsg("Ponuda je obrisana.");

      await loadOffers(selectedId);

      // reset form
      setPrice("");
      setComment("");
      setStatus("pending");
    } catch (e) {
      setOfferMsg("Greška pri brisanju ponude.");
    } finally {
      setSavingOffer(false);
    }
  };

  // =========================
  // UI FILTER
  // =========================

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      const n = (p?.name || "").toLowerCase();
      const d = (p?.description || "").toLowerCase();
      const c = (p?.category?.name || "").toLowerCase();
      return n.includes(q) || d.includes(q) || c.includes(q);
    });
  }, [projects, query]);

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // RENDER
  // =========================

  return (
    <div className="home-page">
      <div className="home-shell">
        <div className="auth-card" style={{ maxWidth: 1100 }}>
          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>Freelancer Projects</h2>
              <p style={{ marginTop: 6, color: "var(--muted)" }}>
                Izaberi projekat i pošalji ponudu (Offer).
              </p>
            </div>
          </div>

          {error ? <div className="alert" style={{ marginTop: 12 }}>{error}</div> : null}

          {/* SEARCH */}
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

          {/* CONTENT GRID */}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 0.95fr", gap: 12 }}>
            {/* LEFT: PROJECT LIST */}
            <div>
              {loading ? (
                <p style={{ color: "var(--muted)" }}>Učitavam projekte...</p>
              ) : filtered.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>Nema projekata za prikaz.</p>
              ) : (
                <div className="cards" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                  {filtered.map((p) => (
                    <div key={p.id} className="card">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <h3 className="card-title" style={{ margin: 0 }}>
                          {p?.name || "Untitled project"}
                        </h3>

                        {p?.status ? (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 900,
                              color: "var(--blue-1)",
                              background: "rgba(79, 180, 255, 0.10)",
                              border: "1px solid rgba(26, 111, 214, 0.14)",
                              padding: "6px 10px",
                              borderRadius: 999,
                              height: "fit-content",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.status}
                          </span>
                        ) : null}
                      </div>

                      <p className="card-text" style={{ marginTop: 8 }}>
                        {p?.description || "Nema opisa."}
                      </p>

                      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="btn-ghost" type="button" onClick={() => openProject(p.id)}>
                          <FiEye /> Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: DETAILS */}
            <div>
              <div className="card" style={{ height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <h3 className="card-title" style={{ margin: 0 }}>Project details</h3>

                  {selectedId ? (
                    <button className="btn-ghost" type="button" onClick={closeProject}>
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
                    {/* PROJECT SUMMARY */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 900 }}>{projectDetails?.name}</div>
                      <div className="card-text" style={{ marginTop: 6 }}>
                        {projectDetails?.description || "Nema opisa."}
                      </div>
                    </div>

                    {/* ===================== OFFER FORM (FREELANCER) ===================== */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>
                          {myOffer?.id ? "My offer (edit)" : "Create offer"}
                        </div>

                        {myOffer?.id ? (
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 900,
                              color: "var(--blue-1)",
                              background: "rgba(26, 111, 214, 0.10)",
                              border: "1px solid rgba(26, 111, 214, 0.18)",
                              padding: "6px 10px",
                              borderRadius: 999,
                            }}
                          >
                            Offer #{myOffer.id}
                          </span>
                        ) : null}
                      </div>

                      {offerMsg ? <div className="alert" style={{ marginTop: 10 }}>{offerMsg}</div> : null}

                      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        <div className="input-wrap">
                          <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price (npr. 500)"
                            disabled={!token || role !== "freelancer" || savingOffer}
                          />
                        </div>

                        <div className="input-wrap">
                          <input
                            className="input"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Comment (opciono)"
                            disabled={!token || role !== "freelancer" || savingOffer}
                          />
                        </div>

                        <div className="input-wrap">
                          <select
                            className="input select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={!token || role !== "freelancer" || savingOffer}
                          >
                            <option value="pending">pending</option>
                            <option value="sent">sent</option>
                            <option value="accepted">accepted</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button
                            className="btn-ghost"
                            type="button"
                            onClick={submitOffer}
                            disabled={!token || role !== "freelancer" || savingOffer}
                          >
                            <FiSend /> {savingOffer ? "Saving..." : myOffer?.id ? "Update offer" : "Send offer"}
                          </button>

                          {myOffer?.id ? (
                            <button
                              className="btn-ghost"
                              type="button"
                              onClick={deleteMyOffer}
                              disabled={!token || role !== "freelancer" || savingOffer}
                            >
                              <FiTrash2 /> Delete offer
                            </button>
                          ) : null}
                        </div>

                        {!token ? (
                          <p className="card-text">Moraš biti ulogovana da bi slala ponude.</p>
                        ) : role !== "freelancer" ? (
                          <p className="card-text">Samo freelancer može da šalje ponude.</p>
                        ) : null}
                      </div>
                    </div>
                    {/* =================== END OFFER FORM (FREELANCER) =================== */}

                    {/* OFFERS LIST */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>Offers</div>

                      {offers.length === 0 ? (
                        <div className="card-text">Nema ponuda.</div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {offers.slice(0, 6).map((o) => (
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

                              {o?.freelancer?.name ? (
                                <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                                  By: {o.freelancer.name}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* REVIEWS LIST */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 900, marginBottom: 6 }}>Reviews</div>

                      {reviews.length === 0 ? (
                        <div className="card-text">Nema review-a.</div>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {reviews.slice(0, 6).map((r) => (
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
