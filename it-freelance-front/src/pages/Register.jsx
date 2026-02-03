import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiMail, FiLock, FiBriefcase } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function Register() {
  const navigate = useNavigate();

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
    role: "client", // client | freelancer
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      });

      // Preusmeri na login i prosledi email.
      navigate(`/login?email=${encodeURIComponent(form.email)}`, {
        state: { email: form.email },
        replace: true,
      });
    } catch (err) {
      const res = err?.response?.data;
      setServerMessage(res?.message || "Greška pri registraciji.");

      // Laravel validation errors obično dolaze kao { errors: { field: [...] } }
      if (res?.errors) setErrors(res.errors);
    } finally {
      setLoading(false);
    }
  };

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

          <button className="btn-primary" type="submit" disabled={loading}>
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
