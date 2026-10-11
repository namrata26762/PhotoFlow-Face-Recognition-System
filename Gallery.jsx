import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import photoService from '../../services/photoService';
import albumService from '../../services/albumService';
import PhotoCard from '../../components/PhotoCard';
import PhotoModal from '../../components/PhotoModal';
import EditPhotoModal from '../../components/EditPhotoModal';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
// Pagination removed – displaying all photos in a single page
// const [page, setPage] = useState(1);
// const [limit] = useState(12); // default page size
// const [totalPages, setTotalPages] = useState(1);
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      // Request all photos (no pagination)
      const params = { limit: 10000 }; // large limit to fetch all
      if (selectedAlbum) params.albumId = selectedAlbum;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await photoService.getUserPhotos(params);
      // Ensure photos array is set even if success flag is missing
      setPhotos((res && res.photos) ? res.photos : []);

    } catch (err) {
      console.error('Error fetching gallery photos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load albums on mount
  useEffect(() => {
    const loadAlbums = async () => {
      try {
        const res = await albumService.getAlbums();
        if (res.success) setAlbums(res.albums || []);
      } catch (e) {
        console.error('Albums load error:', e);
      }
    };
    loadAlbums();
  }, []);

// Fetch photos when filters change
useEffect(() => {
  const delayDebounce = setTimeout(() => {
    fetchPhotos();
  }, 250);
  return () => clearTimeout(delayDebounce);
}, [selectedAlbum, searchQuery]);

  const handleDeletePhoto = async (photoId) => {
    try {
      await photoService.deletePhoto(photoId);
      fetchPhotos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting photo.');
    }
  };

  const handleEditClick = (photo) => {
    setEditPhoto(photo);
    setShowEditModal(true);
  };

  const handleEditSave = async (data) => {
    if (!editPhoto) return;
    try {
      await photoService.updatePhoto(editPhoto._id, data);
      setShowEditModal(false);
      setEditPhoto(null);
      fetchPhotos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating photo.');
    }
  };

  return (
    <div className="container py-4">
      {/* Header with Search & Filters */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-black mb-1 text-white">Biometric Photo Gallery</h3>
          <p className="text-muted small mb-0">Browse, filter, and download all photos with detected faces</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/upload" className="btn btn-gradient-primary rounded-pill px-4 shadow">
            <i className="bi bi-cloud-arrow-up me-2"></i> Upload Photos
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-solid p-3 mb-4 shadow-sm border border-secondary border-opacity-25">
        <div className="row g-2 align-items-center">
          <div className="col-md-7">
            <div className="input-group">
              <span className="input-group-text border-end-0 text-info">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search photos by title, tags or metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-dark border border-start-0 text-muted"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>
          <div className="col-md-5">
            <select
              className="form-select"
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
            >
              <option value="">All Albums ({photos.length} photos)</option>
              <option value="uncategorized">Uncategorized Photos</option>
              {albums.map((alb) => (
                <option key={alb._id} value={alb._id}>
                  {alb.name} ({alb.photoCount || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="text-muted small mt-2">Loading gallery photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="card-solid p-5 text-center my-4">
          <i className="bi bi-images fs-1 text-muted mb-2"></i>
          <h5 className="text-white">No Photos Found</h5>
          <p className="text-muted small">
            {searchQuery || selectedAlbum
              ? 'Try adjusting your search query or album filter.'
              : 'Upload photos or use camera capture to fill your library.'}
          </p>
          <Link to="/upload" className="btn btn-gradient-primary rounded-pill px-4">
            Upload Photos
          </Link>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo) => (
            <PhotoCard
              key={photo._id}
              photo={photo}
              onPreview={(p) => setSelectedPhoto(p)}
              onDelete={handleDeletePhoto}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}

      

{/* Lightbox Preview */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}

      {/* Edit Photo Modal */}
      {showEditModal && editPhoto && (
        <EditPhotoModal
          photo={editPhoto}
          albums={albums}
          onClose={() => { setShowEditModal(false); setEditPhoto(null); }}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default Gallery;
