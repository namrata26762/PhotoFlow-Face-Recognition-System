import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { LayoutDashboard, Image, FolderOpen, Upload as UploadIcon, ScanFace, UserCircle, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper NavItem component
  const NavItem = ({ to, label, icon: Icon }) => (
    <li className="nav-item text-center mx-2">
      <NavLink
        to={to}
        className={({ isActive }) => `nav-link d-flex flex-column align-items-center ${isActive ? 'active' : ''}`}
      >
        {Icon && <Icon size={20} className="mb-1" aria-hidden="true" />}
        <span>{label}</span>
      </NavLink>
    </li>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top glass-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          PhotoFlow
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem to="/gallery" label="Gallery" icon={Image} />
            <NavItem to="/albums" label="Albums" icon={FolderOpen} />
            <NavItem to="/upload" label="Upload" icon={UploadIcon} />
            <NavItem to="/face-search" label="Live Face Scanner" icon={ScanFace} />
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <Link className="btn btn-outline-light me-2 d-flex flex-column align-items-center" to="/profile">
                  <UserCircle size={20} className="mb-1" aria-hidden="true" />
                  <span>Profile</span>
                </Link>
                {user.role === 'admin' && (
                  <Link className="btn btn-outline-light me-2 d-flex flex-column align-items-center" to="/admin">
                    <Shield size={20} className="mb-1" aria-hidden="true" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="dropdown">
                  <button
                    className="btn btn-outline-light dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.role === 'admin' ? 'Admin Demo' : 'User Demo'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    {user.role === 'admin' ? (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/admin/profile">
                            Admin Profile
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>
                            Logout
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link className="dropdown-item" to="/profile">
                            Profile
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item" onClick={handleLogout}>
                            Logout
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <Link className="btn btn-outline-light" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
