import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import faceService from '../../services/faceService';
import PhotoModal from '../../components/PhotoModal';

const RecognitionResults = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await faceService.getHistory();
      if (res.success) {
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error('Error fetching face scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scan record from history?')) {
      try {
        await faceService.deleteHistoryItem(id);
        setHistory((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting history record.');
      }
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-black mb-1 text-white">Face Recognition Audit Logs</h3>
          <p className="text-muted small mb-0">Complete audit trail of all previous facial vector queries and matches</p>
        </div>

        <Link to="/face-search" className="btn btn-gradient-primary rounded-pill px-4 shadow">
          <i className="bi bi-camera-video-fill me-2"></i> New Camera Scan
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status"></div>
          <p className="text-muted small mt-2">Loading search history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card-solid p-5 text-center my-4">
          <i className="bi bi-clock-history fs-1 text-muted mb-2"></i>
          <h5 className="text-white">No Face Recognition History Yet</h5>
          <p className="text-muted small">Perform a camera face scan or photo query to see logs recorded here.</p>
          <Link to="/face-search" className="btn btn-gradient-primary rounded-pill px-4">
            Try Face Search
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {history.map((item) => (
            <div key={item._id} className="card-solid p-3 shadow-lg border border-secondary border-opacity-25">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                {/* Left: Query Image and Info */}
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="border border-secondary border-opacity-50 rounded-3 overflow-hidden"
                    style={{ width: '68px', height: '68px', flexShrink: 0, background: '#090d18' }}
                  >
                    <img
                      src={item.uploadedPhoto}
                      alt="Face Query"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/68?text=Scan';
                      }}
                    />
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge ${item.status === 'matched' ? 'bg-success' : 'bg-secondary'} rounded-pill px-2`}>
                        {item.status === 'matched' ? 'Face Matched' : 'No Match'}
                      </span>
                      {item.highestConfidence > 0 && (
                        <span className="badge-confidence-high small">
                          {item.highestConfidence}% Best Match
                        </span>
                      )}
                    </div>
                    <div className="text-muted small">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Center: Matched Photos Count */}
                <div className="text-center">
                  <h4 className="fw-black mb-0 text-white">
                    {item.matchedPhotos?.length || 0}
                  </h4>
                  <span className="text-muted small">Matching Photos</span>
                </div>

                {/* Right: Actions */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-sm btn-outline-danger rounded-circle p-2"
                    title="Delete Scan Record"
                    onClick={() => handleDelete(item._id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              {/* Collapsed view of matched photos thumbnails */}
              {item.matchedPhotos && item.matchedPhotos.length > 0 && (
                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                  <div className="small fw-semibold text-secondary mb-2">Matched Photos in Database:</div>
                  <div className="d-flex flex-wrap gap-2">
                    {item.matchedPhotos.map((matched, idx) => (
                      <div
                        key={idx}
                        className="position-relative border border-secondary border-opacity-50 rounded-2 overflow-hidden shadow-sm"
                        style={{ width: '75px', height: '75px', cursor: 'pointer' }}
                        onClick={() => setSelectedPhoto(matched)}
                        title={`${matched.title} (${matched.confidence}% Match)`}
                      >
                        <img
                          src={matched.imageUrl}
                          alt={matched.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span
                          className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-85 text-info text-center fw-bold"
                          style={{ fontSize: '0.65rem' }}
                        >
                          {matched.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
};

export default RecognitionResults;
