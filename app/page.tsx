'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: '¡Hola! Soy Mentali, tu psicólogo virtual. Estoy aquí para escucharte y apoyarte. ¿En qué te gustaría hablar hoy? 🌱' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }] 
        }),
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error. Por favor, intenta de nuevo.' 
      }]);
    }
    setLoading(false);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🌱 Mentali</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Tu psicólogo virtual con IA</p>
      </div>

      {/* Chat Container */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '300px',
          maxHeight: '60vh'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 18px',
              borderRadius: msg.role === 'user' 
                ? '20px 20px 5px 20px' 
                : '20px 20px 20px 5px',
              backgroundColor: msg.role === 'user' ? '#667eea' : '#f0f0f0',
              color: msg.role === 'user' ? 'white' : '#333',
              fontSize: '1rem',
              lineHeight: 1.5,
              animation: 'fadeIn 0.3s ease'
            }}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '12px 18px',
              backgroundColor: '#f0f0f0',
              borderRadius: '20px 20px 20px 5px',
            }}>
              <span style={{ animation: 'pulse 1s infinite' }}>💭 Pensando...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: '15px',
          borderTop: '1px solid #eee',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe tu mensaje..."
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '25px',
              border: '2px solid #eee',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#eee'}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 25px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: loading || !input.trim() ? '#ccc' : '#667eea',
              color: 'white',
              fontSize: '1rem',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, background-color 0.2s'
            }}
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: 'white',
        opacity: 0.8,
        fontSize: '0.9rem'
      }}>
        <p>🌍 Disponible también como app móvil</p>
        <p style={{ marginTop: '5px' }}>
          <a href="https://github.com/vollwebch/mentali-app" 
             target="_blank" 
             rel="noopener noreferrer"
             style={{ color: 'white', textDecoration: 'underline' }}>
            Ver en GitHub
          </a>
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </main>
  );
}
