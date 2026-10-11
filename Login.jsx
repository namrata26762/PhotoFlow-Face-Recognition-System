import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      if (data.token) {
        login(data.token, data.user);
        if (redirectPath) {
          navigate(redirectPath);
        } else if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      setError(serverMsg || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin1@photoflow.com');
      setPassword('admin0123');
    } else {
      setEmail('user1@photoflow.com');
      setPassword('user0123');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-2xl border border-secondary border-opacity-25 position-relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div
              className="position-absolute"
              style={{
                top: '-50px',
                right: '-50px',
                width: '120px',
                height: '120px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                filter: 'blur(10px)',
                pointerEvents: 'none',
              }}
            ></div>

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-4 text-white p-3 mb-3 shadow"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.6)',
                }}
              >
                <i className="bi bi-camera2 fs-2"></i>
              </div>
              <h3 className="fw-black text-white mb-1">Welcome to PhotoFlow</h3>
              <p className="text-muted small">Sign in to access your smart AI photo cloud</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3 bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <i className="bi bi-envelope text-info"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-light">Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <i className="bi bi-lock text-info"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-2 rounded-3 fw-bold mb-3 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Login Auto-fill Helper */}
            <div className="p-3 rounded-3 border border-secondary border-opacity-25 text-center mb-3" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <div className="text-secondary small fw-semibold mb-2">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>
                Quick Demo Presets:
              </div>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info rounded-pill px-3"
                  onClick={() => fillCredentials('user')}
                >
                  <i className="bi bi-person-fill me-1"></i> Demo User
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning rounded-pill px-3"
                  onClick={() => fillCredentials('admin')}
                >
                  <i className="bi bi-shield-lock-fill me-1"></i> Demo Admin
                </button>
              </div>
            </div>

            <div className="text-center text-muted small">
              Don't have an account?{' '}
              <Link to="/register" className="text-info fw-semibold text-decoration-none">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
