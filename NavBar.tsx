import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar: React.FC = () => {
  const location = useLocation();
  const auth = useContext(AuthContext);

  const linkStyle = (path: string) => ({
    marginRight: '1rem',
    textDecoration: location.pathname === path ? 'underline' : 'none',
    color: location.pathname === path ? '#1976d2' : '#555',
  });

  const handleLogout = () => {
    if (auth) auth.logout();
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}>
      {auth?.isAuthenticated ? (
        <>
          <Link to={auth.isAdmin ? '/admin' : '/dashboard'} style={linkStyle(auth.isAdmin ? '/admin' : '/dashboard')}>Dashboard</Link>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={linkStyle('/login')}>Login</Link>
          <Link to="/register" style={linkStyle('/register')}>Register</Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;
