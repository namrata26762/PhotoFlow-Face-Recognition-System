import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import PhotoModal from '../../components/PhotoModal';

const ManagePhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPhotos({ search });
      if (res.success) {
        setPhotos(res.photos || []);
      }
    } catch (err) {
      console.error('Error fetching admin photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPhotos();
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (photo) => {
    if (window.confirm(`Delete photo "${photo.title}" uploaded by ${photo.userId?.name || 'User'}?`)) {
      try {
        await adminService.deletePhoto(photo._id);
        setPhotos((prev) => prev.filter((p) => p._id !== photo._id));
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting photo.');
      }
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Platform Photo Moderation</h3>
          <p className="text-muted small mb-0">Review all uploaded photos across users and remove inappropriate media</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-solid p-3 mb-4 shadow-sm">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0 text-muted">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search photo titles across the system..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Photos Table / Grid */}
      <div className="card-solid p-0 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Thumbnail</th>
                <th>Title & Details</th>
                <th>Uploaded By</th>
                <th>Album</th>
                <th>Faces</th>
                <th>Uploaded At</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading photos...
                  </td>
                </tr>
              ) : photos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No photos found in database.
                  </td>
                </tr>
              ) : (
                photos.map((p) => (
                  <tr key={p._id}>
                    <td style={{ width: '60px' }}>
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="rounded-2 shadow-sm"
                        style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setSelectedPhoto(p)}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{p.title}</div>
                      {p.description && (
                        <div className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{p.userId?.name || 'Unknown'}</div>
                      <div className="text-muted small">{p.userId?.email}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {p.albumId?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info border border-info-subtle">
                        {p.facesDetected || 0} Face(s)
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          className="btn btn-sm btn-light border rounded-circle p-2"
                          title="Preview"
                          onClick={() => setSelectedPhoto(p)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-circle p-2"
                          title="Delete Photo"
                          onClick={() => handleDelete(p)}
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

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
};

export default ManagePhotos;
