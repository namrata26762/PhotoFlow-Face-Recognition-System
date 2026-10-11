import React from 'react';
import photoService from '../services/photoService';

const PhotoModal = ({ photo, onClose }) => {
  if (!photo) return null;

  const handleDownload = () => {
    window.open(photoService.getDownloadUrl(photo._id), '_blank');
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div className="modal-header border-0 bg-dark text-white py-3">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <i className="bi bi-image text-primary"></i>
              <span className="text-truncate" style={{ maxWidth: '500px' }}>
                {photo.title}
              </span>
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-0 text-center bg-black position-relative">
            <img
              src={photo.imageUrl}
              alt={photo.title}
              className="img-fluid"
              style={{ maxHeight: '70vh', objectFit: 'contain', width: '100%' }}
            />
          </div>

          <div className="modal-footer bg-white border-0 d-flex justify-content-between align-items-center py-3">
            <div className="text-start">
              {photo.albumId && (
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-2">
                  <i className="bi bi-folder2 me-1"></i>
                  {typeof photo.albumId === 'object' ? photo.albumId.name : 'Album'}
                </span>
              )}
              {photo.facesDetected > 0 && (
                <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle me-2">
                  <i className="bi bi-person-bounding-box me-1"></i>
                  {photo.facesDetected} Face(s) Detected
                </span>
              )}
              {photo.description && (
                <p className="text-muted small mt-2 mb-0">{photo.description}</p>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-gradient-primary rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={handleDownload}
              >
                <i className="bi bi-download"></i> Download
              </button>
              <button
                className="btn btn-light rounded-pill px-3"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
