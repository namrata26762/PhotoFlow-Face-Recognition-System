import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const ManageAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAlbums();
      if (res.success) {
        setAlbums(res.albums || []);
      }
    } catch (err) {
      console.error('Error fetching admin albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleDelete = async (album) => {
    if (window.confirm(`Delete album "${album.name}" created by ${album.userId?.name || 'User'}?`)) {
      try {
        await adminService.deleteAlbum(album._id);
        setAlbums((prev) => prev.filter((a) => a._id !== album._id));
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting album.');
      }
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Platform Albums</h3>
          <p className="text-muted small mb-0">Overview of all photo collections created across user accounts</p>
        </div>
      </div>

      <div className="card-solid p-0 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Cover</th>
                <th>Album Name</th>
                <th>Created By</th>
                <th>Photos Count</th>
                <th>Created At</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading albums...
                  </td>
                </tr>
              ) : albums.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No albums created yet.
                  </td>
                </tr>
              ) : (
                albums.map((alb) => (
                  <tr key={alb._id}>
                    <td style={{ width: '60px' }}>
                      {alb.coverImage ? (
                        <img
                          src={alb.coverImage}
                          alt={alb.name}
                          className="rounded-2"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-2 bg-light d-flex align-items-center justify-content-center text-muted"
                          style={{ width: '48px', height: '48px' }}
                        >
                          <i className="bi bi-folder-fill fs-5"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{alb.name}</div>
                      {alb.description && (
                        <div className="text-muted small text-truncate" style={{ maxWidth: '240px' }}>
                          {alb.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{alb.userId?.name || 'Unknown'}</div>
                      <div className="text-muted small">{alb.userId?.email}</div>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {alb.photoCount || 0} Photos
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(alb.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger rounded-circle p-2"
                        title="Delete Album"
                        onClick={() => handleDelete(alb)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
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

export default ManageAlbums;
