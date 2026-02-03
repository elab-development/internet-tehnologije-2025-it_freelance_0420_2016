import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Placeholder from "./components/Placeholder";

import Register from "./pages/Register";
import Login from "./pages/Login";

import FreelancerHome from "./pages/FreelancerHome";
import ClientHome from "./pages/ClientHome";
import AdminHome from "./pages/AdminHome";

import ClientProjects from "./pages/ClientProjects";
import MyClientProjects from "./pages/MyClientProjects";

import FreelancerProjects from "./pages/FreelancerProjects";

import AdminCategories from "./pages/AdminCategories";
import AdminMetrics from "./pages/AdminMetrics";


export default function App() {
  return (
    <Routes>
      {/* Public stranice bez menija */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Sve ostalo ide kroz layout sa Menu */}
      <Route element={<AppLayout />}>
        <Route path="/freelancer" element={<FreelancerHome />} />
        <Route path="/client" element={<ClientHome />} />
        <Route path="/admin" element={<AdminHome />} />

        {/* Rute koje su u meniju */}
        <Route path="/admin/projects" element={<Placeholder title="Admin Projects" />} />

        <Route path="/projects" element={<ClientProjects />} />
        <Route path="/my-projects" element={<MyClientProjects />} />

        <Route path="/freelancer/projects" element={<FreelancerProjects />} />

        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/metrics" element={<AdminMetrics />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
