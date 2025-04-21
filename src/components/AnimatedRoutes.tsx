import { useLocation, Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import CreateProject from "@/pages/CreateProject";
import Checklist from "@/pages/Checklist";
import ProfilePage from "@/pages/Profile";
import CalendlyConnect from "@/components/CalendlyConnect";
import NotFound from "@/pages/NotFound";

// Copiar as funções ProtectedRoute e PublicRoute para cá, pois não são exportadas do App por padrão
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // @ts-ignore
  const { isAuthenticated, isLoading } = require("../hooks/useAuth").useAuth();
  const location = require("react-router-dom").useLocation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return require("react").createElement(require("react-router-dom").Navigate, { to: "/login", state: { from: location }, replace: true });
  }
  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  // @ts-ignore
  const { isAuthenticated, isLoading } = require("../hooks/useAuth").useAuth();
  const location = require("react-router-dom").useLocation();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return require("react").createElement(require("react-router-dom").Navigate, { to: "/dashboard", replace: true });
  }
  return children;
};

export default function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
            <Index />
          </motion.div>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
              <Login />
            </motion.div>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
              <Register />
            </motion.div>
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
              <Dashboard />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/create-project" element={
          <ProtectedRoute>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
              <CreateProject />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/project/:projectId" element={
          <ProtectedRoute>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
              <Checklist />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.35, ease: "easeInOut" }} style={{ minHeight: "100vh" }}>
              <ProfilePage />
            </motion.div>
          </ProtectedRoute>
        } />
        <Route path="/conectar-calendly" element={<CalendlyConnect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}
