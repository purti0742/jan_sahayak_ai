import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ChevronRight } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('citizen'); // 'citizen' or 'admin'
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you would authenticate here.
    if (activeTab === 'citizen') {
      navigate('/citizen-app');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <span className="logo-icon block" style={{fontSize: '3rem', marginBottom: '1rem'}}>🏛️</span>
            <h2>Jan-Sahayaka AI</h2>
            <p>Welcome to the civic engagement platform</p>
          </div>
        </div>

        <div className="login-tabs">
          <button 
            className={`tab-btn ${activeTab === 'citizen' ? 'active' : ''}`}
            onClick={() => setActiveTab('citizen')}
          >
            <User size={18} />
            Citizen Login
          </button>
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Lock size={18} />
            Officer Login
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address / Phone Number</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder={activeTab === 'citizen' ? "Enter your phone or email" : "Enter officer ID or email"}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password / OTP</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                placeholder={activeTab === 'citizen' ? "Enter OTP sent to phone" : "Enter password"}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="login-meta">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-link">Forgot Password?</a>
          </div>

          <button type="submit" className="login-submit-btn">
            Sign In <ChevronRight size={20} />
          </button>
        </form>

        {activeTab === 'citizen' && (
          <div className="login-footer">
            <p>Don't have an account? <a href="#">Register here</a></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
