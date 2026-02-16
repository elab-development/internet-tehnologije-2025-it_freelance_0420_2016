import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiImage,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import useImageBB from "../hooks/useImageBB";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function Register() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { "Content-Type": "application/json" },
    });
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    image_url: "", // link sa imgbb-a.
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  // ImageBB hook.
  const {
    upload,
    uploading: uploadingImage,
    error: imageError,
    setUrl: setImageUrl,
  } = useImageBB();

  const [pickedFile, setPickedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(""); // preview iz URL.createObjectURL.
  const [imageMsg, setImageMsg] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0] || null;

    setImageMsg("");
    setPickedFile(file);

    // Očisti prethodni remote link jer korisnik bira novu sliku.
    setForm((prev) => ({ ...prev, image_url: "" }));
    setImageUrl("");

    // Očisti stari local preview.
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }

    if (!file) return;

    const objUrl = URL.createObjectURL(file);
    setLocalPreview(objUrl);
    setImageMsg("Izabrana je slika. Klikni Upload da dobiješ image_url link.");
  };

  // Cleanup za local preview (da ne curi memorija).
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const onUploadImage = async () => {
    setImageMsg("");

    if (!pickedFile) {
      setImageMsg("Prvo izaberi sliku.");
      return;
    }

    try {
      const url = await upload(pickedFile);

      setForm((prev) => ({ ...prev, image_url: url }));
      setImageUrl(url);

      // Nakon uspešnog upload-a, pređi sa local preview na remote preview.
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview("");
      }
      setPickedFile(null);

      // Reset input da bi mogla ponovo izabrati istu sliku ako želiš.
      if (fileInputRef.current) fileInputRef.current.value = "";

      setImageMsg("Upload uspešan. image_url je setovan.");
    } catch (e) {
      // imageError već postoji iz hook-a.
    }
  };

  const removeImage = () => {
    setImageMsg("");

    // Clear form link.
    setForm((prev) => ({ ...prev, image_url: "" }));
    setImageUrl("");

    // Clear picked file + local preview.
    setPickedFile(null);

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview("");
    }

    // Reset input.
    if (fileInputRef.current) fileInputRef.current.value = "";

    setImageMsg("Slika je uklonjena.");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerMessage("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        image_url: form.image_url || null, // šaljemo link ako postoji.
      });

      navigate(`/login?email=${encodeURIComponent(form.email)}`, {
        state: { email: form.email },
        replace: true,
      });
    } catch (err) {
      const res = err?.response?.data;
      setServerMessage(res?.message || "Greška pri registraciji.");
      if (res?.errors) setErrors(res.errors);
    } finally {
      setLoading(false);
    }
  };

  const previewSrc = localPreview || form.image_url || "";
  const hasPreview = Boolean(previewSrc);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src="/images/logo.png" alt="IT Freelance logo" />
        <div className="auth-brand">
          <div>
            <h1 className="auth-title">Registracija</h1>
          </div>
        </div>

        {serverMessage ? <div className="alert">{serverMessage}</div> : null}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-row">
            <label className="form-label">Ime</label>
            <div className="input-wrap">
              <FiUser className="input-icon" />
              <input
                className="input"
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="npr. Ana Anić"
                autoComplete="name"
              />
            </div>
            {errors?.name ? <p className="field-error">{errors.name[0]}</p> : null}
          </div>

          <div className="form-row">
            <label className="form-label">Email</label>
            <div className="input-wrap">
              <FiMail className="input-icon" />
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="npr. ana@email.com"
                autoComplete="email"
              />
            </div>
            {errors?.email ? <p className="field-error">{errors.email[0]}</p> : null}
          </div>

          <div className="form-row">
            <label className="form-label">Lozinka</label>
            <div className="input-wrap">
              <FiLock className="input-icon" />
              <input
                className="input"
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Minimum 6 karaktera"
                autoComplete="new-password"
              />
            </div>
            {errors?.password ? <p className="field-error">{errors.password[0]}</p> : null}
          </div>

          <div className="form-row">
            <label className="form-label">Uloga</label>
            <div className="input-wrap">
              <FiBriefcase className="input-icon" />
              <select className="input select" name="role" value={form.role} onChange={onChange}>
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
            {errors?.role ? <p className="field-error">{errors.role[0]}</p> : null}
          </div>

          {/* =========================
              UPLOAD SLIKE + PREVIEW (poslednja sekcija).
             ========================= */}
          <div className="form-row">
            <label className="form-label">Profilna slika (ImageBB)</label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPickImage}
              style={{ display: "none" }}
              disabled={uploadingImage || loading}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={openFilePicker}
                disabled={uploadingImage || loading}
              >
                <FiImage /> {hasPreview ? "Zameni sliku" : "Izaberi sliku"}
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={onUploadImage}
                disabled={!pickedFile || uploadingImage || loading}
              >
                <FiUploadCloud /> {uploadingImage ? "Uploadujem..." : "Upload"}
              </button>

              {hasPreview ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={removeImage}
                  disabled={uploadingImage || loading}
                >
                  <FiX /> Ukloni
                </button>
              ) : null}

              {form.image_url ? (
                <a
                  href={form.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="link-btn"
                  style={{ textDecoration: "underline" }}
                >
                  Otvori image_url
                </a>
              ) : null}
            </div>

            {imageMsg ? <p className="admin-muted" style={{ marginTop: 8 }}>{imageMsg}</p> : null}
            {imageError ? <p className="field-error" style={{ marginTop: 8 }}>{imageError}</p> : null}

            {hasPreview ? (
              <div
                style={{
                  marginTop: 12,
                  border: "1px solid rgba(15,27,45,0.10)",
                  background: "rgba(255,255,255,0.88)",
                  borderRadius: 16,
                  padding: 12,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <img
                  src={previewSrc}
                  alt="Preview"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    objectFit: "cover",
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900 }}>
                    {localPreview
                      ? "Preview (lokalno, pre upload-a)."
                      : "Preview (sa image_url linka)."}
                  </div>

                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                    {form.image_url
                      ? "image_url će biti poslat na register."
                      : pickedFile
                        ? "Klikni Upload da dobiješ link."
                        : "Izaberi sliku ili ukloni."}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <button className="btn-primary" type="submit" disabled={loading || uploadingImage}>
            {loading ? "Registrujem..." : "Registruj se"}
          </button>

          <p className="auth-footer">
            Već imaš nalog?{" "}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate(`/login?email=${encodeURIComponent(form.email)}`)}
            >
              Prijavi se
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
