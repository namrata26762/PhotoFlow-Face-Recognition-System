import React from 'react';
import photoService from '../services/photoService';

const PhotoCard = ({ photo, onPreview, onDelete, onEdit, showActions = true }) => {
  const handleDownload = (e) => {
    e.stopPropagation();
    window.open(photoService.getDownloadUrl(photo._id), '_blank');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${photo.title}"?`)) {
      onDelete(photo._id);
    }
  };

  return (
    <div className="photo-card-wrapper h-100 d-flex flex-column shadow-lg">
      <div className="position-relative" style={{ cursor: 'pointer' }} onClick={() => onPreview && onPreview(photo)}>
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="photo-card-img"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
          {photo.facesDetected > 0 && (
            <span className="badge bg-dark bg-opacity-75 text-info border border-info border-opacity-25 d-flex align-items-center gap-1 shadow">
              <i className="bi bi-person-bounding-box text-info"></i>
              <span>{photo.facesDetected} {photo.facesDetected === 1 ? 'Face' : 'Faces'}</span>
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="photo-overlay">
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-dark rounded-circle p-2 shadow border border-secondary border-opacity-50"
              title="Preview Photo"
              onClick={(e) => {
                e.stopPropagation();
                onPreview && onPreview(photo);
              }}
            >
              <i className="bi bi-arrows-fullscreen text-white" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between align-items-center">
            <button
              className="btn btn-sm btn-gradient-primary rounded-pill px-3 py-1 shadow fw-semibold d-flex align-items-center gap-1"
              onClick={handleDownload}
            >
              <i className="bi bi-download" /> Download
            </button>
            {showActions && (
              <>
                <button
                  className="btn btn-sm btn-outline-danger rounded-circle p-2 shadow bg-dark"
                  title="Delete Photo"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash" />
                </button>
                {onEdit && (
                  <button
                    className="btn btn-sm btn-outline-primary rounded-circle p-2 shadow bg-dark"
                    title="Edit Photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(photo);
                    }}
                  >
                    <i className="bi bi-pencil" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 d-flex flex-column justify-content-between flex-grow-1 bg-transparent">
        <div>
          <h6 className="fw-bold text-white text-truncate mb-1" title={photo.title}>
            {photo.title}
          </h6>
          {photo.albumId && (
            <span className="badge bg-dark text-info border border-info border-opacity-25 small mb-2">
              <i className="bi bi-folder me-1" /> {photo.albumId.name || 'Album'}
            </span>
          )}
          {photo.description && (
            <p className="text-muted small text-truncate mb-2" title={photo.description}>
              {photo.description}
            </p>
          )}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          <i className="bi bi-calendar3 me-1" />
          {new Date(photo.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
