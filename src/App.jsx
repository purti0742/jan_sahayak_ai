import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CitizenApp from './pages/CitizenApp';
import AdminPanel from './pages/AdminPanel';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="logo-icon">🏛️</span>
            <h1>Jan-Sahayaka AI</h1>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Citizen Portal</Link>
            <Link to="/admin" className="nav-link admin-link">Officer Dashboard</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CitizenApp />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        
        <footer className="footer">
          <p>Jan-Sahayaka AI CRM - Empowering Citizens</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
