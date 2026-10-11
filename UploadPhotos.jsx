import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import albumService from '../../services/albumService';
import photoService from '../../services/photoService';
import { extractDescriptorsFromFile, initFaceApi } from '../../services/faceApiHelper';

const UploadPhotos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(location.state?.albumId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ type: '', message: '' });

  // Camera capture modal state
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    initFaceApi(); // pre-load models
    const loadAlbums = async () => {
      try {
        const res = await albumService.getAlbums();
        if (res.success) {
          setAlbums(res.albums || []);
        }
      } catch (err) {
        console.error('Error fetching albums:', err);
      }
    };
    loadAlbums();

    return () => {
      stopUploadCamera();
    };
  }, []);

  const handleFileChange = (selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );

    if (validFiles.length === 0) {
      setAlertInfo({
        type: 'danger',
        message: 'Please select valid image files (JPEG, PNG, or WebP).',
      });
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);

    const newPreviews = validFiles.map((file) => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      url: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    setAlertInfo({ type: '', message: '' });
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Camera in Upload
  const startUploadCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Could not access camera for photo capture.');
      setCameraOpen(false);
    }
  };

  const stopUploadCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const uniqueName = `camera-${Date.now()}.jpg`;
        const file = new File([blob], uniqueName, { type: 'image/jpeg' });
        handleFileChange([file]);
        stopUploadCamera();
      }
    }, 'image/jpeg', 0.92);
  };

  // Submit and upload with real face extraction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setAlertInfo({ type: 'warning', message: 'Please select at least one photo to upload.' });
      return;
    }

    setLoading(true);
    setAlertInfo({ type: '', message: '' });

    try {
      // 1. Extract face descriptors for all selected photos
      setStatusMessage('Extracting AI face vectors from photos...');
      const allFaceData = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        try {
          const detectedFaces = await extractDescriptorsFromFile(f);
          if (detectedFaces && detectedFaces.length > 0) {
            // keep per-file descriptor array
            allFaceData.push(detectedFaces);
          } else {
            // preserve order with empty array when no faces detected
            allFaceData.push([]);
          }
        } catch (e) {
          console.warn('Face detection pass notice:', e);
        }
      }

      setStatusMessage('Uploading photos and saving face records...');

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos', file);
      });

      if (selectedAlbum) formData.append('albumId', selectedAlbum);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);

      if (allFaceData.length > 0) {
        formData.append('faceData', JSON.stringify(allFaceData));
      }

      const res = await photoService.uploadPhotos(formData);

      if (res.success) {
        setAlertInfo({
          type: 'success',
          message: `Uploaded ${res.photos.length} photo(s) successfully! Faces indexed.`,
        });
        setTimeout(() => {
          navigate('/gallery');
        }, 1200);
      }
    } catch (err) {
      setAlertInfo({
        type: 'danger',
        message: err.response?.data?.message || 'Error occurred while uploading.',
      });
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-solid p-4 p-md-5 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px' }}
                >
                  <i className="bi bi-cloud-arrow-up-fill fs-3"></i>
                </div>
                <div>
                  <h4 className="fw-bold text-dark mb-0">Upload Photos</h4>
                  <p className="text-muted small mb-0">
                    Add photos to albums or capture live selfies with camera.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger rounded-pill px-3 py-2 d-flex align-items-center gap-2 shadow-sm"
                onClick={startUploadCamera}
              >
                <i className="bi bi-camera-fill"></i>
                <span className="small fw-bold">Camera Capture</span>
              </button>
            </div>

            {alertInfo.message && (
              <div className={`alert alert-${alertInfo.type} py-2 px-3 small rounded-3 d-flex align-items-center gap-2 mb-4`}>
                <i className="bi bi-info-circle-fill"></i>
                <div>{alertInfo.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Dropzone */}
              <div
                className={`upload-dropzone mb-4 ${dragOver ? 'dragover' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="d-none"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
                <i className="bi bi-images fs-1 text-primary mb-2 d-block"></i>
                <h5 className="fw-bold mb-1">Click to browse or drag & drop photos here</h5>
                <p className="text-muted small mb-0">Supports JPG, PNG, and WebP format</p>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="small fw-semibold text-secondary">
                      Selected Photos ({previews.length})
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                      onClick={() => {
                        setFiles([]);
                        setPreviews([]);
                      }}
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="row g-2">
                    {previews.map((item, index) => (
                      <div key={index} className="col-4 col-sm-3 col-md-2">
                        <div className="position-relative border rounded-3 overflow-hidden shadow-sm">
                          <img
                            src={item.url}
                            alt={item.name}
                            style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 p-0 rounded-circle m-1"
                            style={{ width: '20px', height: '20px', lineHeight: '18px', fontSize: '12px' }}
                            onClick={() => removeFile(index)}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Album & Metadata */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Album (Optional)</label>
                  <select
                    className="form-select"
                    value={selectedAlbum}
                    onChange={(e) => setSelectedAlbum(e.target.value)}
                  >
                    <option value="">Uncategorized</option>
                    {albums.map((alb) => (
                      <option key={alb._id} value={alb._id}>
                        {alb.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Title (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Annual Day 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Description (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Add tags or context for these photos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-gradient-primary w-100 py-2 rounded-3 fw-bold shadow"
                disabled={loading || files.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    {statusMessage || 'Processing & Uploading...'}
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload {files.length > 0 ? `${files.length} Photo(s)` : ''}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {cameraOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
              <div className="modal-header bg-dark text-white border-0 py-3">
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-camera-fill me-2 text-danger"></i> Take Photo with Camera
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={stopUploadCamera}
                ></button>
              </div>
              <div className="modal-body p-0 bg-black text-center position-relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', transform: 'scaleX(-1)' }}
                ></video>
              </div>
              <div className="modal-footer bg-white border-0 justify-content-between py-3">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4"
                  onClick={stopUploadCamera}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-5 fw-bold shadow d-flex align-items-center gap-2"
                  onClick={capturePhotoFromCamera}
                >
                  <i className="bi bi-camera-fill"></i> Snap & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="d-none"></canvas>
    </div>
  );
};

export default UploadPhotos;
