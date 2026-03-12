import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, MapPin, Camera, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

const mockComplaints = [
  {
    id: '1', citizen_name: 'Rahul V.', category: 'Water', description: 'Pipeline bursting near sector 4 main road.',
    status: 'Open', location_coords: '28.6139, 77.2090', sentiment: 'Angry', timestamp: new Date().toISOString()
  },
  {
    id: '2', citizen_name: 'Priya M.', category: 'Electricity', description: 'Power outage since 4 hours.',
    status: 'In-Progress', location_coords: '28.5355, 77.2410', sentiment: 'Urgent', timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3', citizen_name: 'Anand K.', category: 'Sanitation', description: 'Garbage not collected for 3 days.',
    status: 'Resolved', location_coords: '28.6619, 77.2274', sentiment: 'Satisfied', timestamp: new Date(Date.now() - 86400000).toISOString(),
    before_photo: 'https://images.unsplash.com/photo-1590059367464-98ec3470650d?w=200',
    after_photo: 'https://images.unsplash.com/photo-1610486801908-14af3d85d774?w=200'
  }
];

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.data || mockComplaints);
      } else {
        setComplaints(mockComplaints);
      }
    } catch {
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:8000/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, phone_number: '+1234567890' }) // Mock phone for demo
      });
      // Optimistic update
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
      setSelectedTicket(null);
    } catch (err) {
      console.error(err);
      // Mock update
      setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
      setSelectedTicket(null);
    }
  };

  const filteredComplaints = filter === 'All' ? complaints : complaints.filter(c => c.category === filter);

  // Default center (New Delhi)
  const center = [28.6139, 77.2090];

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'Angry': return '#ef4444'; // Red
      case 'Urgent': return '#f59e0b'; // Amber
      case 'Satisfied': return '#10b981'; // Green
      default: return '#3b82f6'; // Blue
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Officer Dashboard</h2>
          <p>Real-time citizen sentiment and issue management</p>
        </div>
        <button className="refresh-btn" onClick={fetchComplaints}>
          <RefreshCw size={18} className={loading ? "spin" : ""} /> Refresh Data
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Sentiment Map Section */}
        <div className="map-section panel">
          <div className="panel-header">
            <h3><MapPin size={20}/> Public Sentiment Heatmap</h3>
          </div>
          <div className="map-container">
            <MapContainer center={center} zoom={11} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {complaints.map((c) => {
                if (!c.location_coords) return null;
                const [lat, lng] = c.location_coords.split(',').map(Number);
                if (isNaN(lat) || isNaN(lng)) return null;
                
                return (
                  <CircleMarker 
                    key={c.id} 
                    center={[lat, lng]} 
                    radius={8}
                    fillColor={getSentimentColor(c.sentiment)}
                    color={getSentimentColor(c.sentiment)}
                    weight={1}
                    opacity={1}
                    fillOpacity={0.8}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{c.category}</strong>
                        <p>{c.description}</p>
                        <span className="sentiment-tag" style={{backgroundColor: getSentimentColor(c.sentiment)}}>
                          Sentiment: {c.sentiment || 'Neutral'}
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
          <div className="map-legend">
            <span className="legend-item"><span className="dot" style={{backgroundColor: '#ef4444'}}></span> Angry</span>
            <span className="legend-item"><span className="dot" style={{backgroundColor: '#f59e0b'}}></span> Urgent</span>
            <span className="legend-item"><span className="dot" style={{backgroundColor: '#10b981'}}></span> Satisfied</span>
            <span className="legend-item"><span className="dot" style={{backgroundColor: '#3b82f6'}}></span> Neutral</span>
          </div>
        </div>

        {/* Complaints Table Section */}
        <div className="table-section panel">
          <div className="panel-header">
            <h3><MessageSquare size={20}/> Active Tickets</h3>
            <div className="filters">
              {['All', 'Sanitation', 'Electricity', 'Water', 'Roads'].map(cat => (
                <button 
                  key={cat} 
                  className={`filter-btn ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="table-wrapper">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Issue</th>
                  <th>Sentiment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(t => (
                  <tr key={t.id} className={t.status === 'Resolved' ? 'resolved-row' : ''}>
                    <td>#{t.id.slice(0,5)}</td>
                    <td><span className={`tag tag-${t.category.toLowerCase()}`}>{t.category}</span></td>
                    <td className="desc-cell">{t.description}</td>
                    <td>
                       <span className={`sentiment-dot ${t.sentiment?.toLowerCase()}`}></span>
                       {t.sentiment || 'Neutral'}
                    </td>
                    <td>
                      <span className={`status-badge status-${t.status.toLowerCase().replace('-','')} `}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" onClick={() => setSelectedTicket(t)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredComplaints.length === 0 && (
              <div className="empty-state">No tickets found for this category.</div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Management Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Manage Ticket #{selectedTicket.id.slice(0,5)}</h3>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-group">
                <label>Reported By:</label>
                <p>{selectedTicket.citizen_name}</p>
              </div>
              <div className="detail-group">
                <label>Issue Description:</label>
                <p className="detail-desc">{selectedTicket.description}</p>
              </div>
              
              <div className="action-area">
                <h4>Update Status (Notifies Citizen)</h4>
                <div className="status-buttons">
                  <button 
                    className={`status-opt ${selectedTicket.status === 'Open' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedTicket.id, 'Open')}
                  >
                    Open
                  </button>
                  <button 
                    className={`status-opt inprogress ${selectedTicket.status === 'In-Progress' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedTicket.id, 'In-Progress')}
                  >
                    <AlertTriangle size={16}/> In-Progress
                  </button>
                  <button 
                    className={`status-opt resolved ${selectedTicket.status === 'Resolved' ? 'active' : ''}`}
                    onClick={() => updateStatus(selectedTicket.id, 'Resolved')}
                  >
                    <CheckCircle size={16}/> Resolve
                  </button>
                </div>
              </div>

              {/* Before & After Polish */}
              {selectedTicket.status === 'Resolved' && selectedTicket.before_photo && (
                <div className="photo-comparison">
                  <h4><Camera size={18}/> Verification Match</h4>
                  <div className="photos">
                    <div className="photo-box">
                      <img src={selectedTicket.before_photo} alt="Before" />
                      <span>Before</span>
                    </div>
                    <div className="photo-box">
                      <img src={selectedTicket.after_photo} alt="After" />
                      <span>After</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
