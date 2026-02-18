import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiLogOut, FiHome, FiGrid, FiTag, FiBarChart2, FiPlusCircle } from "react-icons/fi";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

// Put a cube placeholder image in: public/images/cube-avatar.png
const CUBE_AVATAR = "/images/cube-avatar.png";

export default function Menu() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const role = user?.role || null;

  // avatar url from session storage user.image_url
  const avatarUrl = user?.image_url || CUBE_AVATAR;

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  }, [token]);

  const links = useMemo(() => {
    if (!role) {
      return [
        { to: "/login", label: "Login", icon: <FiHome /> },
        { to: "/register", label: "Register", icon: <FiPlusCircle /> },
      ];
    }

    if (role === "freelancer") {
      return [
        { to: "/freelancer", label: "Home", icon: <FiHome /> },
        { to: "/freelancer/projects", label: "Projects", icon: <FiGrid /> },
      ];
    }

    if (role === "client") {
      return [
        { to: "/client", label: "Home", icon: <FiHome /> },
        { to: "/projects", label: "Projects", icon: <FiGrid /> },
        { to: "/my-projects", label: "My Projects", icon: <FiPlusCircle /> },
      ];
    }

    if (role === "admin") {
      return [
        { to: "/admin", label: "Home", icon: <FiHome /> },
        { to: "/admin/categories", label: "Categories", icon: <FiTag /> },
        { to: "/admin/metrics", label: "Metrics", icon: <FiBarChart2 /> },
      ];
    }

    return [{ to: "/", label: "Home", icon: <FiHome /> }];
  }, [role]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      if (token) {
        await api.post("/auth/logout");
      }
    } catch (e) {
      // ignore
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
              <img
                className="menu-avatar"
                src={avatarUrl}
                alt={`${user?.name || "User"} avatar`}
                onError={(e) => {
                  // fallback if image_url is broken
                  e.currentTarget.src = CUBE_AVATAR;
                }}
              />

              <div className="menu-user-meta">
                <span className="menu-user-name">{user?.name || "User"}</span>
                <span className="menu-user-role">{role}</span>
              </div>
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
