import React, { useState, useEffect } from 'react';

const EditPhotoModal = ({ photo, onClose, onSave, albums }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albumId, setAlbumId] = useState('');

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setDescription(photo.description || '');
      // albumId may be object or id
      if (photo.albumId) {
        setAlbumId(typeof photo.albumId === 'object' ? photo.albumId._id : photo.albumId);
      } else {
        setAlbumId('');
      }
    }
  }, [photo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { title, description, albumId: albumId || null };
    onSave(data);
  };

  if (!photo) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg bg-dark text-white">
          <div className="modal-header border-0 bg-dark py-3">
            <h5 className="modal-title">Edit Photo</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit} className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Album</label>
              <select className="form-select" value={albumId} onChange={(e) => setAlbumId(e.target.value)}>
                <option value="">Uncategorized</option>
                {albums.map((alb) => (
                  <option key={alb._id} value={alb._id}>
                    {alb.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPhotoModal;
