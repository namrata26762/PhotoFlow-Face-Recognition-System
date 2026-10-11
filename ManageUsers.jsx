import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleStatus = async (user) => {
    const action = user.status === 'active' ? 'Block' : 'Activate';
    if (window.confirm(`${action} user ${user.name}?`)) {
      try {
        await adminService.toggleUserStatus(user._id);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error updating status.');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${user.name}"?\nALL their photos, albums, and face recognition records will be permanently erased!`
      )
    ) {
      try {
        await adminService.deleteUser(user._id);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user.');
      }
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Manage Registered Users</h3>
          <p className="text-muted small mb-0">Control user accounts, view usage metrics, and enforce moderation</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-solid p-3 mb-4 shadow-sm">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-solid p-0 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>User Details</th>
                <th>Photos</th>
                <th>Albums</th>
                <th>Face Scans</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {u.profileImage ? (
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <div className="text-muted small">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {u.photoCount || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {u.albumCount || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info border border-info-subtle">
                        {u.scanCount || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          className={`btn btn-sm ${u.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'} rounded-pill px-3`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'active' ? 'Block' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle p-2"
                          title="Delete User"
                          onClick={() => handleDeleteUser(u)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
