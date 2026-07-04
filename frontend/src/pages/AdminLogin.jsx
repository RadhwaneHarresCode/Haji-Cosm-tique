import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

// ← يجب أن يكون هذا في ملف .env كـ REACT_APP_API_URL=http://localhost:5000
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.password) { setError('Entrez votre mot de passe.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      // Si le serveur n'est pas démarré ou retourne HTML
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Le serveur backend n\'est pas démarré (port 5000). Lancez : cd backend && npm run dev');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identifiants incorrects.');

      localStorage.setItem('haji_token', data.token);
      localStorage.setItem('haji_admin_user', data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al">
      <div className="al__card">
        <div className="al__logo">🔐 Haji Admin</div>
        <p className="al__sub">Panneau d'administration sécurisé</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="rf-field" style={{ marginBottom: '16px', textAlign:'left' }}>
            <label className="rf-label">Nom d'utilisateur</label>
            <input
              className="rf-input"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            />
          </div>
          <div className="rf-field" style={{ marginBottom: '20px', textAlign:'left' }}>
            <label className="rf-label">Mot de passe</label>
            <input
              className="rf-input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>

          {error && (
            <div className="al__error">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Connexion…' : 'Se connecter →'}
          </button>
        </form>
      </div>
    </div>
  );
}
