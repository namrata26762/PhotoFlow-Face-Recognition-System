import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import albumService from '../../services/albumService';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const res = await albumService.getAlbums();
      if (res.success) {
        setAlbums(res.albums || []);
      }
    } catch (err) {
      console.error('Error fetching albums:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!albumName.trim()) {
      setError('Please provide an album name.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', albumName);
      formData.append('description', description);
      if (coverFile) {
        formData.append('coverImage', coverFile);
      }

      const res = await albumService.createAlbum(formData);
      if (res.success) {
        setShowModal(false);
        setAlbumName('');
        setDescription('');
        setCoverFile(null);
        fetchAlbums();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating album.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (albumId, albumName) => {
    const deletePhotos = window.confirm(
      `Do you want to delete photos inside "${albumName}" as well?\nClick OK to delete photos too, or Cancel to keep photos uncategorized.`
    );

    try {
      await albumService.deleteAlbum(albumId, deletePhotos);
      fetchAlbums();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting album.');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-black mb-1 text-white">Smart Photo Collections</h3>
          <p className="text-muted small mb-0">Group your photos into themed categories and events</p>
        </div>

        <button
          className="btn btn-gradient-primary rounded-pill px-4 shadow d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-folder-plus"></i>
          <span>Create New Album</span>
        </button>
      </div>

      {/* Albums Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="text-muted small mt-2">Loading albums...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="card-solid p-5 text-center my-4">
          <i className="bi bi-folder2-open fs-1 text-muted mb-2"></i>
          <h5 className="text-white">No Albums Found</h5>
          <p className="text-muted small">Create your first album to keep memories neatly organized.</p>
          <button className="btn btn-gradient-primary rounded-pill px-4" onClick={() => setShowModal(true)}>
            Create Album
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {albums.map((album) => (
            <div key={album._id} className="col-sm-6 col-lg-4">
              <div className="card-solid h-100 overflow-hidden d-flex flex-column shadow-lg border border-secondary border-opacity-25">
                <Link to={`/albums/${album._id}`} className="text-decoration-none">
                  <div
                    className="position-relative d-flex align-items-center justify-content-center"
                    style={{ height: '190px', overflow: 'hidden', background: '#090d18' }}
                  >
                    {album.coverImage ? (
                      <img
                        src={album.coverImage}
                        alt={album.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-center text-muted">
                        <i className="bi bi-images fs-1 text-secondary opacity-50"></i>
                        <div className="small mt-1 text-secondary">No Cover Image</div>
                      </div>
                    )}
                    <span className="badge bg-dark bg-opacity-80 text-info border border-info border-opacity-25 position-absolute bottom-0 end-0 m-2 shadow">
                      <i className="bi bi-image me-1"></i>
                      {album.photoCount || 0} {album.photoCount === 1 ? 'Photo' : 'Photos'}
                    </span>
                  </div>
                </Link>

                <div className="p-3 d-flex flex-column justify-content-between flex-grow-1 bg-transparent">
                  <div>
                    <Link to={`/albums/${album._id}`} className="text-decoration-none text-white">
                      <h5 className="fw-bold mb-1 text-truncate" title={album.name}>
                        {album.name}
                      </h5>
                    </Link>
                    {album.description && (
                      <p className="text-muted small text-truncate mb-3" title={album.description}>
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                    <Link
                      to={`/albums/${album._id}`}
                      className="btn btn-sm btn-outline-info rounded-pill px-3"
                    >
                      Open Collection
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-2"
                      title="Delete Album"
                      onClick={() => handleDeleteAlbum(album._id, album.name)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Album Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border border-secondary border-opacity-25 rounded-4 shadow-2xl">
              <div className="modal-header border-bottom border-secondary border-opacity-25 pb-3">
                <h5 className="modal-title fw-black text-white">
                  <i className="bi bi-folder-plus text-info me-2"></i> Create New Album
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAlbum}>
                <div className="modal-body py-4">
                  {error && (
                    <div className="alert alert-danger py-2 small rounded-3 mb-3 bg-danger bg-opacity-25 border-danger border-opacity-50 text-danger">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-light">Album Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Graduation Ceremony 2026"
                      value={albumName}
                      onChange={(e) => setAlbumName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-light">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Short notes about this collection..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold text-light">Cover Photo (Optional)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top border-secondary border-opacity-25 pt-3 justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gradient-primary rounded-pill px-4 shadow"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Album'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Albums;
