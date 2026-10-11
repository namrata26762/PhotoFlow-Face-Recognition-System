import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    try {
      const data = await authService.login({ email, password });
      if (data.success) {
        auth.login(data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login error');
    }
  };

  const handleDemoLogin = async (demo: 'admin' | 'user') => {
    const credentials = demo === 'admin'
      ? { email: 'admin@photoflow.com', password: 'admin123' }
      : { email: 'user@photoflow.com', password: 'user123' };
    try {
      const data = await authService.login(credentials);
      if (data.success) {
        auth?.login(data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.message || 'Demo login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Demo login error');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Sign In</button>
      </form>
      <hr style={{ margin: '1.5rem 0' }} />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => handleDemoLogin('admin')} style={{ flex: 1, padding: '0.5rem' }}>
          Demo Admin
        </button>
        <button onClick={() => handleDemoLogin('user')} style={{ flex: 1, padding: '0.5rem' }}>
          Demo User
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
