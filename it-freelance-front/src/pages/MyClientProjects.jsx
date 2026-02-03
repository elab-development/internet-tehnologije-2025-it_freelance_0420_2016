import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiEye, FiX, FiTrash2, FiEdit2, FiPlus, FiSave, FiRefreshCcw } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

function normalizeList(res) {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.projects)) return d.data.projects;
  if (Array.isArray(d?.projects)) return d.projects;
  if (Array.isArray(d?.data?.categories)) return d.data.categories;
  if (Array.isArray(d?.categories)) return d.categories;
  if (Array.isArray(d?.data?.offers)) return d.data.offers;
  if (Array.isArray(d?.data?.reviews)) return d.data.reviews;
  return [];
}

export default function MyClientProjects() {
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

  // Auth/me.
  const [me, setMe] = useState(null);

  // Data.
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);

  // Loading/errors.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create/Edit form.
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState("");

  // Details (offers/reviews).
  const [selectedId, setSelectedId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);

  const resetForm = () => {
    setMode("create");
    setEditingId(null);
    setName("");
    setDescription("");
    setBudget("");
    setStatus("");
    setImageUrl("");
    setCategoryId("");
    setFormMsg("");
  };

  const loadMe = async () => {
    const res = await api.get("/auth/me"); // protected.
    const u = res?.data?.data?.user || res?.data?.data || res?.data?.user || null;
    setMe(u);
    return u;
  };

  const loadCategories = async () => {
    const res = await api.get("/categories"); // public.
    setCategories(normalizeList(res));
  };

  const loadMyProjects = async (meUser) => {
    const res = await api.get("/projects"); // public.
    const all = normalizeList(res);

    const myId = meUser?.id;
    const mine = all.filter((p) => {
      const cid1 = p?.client?.id;
      const cid2 = p?.client_id;
      return (cid1 && cid1 === myId) || (cid2 && cid2 === myId);
    });

    setProjects(mine);
  };

  const loadAll = async () => {
    if (!token) {
      setError("Nisi ulogovana. Uloguj se kao client.");
      setLoading(false);
      return;
    }
    if (role !== "client") {
      setError("Ova stranica je samo za client ulogu.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const u = await loadMe();
      await loadCategories();
      await loadMyProjects(u);
    } catch (e) {
      setError("Ne mogu da učitam podatke. Proveri backend, token i rute.");
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

    try {
      const pRes = await api.get(`/projects/${id}`); // public.
      const p = pRes?.data?.data?.project || pRes?.data?.data || pRes?.data || null;
      setProjectDetails(p);

      const oRes = await api.get(`/projects/${id}/offers`); // public.
      setOffers(normalizeList(oRes));

      const rRes = await api.get(`/projects/${id}/reviews`); // public.
      setReviews(normalizeList(rRes));
    } catch (e) {
      setDetailsError("Ne mogu da učitam detalje/offers/reviews. Proveri backend rute.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const startEdit = (p) => {
    setMode("edit");
    setEditingId(p.id);

    setName(p?.name || "");
    setDescription(p?.description || "");
    setBudget(p?.budget != null ? String(p.budget) : "");
    setStatus(p?.status || "");
    setImageUrl(p?.image_url || "");
    setCategoryId(p?.category?.id ? String(p.category.id) : (p?.category_id ? String(p.category_id) : ""));
    setFormMsg("");
  };

  const submit = async () => {
    setFormMsg("");

    if (!token) {
      setFormMsg("Nisi ulogovana.");
      return;
    }
    if (role !== "client") {
      setFormMsg("Samo client može da kreira/menja projekte.");
      return;
    }

    if (!name.trim()) {
      setFormMsg("Naziv je obavezan.");
      return;
    }
    if (!categoryId) {
      setFormMsg("Kategorija je obavezna.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      budget: budget === "" ? null : Number(budget),
      status: status.trim() ? status.trim() : null,
      image_url: imageUrl.trim() ? imageUrl.trim() : null,
      category_id: Number(categoryId),
    };

    setSaving(true);
    try {
      if (mode === "create") {
        await api.post("/projects", payload); // protected.
        setFormMsg("Projekat je kreiran.");
      } else {
        await api.put(`/projects/${editingId}`, payload); // protected.
        setFormMsg("Projekat je ažuriran.");
      }

      // Refresh my projects.
      const u = me || (await loadMe());
      await loadMyProjects(u);

      // Ako smo editovali projekat koji je otvoren u detail panelu, osveži i bundle.
      if (selectedId && (selectedId === editingId || mode === "create")) {
        // create nema smisla, ali ne smeta.
        await loadProjectBundle(selectedId);
      }

      if (mode === "create") resetForm();
      setMode("create");
      setEditingId(null);
    } catch (e) {
      const msg = e?.response?.data?.message;
      const errs = e?.response?.data?.errors;

      if (errs) {
        const flat = Object.entries(errs)
          .map(([k, arr]) => `${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`)
          .join(" | ");
        setFormMsg(`${msg || "Greška validacije."} ${flat}`);
      } else {
        setFormMsg(msg || "Neuspešno čuvanje projekta. Proveri validaciju ili permissions.");
      }
    } finally {
      setSaving(false);
    }
  };

  const removeProject = async (id) => {
    if (!token) return;
    if (role !== "client") return;

    const ok = window.confirm("Da li sigurno želiš da obrišeš projekat?");
    if (!ok) return;

    try {
      await api.delete(`/projects/${id}`); // protected.
      const u = me || (await loadMe());
      await loadMyProjects(u);

      if (selectedId === id) {
        setSelectedId(null);
        setProjectDetails(null);
        setOffers([]);
        setReviews([]);
      }
      if (editingId === id) resetForm();
    } catch (e) {
      alert("Neuspešno brisanje projekta. Proveri permissions ili da li projekat postoji.");
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-page">
      <div className="home-shell">
        <div className="auth-card" style={{ maxWidth: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>My Projects</h2>
              <p style={{ marginTop: 6, color: "var(--muted)" }}>
                Lista projekata koje si ti kreirala kao client, uz jednostavan CRUD.
              </p>
            </div>
          </div>

          {error ? <div className="alert" style={{ marginTop: 12 }}>{error}</div> : null}

          {loading ? (
            <p style={{ color: "var(--muted)", marginTop: 12 }}>Učitavam...</p>
          ) : (
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 0.95fr", gap: 12 }}>
              {/* LEFT: LIST */}
              <div>
                {projects.length === 0 ? (
                  <p style={{ color: "var(--muted)" }}>Još nemaš projekata.</p>
                ) : (
                  <div className="cards" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                    {projects.map((p) => (
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

                        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button className="btn-ghost" type="button" onClick={() => loadProjectBundle(p.id)}>
                            <FiEye /> Details
                          </button>

                          <button className="btn-ghost" type="button" onClick={() => startEdit(p)}>
                            <FiEdit2 /> Edit
                          </button>

                          <button className="btn-ghost" type="button" onClick={() => removeProject(p.id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: FORM + DETAILS */}
              <div>
                {/* FORM */}
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <h3 className="card-title" style={{ margin: 0 }}>
                      {mode === "create" ? "Create project" : `Edit project #${editingId}`}
                    </h3>
                    {mode === "edit" ? (
                      <button className="btn-ghost" type="button" onClick={resetForm}>
                        <FiX /> Cancel
                      </button>
                    ) : null}
                  </div>

                  {formMsg ? <div className="alert" style={{ marginTop: 12 }}>{formMsg}</div> : null}

                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <div className="input-wrap">
                      <input
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Naziv *"
                      />
                    </div>

                    <div className="input-wrap">
                      <input
                        className="input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Opis (opciono)"
                      />
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <div className="input-wrap" style={{ flex: 1, minWidth: 180 }}>
                        <input
                          className="input"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          placeholder="Budget (npr. 1200)"
                        />
                      </div>

                      <div className="input-wrap" style={{ flex: 1, minWidth: 180 }}>
                        <input
                          className="input"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          placeholder="Status (npr. open/closed)"
                        />
                      </div>
                    </div>

                    <div className="input-wrap">
                      <input
                        className="input"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL (opciono)"
                      />
                    </div>

                    <div className="input-wrap">
                      <select
                        className="input select"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        <option value="">Izaberi kategoriju *</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button className="btn-primary" type="button" onClick={submit} disabled={saving}>
                      {mode === "create" ? (
                        <>
                          <FiPlus /> {saving ? "Kreiram..." : "Create"}
                        </>
                      ) : (
                        <>
                          <FiSave /> {saving ? "Čuvam..." : "Save changes"}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="card" style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <h3 className="card-title" style={{ margin: 0 }}>Details</h3>
                    {selectedId ? (
                      <button className="btn-ghost" type="button" onClick={() => setSelectedId(null)}>
                        <FiX /> Close
                      </button>
                    ) : null}
                  </div>

                  {!selectedId ? (
                    <p className="card-text" style={{ marginTop: 10 }}>
                      Klikni “Details” na projektu da vidiš offers i reviews.
                    </p>
                  ) : detailsLoading ? (
                    <p className="card-text" style={{ marginTop: 10 }}>
                      Učitavam detalje (GET /projects/{`{id}`}) + offers + reviews...
                    </p>
                  ) : detailsError ? (
                    <div className="alert" style={{ marginTop: 12 }}>{detailsError}</div>
                  ) : (
                    <>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontWeight: 900 }}>{projectDetails?.name}</div>
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
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
