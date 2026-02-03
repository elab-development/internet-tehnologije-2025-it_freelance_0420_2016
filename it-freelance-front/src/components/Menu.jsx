import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiLogOut, FiHome, FiGrid, FiTag, FiBarChart2, FiPlusCircle } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export default function Menu() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  // Linkovi po ulozi (usklađeno sa tvojim backend rutama iz api.php).
  // Napomena: ovo su FRONTEND rute koje ti možeš da implementiraš kasnije,
  // ali logički prate backend:
  // - Projects (GET /projects)
  // - Categories (GET /categories) + admin CRUD
  // - Offers po projektu (GET /projects/{project}/offers) => UI obično na detalju projekta
  // - Reviews po projektu (GET /projects/{project}/reviews) => UI obično na detalju projekta
  // - Metrics (GET /metrics/dashboard) => admin
  const links = useMemo(() => {
    // Kad nije ulogovan, pokaži samo Login/Register (ako želiš).
    if (!role) {
      return [
        { to: "/login", label: "Login", icon: <FiHome /> },
        { to: "/register", label: "Register", icon: <FiPlusCircle /> },
      ];
    }

    // Freelancer.
    if (role === "freelancer") {
      return [
        { to: "/freelancer", label: "Home", icon: <FiHome /> },
        { to: "/freelancer/projects", label: "Projects", icon: <FiGrid /> }, // GET /projects
      ];
    }

    // Client.
    if (role === "client") {
      return [
        { to: "/client", label: "Home", icon: <FiHome /> },
        { to: "/projects", label: "Projects", icon: <FiGrid /> }, // GET /projects
        { to: "/my-projects", label: "My Projects", icon: <FiPlusCircle /> }, // logična UI ruta (možeš kasnije)
      ];
    }

    // Admin.
    if (role === "admin") {
      return [
        { to: "/admin", label: "Home", icon: <FiHome /> },
        { to: "/admin/projects", label: "Projects", icon: <FiGrid /> }, // GET /projects
        { to: "/admin/categories", label: "Categories", icon: <FiTag /> }, // GET /categories + admin CRUD
        { to: "/admin/metrics", label: "Metrics", icon: <FiBarChart2 /> }, // GET /metrics/dashboard
      ];
    }

    // Fallback.
    return [{ to: "/", label: "Home", icon: <FiHome /> }];
  }, [role]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Pozovi backend logout (protected ruta).
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (e) {
      // čak i ako backend pukne, mi svakako čistimo session (početnički i jednostavno).
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setLoading(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <nav className="menu">
      <div className="menu-left">
        <img className="menu-logo" src="/images/logo.png" alt="IT Freelance logo" />
      </div>

      <div className="menu-links">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => (isActive ? "menu-link active" : "menu-link")}
          >
            <span className="menu-icon">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="menu-right">
        {role ? (
          <>
            <div className="menu-user">
              <span className="menu-user-name">{user?.name || "User"}</span>
              <span className="menu-user-role">{role}</span>
            </div>

            <button className="menu-logout" onClick={handleLogout} disabled={loading}>
              <FiLogOut />
              {loading ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
