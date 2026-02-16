import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";
import { FiRefreshCcw, FiUsers, FiGrid, FiTag, FiStar } from "react-icons/fi";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

function pickMetrics(res) {
  const d = res?.data;
  if (!d) return null;

  // očekujemo: { success, data: { users, projects, offers, reviews, top } }
  if (d?.data?.metrics) return d.data.metrics;
  if (d?.data) return d.data;
  return d;
}

/**
 * Izvlači broj iz:
 * - number: 10
 * - string: "10"
 * - object: { total: 10 } / { count: 10 } / { value: 10 } / { projects: 10 }...
 */
function getCount(value) {
  if (value == null) return 0;

  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  if (typeof value === "object") {
    const keysToTry = ["total", "count", "value", "projects", "offers", "reviews"];
    for (const k of keysToTry) {
      if (value?.[k] != null) return getCount(value[k]);
    }
    return 0;
  }

  return 0;
}

export default function AdminMetrics() {
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

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loadMetrics = async () => {
    setLoading(true);
    setMsg("");

    if (!token) {
      setMsg("Moraš biti ulogovana kao admin.");
      setLoading(false);
      return;
    }
    if (role !== "admin") {
      setMsg("Samo admin može da vidi metrike.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/metrics/dashboard");
      const m = pickMetrics(res);
      setMetrics(m);
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      setMsg(serverMsg || "Ne mogu da učitam metrike. Proveri backend i permissions.");
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // USERS može biti objekat: { total, clients, freelancers, admins }
  const usersObj = metrics?.users && typeof metrics.users === "object" ? metrics.users : null;

  const usersTotal = getCount(usersObj ? usersObj.total : metrics?.users);
  const usersClients = usersObj ? getCount(usersObj.clients) : 0;
  const usersFreelancers = usersObj ? getCount(usersObj.freelancers) : 0;
  const usersAdmins = usersObj ? getCount(usersObj.admins) : 0;

  const projects = getCount(metrics?.projects);
  const offers = getCount(metrics?.offers);
  const reviews = getCount(metrics?.reviews);

  const top = metrics?.top || {};
  const categoriesByProjects = Array.isArray(top?.categories_by_projects)
    ? top.categories_by_projects
    : [];
  const freelancersByReviews = Array.isArray(top?.freelancers_by_reviews)
    ? top.freelancers_by_reviews
    : [];
  const clientsByProjects = Array.isArray(top?.clients_by_projects)
    ? top.clients_by_projects
    : [];

  // =========================
  // GOOGLE CHARTS DATA
  // =========================

  const usersPieData = useMemo(() => {
    return [
      ["Role", "Count"],
      ["Clients", usersClients],
      ["Freelancers", usersFreelancers],
      ["Admins", usersAdmins],
    ];
  }, [usersClients, usersFreelancers, usersAdmins]);

  const categoriesBarData = useMemo(() => {
    const rows = categoriesByProjects.map((x) => [x.name, getCount(x.project_count)]);
    return [["Category", "Projects"], ...rows];
  }, [categoriesByProjects]);

  const totalsColumnData = useMemo(() => {
    return [
      ["Metric", "Count"],
      ["Projects", projects],
      ["Offers", offers],
      ["Reviews", reviews],
    ];
  }, [projects, offers, reviews]);

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <div className="admin-card">
          <div className="admin-head">
            <div>
              <h2 className="admin-title">Admin Metrics</h2>
            </div>

            <button className="admin-btn" type="button" onClick={loadMetrics} disabled={loading}>
              <FiRefreshCcw /> Refresh
            </button>
          </div>

          {msg ? <div className="admin-alert">{msg}</div> : null}

          {loading ? (
            <p className="admin-muted">Učitavam metrike...</p>
          ) : !metrics ? (
            <p className="admin-muted">Nema podataka za prikaz.</p>
          ) : (
            <>
              <div className="admin-metricsGrid">
                <div className="admin-metric">
                  <div className="admin-metricIcon"><FiUsers /></div>
                  <div className="admin-metricLabel">Users</div>
                  <div className="admin-metricValue">{usersTotal}</div>

                  {usersObj ? (
                    <div className="admin-metricMini">
                      <span>Clients: <b>{usersClients}</b></span>
                      <span>Freelancers: <b>{usersFreelancers}</b></span>
                      <span>Admins: <b>{usersAdmins}</b></span>
                    </div>
                  ) : null}
                </div>

                <div className="admin-metric">
                  <div className="admin-metricIcon"><FiGrid /></div>
                  <div className="admin-metricLabel">Projects</div>
                  <div className="admin-metricValue">{projects}</div>
                </div>

                <div className="admin-metric">
                  <div className="admin-metricIcon"><FiTag /></div>
                  <div className="admin-metricLabel">Offers</div>
                  <div className="admin-metricValue">{offers}</div>
                </div>

                <div className="admin-metric">
                  <div className="admin-metricIcon"><FiStar /></div>
                  <div className="admin-metricLabel">Reviews</div>
                  <div className="admin-metricValue">{reviews}</div>
                </div>
              </div>

              {/* =========================
                  CHARTS SECTION
                 ========================= */}
              <div className="admin-topGrid" style={{ marginTop: 14 }}>
                <div className="admin-topBox">
                  <div className="admin-topTitle">Users by role (Pie)</div>

                  {!usersObj ? (
                    <p className="admin-muted">Backend ne vraća users breakdown.</p>
                  ) : (
                    <div style={{ height: 280 }}>
                      <Chart
                        chartType="PieChart"
                        width="100%"
                        height="280px"
                        data={usersPieData}
                        options={{
                          legend: { position: "right" },
                          chartArea: { width: "90%", height: "90%" },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="admin-topBox">
                  <div className="admin-topTitle">Top categories by projects (Bar)</div>

                  {categoriesByProjects.length === 0 ? (
                    <p className="admin-muted">Nema podataka.</p>
                  ) : (
                    <div style={{ height: 300 }}>
                      <Chart
                        chartType="BarChart"
                        width="100%"
                        height="300px"
                        data={categoriesBarData}
                        options={{
                          legend: { position: "none" },
                          chartArea: { width: "70%", height: "75%" },
                          hAxis: { minValue: 0 },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="admin-topBox">
                  <div className="admin-topTitle">Totals (Column)</div>

                  <div style={{ height: 300 }}>
                    <Chart
                      chartType="ColumnChart"
                      width="100%"
                      height="300px"
                      data={totalsColumnData}
                      options={{
                        legend: { position: "none" },
                        chartArea: { width: "80%", height: "70%" },
                        vAxis: { minValue: 0 },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* =========================
                  LISTS (existing)
                 ========================= */}
              <div className="admin-topGrid" style={{ marginTop: 14 }}>
                <div className="admin-topBox">
                  <div className="admin-topTitle">Top categories by projects (List)</div>
                  {categoriesByProjects.length === 0 ? (
                    <p className="admin-muted">Nema podataka.</p>
                  ) : (
                    <ul className="admin-topList">
                      {categoriesByProjects.map((x) => (
                        <li key={x.id} className="admin-topItem">
                          <span className="admin-topName">{x.name}</span>
                          <span className="admin-topBadge">{getCount(x.project_count)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="admin-topBox">
                  <div className="admin-topTitle">Top clients by projects</div>
                  {clientsByProjects.length === 0 ? (
                    <p className="admin-muted">Nema podataka.</p>
                  ) : (
                    <ul className="admin-topList">
                      {clientsByProjects.map((x) => (
                        <li key={x.id} className="admin-topItem">
                          <span className="admin-topName">{x.name}</span>
                          <span className="admin-topBadge">{getCount(x.projects_count)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Ako želiš i ovo kao listu (trenutno si ga parsirala, ali ga nisi renderovala). */}
                <div className="admin-topBox">
                  <div className="admin-topTitle">Top freelancers by reviews</div>
                  {freelancersByReviews.length === 0 ? (
                    <p className="admin-muted">Nema podataka.</p>
                  ) : (
                    <ul className="admin-topList">
                      {freelancersByReviews.map((x) => (
                        <li key={x.id} className="admin-topItem">
                          <span className="admin-topName">{x.name}</span>
                          <span className="admin-topBadge">{getCount(x.reviews_count)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
