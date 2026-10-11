import React from 'react';
import { Outlet } from 'react-router-dom';

// AuthLayout renders only the outlet for authentication pages (login, register, forgot/reset password)
// It intentionally does NOT include the Navbar or Footer.
const AuthLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
