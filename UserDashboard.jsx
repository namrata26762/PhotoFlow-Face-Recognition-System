import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import photoService from '../../services/photoService';
import albumService from '../../services/albumService';
import faceService from '../../services/faceService';
import PhotoCard from '../../components/PhotoCard';
import PhotoModal from '../../components/PhotoModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ photos: 0, albums: 0, scans: 0 });
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [photosRes, albumsRes, scansRes] = await Promise.all([
        photoService.getUserPhotos(),
        albumService.getAlbums(),
        faceService.getHistory(),
      ]);

      const photos = photosRes.photos || [];
      const albums = albumsRes.albums || [];
      const scans = scansRes.history || [];

      setStats({
        photos: photos.length,
        albums: albums.length,
        scans: scans.length,
      });

      setRecentPhotos(photos.slice(0, 6));
      setRecentAlbums(albums.slice(0, 3));
      setRecentScans(scans.slice(0, 3));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeletePhoto = async (photoId) => {
    try {
      await photoService.deletePhoto(photoId);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting photo.');
    }
  };

  return (
    <div className="container py-4">
      {/* Master Hero Banner */}
      <div
        className="rounded-4 p-4 p-md-5 mb-5 text-white position-relative overflow-hidden shadow-2xl border border-primary border-opacity-30"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #0f172a 100%)',
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.3)',
        }}
      >
        <div className="row align-items-center position-relative z-1">
          <div className="col-lg-8">
            <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-25 rounded-pill px-3 py-1 mb-3">
              <i className="bi bi-stars me-1"></i> AI Facial Recognition Workspace
            </span>
            <h2 className="display-6 fw-black mb-2">Welcome Back, {user?.name || 'User'}! 👋</h2>
            <p className="lead mb-4 opacity-90 small text-light">
              Your biometric photo library is ready. Capture photos directly via camera, group memories into smart albums, or find any person with AI.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link to="/upload" className="btn btn-gradient-primary fw-bold rounded-pill px-4 shadow">
                <i className="bi bi-cloud-arrow-up me-2"></i> Upload Photos
              </Link>
              <Link to="/face-search" className="btn btn-outline-info fw-bold rounded-pill px-4 shadow-sm">
                <i className="bi bi-camera-video-fill me-2"></i> Live Camera Scanner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="small text-uppercase fw-bold text-light opacity-75">Indexed Photos</div>
              <div className="rounded-3 bg-white bg-opacity-20 p-2 d-inline-flex">
                <i className="bi bi-images fs-4"></i>
              </div>
            </div>
            <h2 className="display-5 fw-black mb-0">{loading ? '...' : stats.photos}</h2>
            <div className="small opacity-75 mt-2">
              <Link to="/gallery" className="text-white text-decoration-none fw-semibold">
                Explore Gallery <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #06b6d4 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="small text-uppercase fw-bold text-light opacity-75">Photo Albums</div>
              <div className="rounded-3 bg-white bg-opacity-20 p-2 d-inline-flex">
                <i className="bi bi-folder2-open fs-4"></i>
              </div>
            </div>
            <h2 className="display-5 fw-black mb-0">{loading ? '...' : stats.albums}</h2>
            <div className="small opacity-75 mt-2">
              <Link to="/albums" className="text-white text-decoration-none fw-semibold">
                Manage Collections <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="small text-uppercase fw-bold text-light opacity-75">Face Scans</div>
              <div className="rounded-3 bg-white bg-opacity-20 p-2 d-inline-flex">
                <i className="bi bi-cpu-fill fs-4"></i>
              </div>
            </div>
            <h2 className="display-5 fw-black mb-0">{loading ? '...' : stats.scans}</h2>
            <div className="small opacity-75 mt-2">
              <Link to="/recognition-history" className="text-white text-decoration-none fw-semibold">
                View Search Audits <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Albums Section */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-black mb-0 text-white">Smart Albums</h4>
            <p className="text-muted small mb-0">Categorized collections of your uploaded photos</p>
          </div>
          <Link to="/albums" className="btn btn-sm btn-outline-info rounded-pill px-4">
            View All
          </Link>
        </div>

        {recentAlbums.length === 0 && !loading ? (
          <div className="card-solid p-4 text-center">
            <i className="bi bi-folder-plus fs-1 text-muted mb-2"></i>
            <h6 className="text-white">No Albums Created Yet</h6>
            <p className="text-muted small">Create your first album to organize your photos neatly.</p>
            <Link to="/albums" className="btn btn-sm btn-gradient-primary rounded-pill px-4">
              Create Album
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {recentAlbums.map((album) => (
              <div key={album._id} className="col-md-4">
                <Link to={`/albums/${album._id}`} className="text-decoration-none">
                  <div className="card-solid p-3 h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <div
                        className="rounded-3 bg-primary bg-opacity-20 text-info d-flex align-items-center justify-content-center border border-info border-opacity-25 shadow-sm"
                        style={{ width: '48px', height: '48px' }}
                      >
                        <i className="bi bi-folder-fill fs-4"></i>
                      </div>
                      <div className="overflow-hidden">
                        <h6 className="fw-bold text-white text-truncate mb-0">{album.name}</h6>
                        <span className="badge bg-dark text-secondary border border-secondary border-opacity-25 small">
                          {album.photoCount || 0} {album.photoCount === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>
                    </div>
                    {album.description && (
                      <p className="text-muted small text-truncate mb-0">{album.description}</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Photos Grid */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-black mb-0 text-white">Recent Uploads</h4>
            <p className="text-muted small mb-0">Latest indexed photos with detected faces</p>
          </div>
          <Link to="/gallery" className="btn btn-sm btn-outline-info rounded-pill px-4">
            View All Photos
          </Link>
        </div>

        {recentPhotos.length === 0 && !loading ? (
          <div className="card-solid p-5 text-center">
            <i className="bi bi-cloud-arrow-up fs-1 text-muted mb-2"></i>
            <h5 className="text-white">Your Library is Empty</h5>
            <p className="text-muted small">Upload some photos or use the camera to test facial recognition!</p>
            <Link to="/upload" className="btn btn-gradient-primary rounded-pill px-4">
              Upload Photos Now
            </Link>
          </div>
        ) : (
          <div className="photo-grid">
            {recentPhotos.map((photo) => (
              <PhotoCard
                key={photo._id}
                photo={photo}
                onPreview={(p) => setSelectedPhoto(p)}
                onDelete={handleDeletePhoto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
};

export default UserDashboard;
