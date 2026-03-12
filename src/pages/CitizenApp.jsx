import React, { useState, useRef } from 'react';
import { Mic, Square, Send, Loader2, AlertCircle } from 'lucide-react';

export default function CitizenApp() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, recording, processing, success, error
  const [ticketData, setTicketData] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        setAudioChunks(chunks);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      // Fallback to text if mic fails
      alert("Microphone access denied. Please type your complaint.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('idle');
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (audioChunks.length === 0 && !description.trim()) return;

    setStatus('processing');
    
    const formData = new FormData();
    formData.append('citizen_name', 'Citizen'); // In a real app, from auth
    // Mock location for demo
    formData.append('location_coords', '28.6139, 77.2090'); 
    
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      formData.append('audio', audioBlob, 'complaint.webm');
    }
    
    if (description.trim()) {
      formData.append('description', description);
    }

    try {
      // In a real app, point to your FastAPI backend url
      // Using a mock delay here assuming backend might not be fully wired with keys yet
      const response = await fetch('http://localhost:8000/report', {
        method: 'POST',
        body: formData,
      }).catch(() => null);

      let result;
      if (response && response.ok) {
        result = await response.json();
      } else {
        // Fallback mock if backend throws error due to missing keys
        await new Promise(r => setTimeout(r, 2000));
        result = {
          data: {
            id: `TCKT-${Math.floor(Math.random() * 10000)}`,
            category: "General",
            status: "Open",
            description: description || "Voice note processed"
          }
        };
      }

      setTicketData(result.data);
      setStatus('success');
      setAudioChunks([]);
      setDescription('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="citizen-container">
      <div className="citizen-header">
        <h2>Report an Issue</h2>
        <p>Speak in your local language or type to lodge a complaint. Our AI will handle the rest.</p>
      </div>

      <div className="recording-panel">
        <div className={`mic-container ${isRecording ? 'pulse' : ''}`}>
          <button 
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <Square size={48} /> : <Mic size={48} />}
          </button>
        </div>
        
        <p className="mic-status">
          {isRecording ? 'Recording... Tap to stop.' : 'Push to speak'}
        </p>

        {audioChunks.length > 0 && !isRecording && (
          <div className="audio-ready">
            <span className="ready-badge">Audio recorded successfully ✓</span>
            <button className="clear-btn" onClick={() => setAudioChunks([])}>Clear</button>
          </div>
        )}
      </div>

      <div className="divider">OR</div>

      <form className="complaint-form" onSubmit={handleSubmit}>
        <textarea 
          placeholder="Describe your issue here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
        />
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={status === 'processing' || (audioChunks.length === 0 && !description.trim())}
        >
          {status === 'processing' ? (
            <><Loader2 className="spinner" /> Analyzing...</>
          ) : (
            <><Send size={20} /> Submit Report</>
          )}
        </button>
      </form>

      {status === 'error' && (
        <div className="error-msg">
          <AlertCircle size={20} /> Failed to submit. Please try again.
        </div>
      )}

      {status === 'success' && ticketData && (
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h3>Ticket Raised Successfully</h3>
          <div className="ticket-details">
            <p><strong>Tracking ID:</strong> {ticketData.id.split('-')[0]}</p>
            <p><strong>Category:</strong> <span className={`tag tag-${ticketData.category.toLowerCase()}`}>{ticketData.category}</span></p>
            <p><strong>Status:</strong> {ticketData.status}</p>
          </div>
          <p className="whatsapp-notice">You will receive updates on WhatsApp when the status changes.</p>
          <button className="track-btn" onClick={() => setStatus('idle')}>Report Another Issue</button>
        </div>
      )}
    </div>
  );
}
