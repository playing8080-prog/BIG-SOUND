import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
