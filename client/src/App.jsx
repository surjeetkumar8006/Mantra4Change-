import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import GrantAssistant from './pages/GrantAssistant';

function Sidebar() {
  const location = useLocation();
  return (
    <div className="sidebar">
      <h1 className="brand">
        <LayoutDashboard color="var(--primary-light)" size={28} />
        PBL Intelligence
      </h1>
      <div className="sidebar-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Monthly Review
        </Link>
        <Link to="/grants" className={`nav-item ${location.pathname === '/grants' ? 'active' : ''}`}>
          <FileText size={20} />
          Grant Assistant
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/grants" element={<GrantAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
