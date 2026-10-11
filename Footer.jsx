import React from 'react';

const Footer = () => {
  return (
    <footer className="border-top border-secondary border-opacity-25 py-4 mt-auto" style={{ background: 'rgba(7, 9, 14, 0.9)' }}>
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <span className="brand-gradient fw-bold fs-5">PhotoFlow</span>
              <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25">
              
              </span>
            </div>
            <p className="text-muted small mb-0">
              AI-Powered Facial Recognition & Intelligent Cloud Photo Management System.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-2 mb-2">
              <span className="badge bg-dark text-info border border-secondary border-opacity-50">React.js</span>
              <span className="badge bg-dark text-info border border-secondary border-opacity-50">Node.js</span>
              <span className="badge bg-dark text-info border border-secondary border-opacity-50">Express.js</span>
              <span className="badge bg-dark text-info border border-secondary border-opacity-50">MongoDB</span>
              <span className="badge bg-dark text-info border border-secondary border-opacity-50">Face-API AI</span>
            </div>
            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              &copy; {new Date().getFullYear()} PhotoFlow. Academic Project Submission & Demonstration.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
