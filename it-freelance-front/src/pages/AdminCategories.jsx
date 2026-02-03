import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCcw, FiSave, FiX } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

function normalizeList(res) {
  const d = res?.data;
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.data?.categories)) return d.data.categories;
  if (Array.isArray(d?.categories)) return d.categories;
  return [];
}

export default function AdminCategories() {
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

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Create
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await api.get("/categories"); // GET /categories (public)
      setCategories(normalizeList(res));
    } catch (e) {
      setMsg("Ne mogu da učitam kategorije. Proveri da li backend radi.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name || "");
    setMsg("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const createCategory = async () => {
    setMsg("");

    if (!token) return setMsg("Moraš biti ulogovana kao admin.");
    if (role !== "admin") return setMsg("Samo admin može da kreira kategorije.");
    if (!newName.trim()) return setMsg("Unesi naziv kategorije.");

    setCreating(true);
    try {
      await api.post("/categories", { name: newName.trim() }); // POST /categories (admin)
      setNewName("");
      setMsg("Kategorija je kreirana.");
      await loadCategories();
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      const errors = e?.response?.data?.errors;
      const firstError =
        errors ? Object.values(errors)?.flat()?.[0] : null;

      setMsg(serverMsg || firstError || "Greška pri kreiranju kategorije.");
    } finally {
      setCreating(false);
    }
  };

  const updateCategory = async () => {
    setMsg("");

    if (!token) return setMsg("Moraš biti ulogovana kao admin.");
    if (role !== "admin") return setMsg("Samo admin može da menja kategorije.");
    if (!editingId) return;
    if (!editName.trim()) return setMsg("Naziv ne može biti prazan.");

    setSaving(true);
    try {
      await api.put(`/categories/${editingId}`, { name: editName.trim() }); // PUT /categories/{id}
      setMsg("Kategorija je ažurirana.");
      cancelEdit();
      await loadCategories();
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      const errors = e?.response?.data?.errors;
      const firstError =
        errors ? Object.values(errors)?.flat()?.[0] : null;

      setMsg(serverMsg || firstError || "Greška pri ažuriranju kategorije.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    setMsg("");

    if (!token) return setMsg("Moraš biti ulogovana kao admin.");
    if (role !== "admin") return setMsg("Samo admin može da briše kategorije.");

    const ok = window.confirm("Da li sigurno želiš da obrišeš kategoriju?");
    if (!ok) return;

    try {
      await api.delete(`/categories/${id}`); // DELETE /categories/{id}
      setMsg("Kategorija je obrisana.");
      await loadCategories();
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      setMsg(serverMsg || "Greška pri brisanju kategorije (možda je vezana za projekte).");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-card">
          <div className="admin-head">
            <div>
              <h2 className="admin-title">Admin Categories</h2>
            </div>
          </div>

          {msg ? <div className="admin-alert">{msg}</div> : null}

          {/* CREATE */}
          <div className="admin-row">
            <div className="admin-inputWrap" style={{ flex: 1 }}>
              <input
                className="admin-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New category name..."
                disabled={!token || role !== "admin" || creating}
              />
            </div>

            <button
              className="admin-btnPrimary"
              type="button"
              onClick={createCategory}
              disabled={!token || role !== "admin" || creating}
            >
              <FiPlus /> {creating ? "Creating..." : "Create"}
            </button>
          </div>

          {/* LIST */}
          <div className="admin-list">
            {loading ? (
              <p className="admin-muted">Učitavam...</p>
            ) : categories.length === 0 ? (
              <p className="admin-muted">Nema kategorija.</p>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="admin-item">
                  {editingId === c.id ? (
                    <>
                      <div className="admin-inputWrap" style={{ flex: 1 }}>
                        <input
                          className="admin-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Category name..."
                          disabled={saving}
                        />
                      </div>

                      <button className="admin-btnPrimary" type="button" onClick={updateCategory} disabled={saving}>
                        <FiSave /> {saving ? "Saving..." : "Save"}
                      </button>

                      <button className="admin-btn" type="button" onClick={cancelEdit} disabled={saving}>
                        <FiX /> Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="admin-itemMain">
                        <div className="admin-itemName">{c.name}</div>
                        <div className="admin-itemMeta">ID: {c.id}</div>
                      </div>

                      <button
                        className="admin-btn"
                        type="button"
                        onClick={() => startEdit(c)}
                        disabled={!token || role !== "admin"}
                      >
                        <FiEdit2 /> Edit
                      </button>

                      <button
                        className="admin-btnDanger"
                        type="button"
                        onClick={() => deleteCategory(c.id)}
                        disabled={!token || role !== "admin"}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {!token ? (
            <p className="admin-muted" style={{ marginTop: 12 }}>
              Moraš biti ulogovana da bi koristila admin akcije.
            </p>
          ) : role !== "admin" ? (
            <p className="admin-muted" style={{ marginTop: 12 }}>
              Samo uloga <b>admin</b> može da kreira/menja/briše kategorije.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
