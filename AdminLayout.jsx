import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#07090e' }}>
      {/* Top Admin Bar */}
      <header
        className="navbar sticky-top px-3 py-2 shadow-lg border-bottom border-secondary border-opacity-25"
        style={{ background: 'rgba(11, 15, 25, 0.95)', backdropFilter: 'blur(16px)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin" className="navbar-brand d-flex align-items-center gap-2 mb-0">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #e11d48 0%, #f59e0b 100%)',
                boxShadow: '0 0 15px rgba(225, 29, 72, 0.5)',
              }}
            >
              <i className="bi bi-shield-shaded fs-5"></i>
            </div>
            <span className="brand-gradient fs-5 fw-black">PhotoFlow</span>
            <span className="badge bg-danger rounded-pill px-2 small">ADMIN PORTAL</span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Link to="/dashboard" className="btn btn-sm btn-outline-info rounded-pill px-3 d-none d-md-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-arrow-left me-1"></i> User Workspace
          </Link>
          <div className="d-flex align-items-center gap-2 text-white">
            <div
              className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold shadow"
              style={{ width: '32px', height: '32px', fontSize: '13px' }}
            >
              A
            </div>
            <span className="d-none d-sm-inline small fw-semibold text-light">{user?.name || 'System Admin'}</span>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-3 p-md-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
