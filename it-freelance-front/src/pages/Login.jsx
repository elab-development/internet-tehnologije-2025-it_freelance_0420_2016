import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMail, FiLock } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { "Content-Type": "application/json" },
    });
  }, []);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Prefill email sa register stranice (query param ili state).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromQuery = params.get("email");
    const emailFromState = location.state?.email;

    const prefill = emailFromState || emailFromQuery || "";
    if (prefill) {
      setForm((prev) => ({ ...prev, email: prefill }));
    }
  }, [location.search, location.state]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const redirectByRole = (role) => {
    if (role === "freelancer") navigate("/freelancer", { replace: true });
    else if (role === "client") navigate("/client", { replace: true });
    else if (role === "admin") navigate("/admin", { replace: true });
    else navigate("/", { replace: true });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      // Očekujemo strukturu:
      // { success, message, data: { user, token } }
      const token = res?.data?.data?.token;
      const user = res?.data?.data?.user;

      if (!token || !user) {
        setServerMessage("Nevalidan odgovor sa servera.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      redirectByRole(user.role);
    } catch (err) {
      const res = err?.response?.data;
      setServerMessage(res?.message || "Greška pri prijavi.");
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
            <h1 className="auth-title">Prijava</h1>
          </div>
        </div>

        {serverMessage ? <div className="alert">{serverMessage}</div> : null}
        {errors?.auth ? <div className="alert">{errors.auth[0]}</div> : null}

        <form className="auth-form" onSubmit={onSubmit}>
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
                placeholder="Unesi lozinku"
                autoComplete="current-password"
              />
            </div>
            {errors?.password ? <p className="field-error">{errors.password[0]}</p> : null}
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Prijavljujem..." : "Prijavi se"}
          </button>

          <p className="auth-footer">
            Nemaš nalog?{" "}
            <button type="button" className="link-btn" onClick={() => navigate("/register")}>
              Registruj se
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
