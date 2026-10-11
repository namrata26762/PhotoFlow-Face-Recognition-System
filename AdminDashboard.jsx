import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">System Overview</h3>
          <p className="text-muted small mb-0">Live statistics and platform moderation control</p>
        </div>

        <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={fetchStats}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card-solid p-3 border-start border-primary border-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Users</span>
                <h3 className="fw-bold mb-0 text-dark mt-1">
                  {loading ? '...' : data?.stats?.totalUsers}
                </h3>
                <span className="small text-success mt-1 d-block">
                  <i className="bi bi-check2-circle me-1"></i>
                  {data?.stats?.activeUsers || 0} Active Accounts
                </span>
              </div>
              <div className="rounded-3 bg-primary-subtle text-primary p-3">
                <i className="bi bi-people-fill fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card-solid p-3 border-start border-info border-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Photos</span>
                <h3 className="fw-bold mb-0 text-dark mt-1">
                  {loading ? '...' : data?.stats?.totalPhotos}
                </h3>
                <span className="small text-info mt-1 d-block">
                  <i className="bi bi-cloud-check me-1"></i> Hosted Photos
                </span>
              </div>
              <div className="rounded-3 bg-info-subtle text-info p-3">
                <i className="bi bi-images fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card-solid p-3 border-start border-warning border-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Albums</span>
                <h3 className="fw-bold mb-0 text-dark mt-1">
                  {loading ? '...' : data?.stats?.totalAlbums}
                </h3>
                <span className="small text-warning mt-1 d-block">
                  <i className="bi bi-folder-check me-1"></i> Categorized
                </span>
              </div>
              <div className="rounded-3 bg-warning-subtle text-warning p-3">
                <i className="bi bi-folder2-open fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card-solid p-3 border-start border-success border-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Face Scans</span>
                <h3 className="fw-bold mb-0 text-dark mt-1">
                  {loading ? '...' : data?.stats?.totalScans}
                </h3>
                <span className="small text-success mt-1 d-block">
                  <i className="bi bi-cpu me-1"></i> Vector Matches
                </span>
              </div>
              <div className="rounded-3 bg-success-subtle text-success p-3">
                <i className="bi bi-stars fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="row g-4">
        {/* Recent Users */}
        <div className="col-lg-6">
          <div className="card-solid p-4 h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark">Recent Users</h5>
              <Link to="/admin/users" className="small text-primary text-decoration-none">
                View All
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentUsers?.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="fw-bold text-dark">{u.name}</div>
                        <div className="text-muted text-truncate" style={{ maxWidth: '160px' }}>
                          {u.email}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentUsers || data.recentUsers.length === 0) && (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">
                        No registered users yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Photos */}
        <div className="col-lg-6">
          <div className="card-solid p-4 h-100 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 text-dark">Recent Photo Uploads</h5>
              <Link to="/admin/photos" className="small text-primary text-decoration-none">
                View All
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title & Uploader</th>
                    <th>Faces</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentPhotos?.map((p) => (
                    <tr key={p._id}>
                      <td style={{ width: '50px' }}>
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="rounded-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '140px' }}>
                          {p.title}
                        </div>
                        <div className="text-muted text-truncate" style={{ maxWidth: '140px' }}>
                          By: {p.userId?.name || 'Unknown'}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.facesDetected || 0}
                        </span>
                      </td>
                      <td className="text-muted">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentPhotos || data.recentPhotos.length === 0) && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No photos uploaded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
