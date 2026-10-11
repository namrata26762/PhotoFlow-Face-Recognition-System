import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Ambient Lights */}
      <section className="py-5 py-md-6 position-relative">
        <div className="container py-4">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-dark border border-secondary border-opacity-50 mb-3 shadow-sm">
                <span className="badge bg-primary rounded-pill px-2">AI 2.0</span>
                <span className="text-light small fw-semibold">Next-Gen Facial Vector Recognition</span>
              </div>
              <h1 className="display-4 fw-black text-white tracking-tight mb-3">
             Organize & Find Photo With.<span className="brand-gradient">AI Face Recognition</span>
              </h1>
              <p className="lead text-muted mb-4">
               Upload photos, share access codes with clients, and let Al facial recognition automatically find each person's photos. Simple. Fast. Professional.
              </p>

              <div className="d-flex flex-wrap gap-3 mb-4">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-gradient-primary btn-lg rounded-pill px-5 shadow-lg">
                    Open Dashboard <i className="bi bi-arrow-right ms-2"></i>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-gradient-primary btn-lg rounded-pill px-5 shadow-lg">
                      Explore PhotoFlow <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                    <Link to="/register" className="btn btn-outline-light btn-lg rounded-pill px-4">
                      Create Free Account
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Demo Credentials Card */}
              <div className="glass-card p-3 d-inline-block border border-secondary border-opacity-25 shadow-lg">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-shield-check text-warning fs-5"></i>
                  <span className="fw-bold small text-white">Evaluation Credentials (1-Click Ready):</span>
                </div>
                <div className="d-flex flex-wrap gap-3 small text-muted">
                  <div>
                    <span className="badge bg-primary-subtle text-info border border-info border-opacity-25 me-1">Admin:</span>
                    <code className="text-light">admin@photoflow.com</code> / <code className="text-light">admin123</code>
                  </div>
                  <div>
                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25 me-1">User:</span>
                    <code className="text-light">user@photoflow.com</code> / <code className="text-light">user123</code>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Tech Visual Interactive Card */}
            <div className="col-lg-6">
              <div className="position-relative">
                {/* Visual Representation of Face Matching */}
                <div className="glass-card p-4 rounded-4 shadow-lg position-relative z-1 border border-primary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-danger rounded-circle p-1"></span>
                      <span className="badge bg-warning rounded-circle p-1"></span>
                      <span className="badge bg-success rounded-circle p-1"></span>
                      <span className="fw-bold text-light small ms-1">AI Face Biometric Pipeline</span>
                    </div>
                    <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50 fw-bold">
                      <i className="bi bi-broadcast me-1"></i> Live Euclidean Engine
                    </span>
                  </div>

                  <div className="row g-3 align-items-center">
                    <div className="col-5">
                      <div className="scanner-container p-2 text-center position-relative">
                        <div className="hud-corner-tl"></div>
                        <div className="hud-corner-tr"></div>
                        <div className="hud-corner-bl"></div>
                        <div className="hud-corner-br"></div>
                        <div className="scan-line"></div>
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          alt="Face query"
                          className="img-fluid rounded-3"
                          style={{ maxHeight: '180px', objectFit: 'cover', width: '100%' }}
                        />
                        <div className="small fw-semibold text-info mt-2">
                          <i className="bi bi-camera-fill me-1"></i> Target Query
                        </div>
                      </div>
                    </div>

                    <div className="col-2 text-center">
                      <div
                        className="rounded-circle bg-primary text-white p-3 d-inline-flex shadow"
                        style={{ boxShadow: '0 0 20px rgba(99, 102, 241, 0.7)' }}
                      >
                        <i className="bi bi-arrow-right fs-4"></i>
                      </div>
                      <div className="text-secondary small fw-bold mt-2" style={{ fontSize: '0.7rem' }}>128-D VECTOR</div>
                    </div>

                    <div className="col-5">
                      <div className="d-flex flex-column gap-2">
                        <div className="p-2 border border-secondary border-opacity-25 rounded-3 bg-dark d-flex align-items-center gap-2 shadow-sm">
                          <img
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
                            alt="Match 1"
                            className="rounded-2"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="badge-confidence-high small">98.4% Match</div>
                            <div className="small text-light text-truncate" style={{ maxWidth: '90px' }}>Campus_Event.jpg</div>
                          </div>
                        </div>

                        <div className="p-2 border border-secondary border-opacity-25 rounded-3 bg-dark d-flex align-items-center gap-2 shadow-sm">
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80"
                            alt="Match 2"
                            className="rounded-2"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="badge-confidence-high small">94.1% Match</div>
                            <div className="small text-light text-truncate" style={{ maxWidth: '90px' }}>Farewell_Day.jpg</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between text-muted small">
                    <span><i className="bi bi-cpu-fill me-1 text-info"></i> Euclidean Distance Metric</span>
                    <span><i className="bi bi-database-check me-1 text-success"></i> MongoDB Vector DB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-black text-white">Full-Stack Academic Architecture</h2>
            <p className="text-muted">Engineered strictly according to Master / BCA Final Year guidelines</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-solid p-4 h-100">
                <div
                  className="rounded-3 p-3 d-inline-flex mb-3 shadow"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)' }}
                >
                  <i className="bi bi-camera-video-fill fs-3 text-white"></i>
                </div>
                <h5 className="fw-bold text-white">Live Camera Face Scanner</h5>
                <p className="text-muted small">
                  Open live webcam stream to scan your face directly with animated HUD targeting brackets, real-time facial landmark detection, and instantaneous cloud matching.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-solid p-4 h-100">
                <div
                  className="rounded-3 p-3 d-inline-flex mb-3 shadow"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}
                >
                  <i className="bi bi-folder-fill fs-3 text-white"></i>
                </div>
                <h5 className="fw-bold text-white">Dynamic Photo Albums</h5>
                <p className="text-muted small">
                  Organize large photo collections into customized albums with cover previews, batch uploads, full-resolution image downloads, and instant keyword searches.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card-solid p-4 h-100">
                <div
                  className="rounded-3 p-3 d-inline-flex mb-3 shadow"
                  style={{ background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)' }}
                >
                  <i className="bi bi-shield-lock-fill fs-3 text-white"></i>
                </div>
                <h5 className="fw-bold text-white">Centralized Admin Moderation</h5>
                <p className="text-muted small">
                  Dedicated administrative control center: monitor user activity, block malicious accounts, audit facial query logs, and inspect platform analytics reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
