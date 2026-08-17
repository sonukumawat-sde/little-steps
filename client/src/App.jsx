import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider, Navbar } from "./components/UI.jsx";

import Landing from "./pages/Landing.jsx";
import { Login, Register } from "./pages/Auth.jsx";
import Search from "./pages/Search.jsx";
import CenterDetail from "./pages/CenterDetail.jsx";
import ParentDashboard from "./pages/ParentDashboard.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "30px 0", marginTop: 40 }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span className="muted" style={{ fontWeight: 700 }}>🧸 Little Steps — Trusted 24×7 Childcare</span>
        <span className="muted" style={{ fontSize: "0.85rem" }}>Built for the Little Steps PRD · Demo build</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <main style={{ minHeight: "70vh" }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/center/:id" element={<CenterDetail />} />
              <Route path="/parent" element={<Protected role="parent"><ParentDashboard /></Protected>} />
              <Route path="/provider" element={<Protected role="provider"><ProviderDashboard /></Protected>} />
              <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
