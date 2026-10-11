import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar d-flex flex-column p-3">
      {/* Brand Header */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2">
        <div
          className="d-flex align-items-center justify-content-center rounded-3 text-white"
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          }}
        >
          <i className="bi bi-shield-shaded fs-5"></i>
        </div>
        <div>
          <div className="fw-bold text-white fs-6">Admin Portal</div>
          <div className="text-secondary small">PhotoFlow Control</div>
        </div>
      </div>

      {/* Navigation List */}
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        <li className="nav-item">
          <NavLink end to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-people-fill"></i>
            <span>Manage Users</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/admin/photos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-images"></i>
            <span>Manage Photos</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/admin/albums" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-folder-check"></i>
            <span>Manage Albums</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/admin/face-records" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-bounding-box"></i>
            <span>Face Scans Log</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-graph-up-arrow"></i>
            <span>Reports & Stats</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/admin/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-gear"></i>
            <span>Admin Settings</span>
          </NavLink>
        </li>
      </ul>

      {/* Footer controls in sidebar */}
      <div className="pt-3 border-top border-secondary border-opacity-25 mt-auto">
        <Link to="/dashboard" className="btn btn-outline-light btn-sm w-100 mb-2 d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-arrow-left"></i>
          <span>Exit to User View</span>
        </Link>
        <button onClick={handleLogout} className="btn btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
