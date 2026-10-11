import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import albumService from '../../services/albumService';
import photoService from '../../services/photoService';
import PhotoCard from '../../components/PhotoCard';
import PhotoModal from '../../components/PhotoModal';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchAlbumData = async () => {
    try {
      setLoading(true);
      const res = await albumService.getAlbumById(id);
      if (res.success) {
        setAlbum(res.album);
        setPhotos(res.photos || []);
      }
    } catch (err) {
      console.error('Error fetching album:', err);
      navigate('/albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbumData();
  }, [id]);

  const handleDeletePhoto = async (photoId) => {
    try {
      await photoService.deletePhoto(photoId);
      fetchAlbumData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting photo.');
    }
  };

  return (
    <div className="container py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/albums" className="text-info text-decoration-none">
              <i className="bi bi-folder2 me-1"></i> Albums
            </Link>
          </li>
          <li className="breadcrumb-item active text-light opacity-75" aria-current="page">
            {album?.name || 'Loading...'}
          </li>
        </ol>
      </nav>

      {/* Album Header Banner */}
      {album && (
        <div className="card-solid p-4 mb-4 shadow-xl border border-secondary border-opacity-25">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 bg-primary bg-opacity-20 text-info d-flex align-items-center justify-content-center border border-info border-opacity-25 shadow"
                style={{ width: '56px', height: '56px' }}
              >
                <i className="bi bi-folder-fill fs-2"></i>
              </div>
              <div>
                <h3 className="fw-black mb-0 text-white">{album.name}</h3>
                {album.description && (
                  <p className="text-muted small mb-0 mt-1">{album.description}</p>
                )}
                <span className="badge bg-dark text-info border border-info border-opacity-25 small mt-2">
                  <i className="bi bi-images me-1"></i>
                  {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
                </span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/upload"
                state={{ albumId: album._id }}
                className="btn btn-gradient-primary rounded-pill px-4 shadow"
              >
                <i className="bi bi-cloud-arrow-up me-2"></i> Add Photos to Album
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="text-muted small mt-2">Loading album photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="card-solid p-5 text-center my-4">
          <i className="bi bi-camera fs-1 text-muted mb-2"></i>
          <h5 className="text-white">No Photos in this Album Yet</h5>
          <p className="text-muted small">Upload photos or capture with camera to add memories here.</p>
          <Link
            to="/upload"
            state={{ albumId: album?._id }}
            className="btn btn-gradient-primary rounded-pill px-4"
          >
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
            />
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
};

export default AlbumDetail;
