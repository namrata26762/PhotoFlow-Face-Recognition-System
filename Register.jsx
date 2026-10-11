import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({ fullName, email, password });
      if (data.success && data.token) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-2xl border border-secondary border-opacity-25 position-relative overflow-hidden">
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-4 text-white p-3 mb-3 shadow"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  boxShadow: '0 0 25px rgba(99, 102, 241, 0.6)',
                }}
              >
                <i className="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h3 className="fw-black text-white mb-1">Create Account</h3>
              <p className="text-muted small">Join PhotoFlow to start organizing photos with AI</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-3 bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <i className="bi bi-person text-info"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <i className="bi bi-envelope text-info"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <i className="bi bi-lock text-info"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-light">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <i className="bi bi-lock-fill text-info"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Creating Account...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </button>
            </form>

            <div className="text-center text-muted small">
              Already have an account?{' '}
              <Link to="/login" className="text-info fw-semibold text-decoration-none">
                Log in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
