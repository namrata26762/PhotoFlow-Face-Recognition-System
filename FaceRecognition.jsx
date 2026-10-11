import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import faceService from '../../services/faceService';
import photoService from '../../services/photoService';
import PhotoModal from '../../components/PhotoModal';
import {
  initFaceApi,
  extractDescriptorsFromFile,
  extractDescriptorFromVideo,
  isFaceApiLoaded,
} from '../../services/faceApiHelper';

const FaceRecognition = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'upload'

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [liveFaceDetected, setLiveFaceDetected] = useState(false);
  const [liveBox, setLiveBox] = useState(null);
  const [cameraPermissionError, setCameraPermissionError] = useState('');

  // Search & Query state
  const [queryFile, setQueryFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [queryDescriptor, setQueryDescriptor] = useState(null);
  const [threshold, setThreshold] = useState(0.45);
  const [isScanning, setIsScanning] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  // Results & Errors
  const [results, setResults] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  // detection loop control refs
  const detectLoopRef = useRef(null);
  const isDetectingRef = useRef(false);

  // Initialize Face‑API models on mount
  useEffect(() => {
    let isMounted = true;
    initFaceApi().then((ready) => {
      if (isMounted) setModelsReady(ready);
      if (!ready && isMounted) {
        setAlertMsg({ type: 'danger', text: 'Failed to load Face AI models. Check your network connection.' });
      }
    });
    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    setCameraLoading(true);
    setCameraPermissionError('');
    setAlertMsg({ type: '', text: '' });
    try {
      const constraints = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          setCameraLoading(false);
          startLiveDetection();
        };
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraLoading(false);
      setCameraActive(false);
      setCameraPermissionError(
        'Could not access camera. Please allow webcam permissions in your browser, or use the "Upload Photo" tab.'
      );
    }
  };

  // Stop camera and cleanup
  const stopCamera = () => {
    if (detectLoopRef.current) {
      cancelAnimationFrame(detectLoopRef.current);
      detectLoopRef.current = null;
    }
    isDetectingRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setLiveFaceDetected(false);
    setLiveBox(null);
  };

  // Controlled live detection loop using requestAnimationFrame
  const startLiveDetection = () => {
    const loop = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        return; // video stopped – exit loop
      }
      if (isDetectingRef.current) {
        // skip this frame, previous detection still in progress
        detectLoopRef.current = requestAnimationFrame(loop);
        return;
      }
      isDetectingRef.current = true;
      try {
        const detection = await extractDescriptorFromVideo(videoRef.current);
        if (detection && detection.box) {
          setLiveFaceDetected(true);
          setLiveBox(detection.box);
        } else {
          setLiveFaceDetected(false);
          setLiveBox(null);
        }
      } catch (e) {
        console.warn('Live detection error:', e);
      } finally {
        isDetectingRef.current = false;
        detectLoopRef.current = requestAnimationFrame(loop);
      }
    };
    detectLoopRef.current = requestAnimationFrame(loop);
  };

  // Capture frame and search
  const handleCaptureAndSearch = async () => {
    if (!videoRef.current) {
      setAlertMsg({ type: 'danger', text: 'Video element not available.' });
      return;
    }
    // Ensure canvas exists; create temporary if missing.
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    setIsScanning(true);
    setAlertMsg({ type: '', text: '' });
    setResults(null);
    let descriptorArray = null;
    try {
      const detection = await extractDescriptorFromVideo(video);
      if (detection && detection.descriptor) {
        descriptorArray = detection.descriptor;
      }
    } catch (e) {
      console.warn('Live descriptor extraction fallback:', e);
    }
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsScanning(false);
        return;
      }
      const file = new File([blob], 'camera-face-scan.jpg', { type: 'image/jpeg' });
      setQueryFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      await executeSearch(file, descriptorArray);
    }, 'image/jpeg', 0.92);
  };

  // Handle uploaded file
  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    stopCamera();
    setQueryFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setAlertMsg({ type: '', text: '' });
    setIsScanning(true);
    let descriptorArray = null;
    try {
      const faces = await extractDescriptorsFromFile(file);
      if (faces && faces.length > 0) {
        descriptorArray = faces[0].descriptor;
        setAlertMsg({ type: 'success', text: 'Face detected successfully! Ready to search database.' });
      } else {
        setAlertMsg({ type: 'info', text: 'Notice: No clear face detected in this photo. Front‑facing portraits give highest accuracy.' });
      }
    } catch (err) {
      console.warn('File descriptor extraction notice:', err);
    } finally {
      setIsScanning(false);
    }
    setQueryDescriptor(descriptorArray);
  };

  // Execute search
  const executeSearch = async (fileToSearch, descriptor) => {
    setIsScanning(true);
    setAlertMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      if (fileToSearch) formData.append('faceQuery', fileToSearch);
      if (descriptor && Array.isArray(descriptor)) formData.append('queryDescriptor', JSON.stringify(descriptor));
      formData.append('threshold', threshold);
      const res = await faceService.recognizeFace(formData);
      if (res.success) {
        setResults(res);
        if (res.totalMatches > 0) {
          setAlertMsg({ type: 'success', text: `Success! Found ${res.totalMatches} photo(s) containing this person.` });
        } else {
          setAlertMsg({ type: 'warning', text: 'No matching photos found within this threshold. Try loosening the sensitivity slider or upload more photos of this person.' });
        }
      } else {
        setAlertMsg({ type: 'danger', text: res.message || 'Face recognition scan failed.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'danger', text: err.response?.data?.message || 'Error occurred while contacting recognition server.' });
    } finally {
      setIsScanning(false);
    }
  };

  // UI – unchanged apart from cleanup of detection handling
  return (
    <div className="container py-4">
      <div className="text-center max-w-2xl mx-auto mb-4">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary-subtle text-primary small fw-bold mb-2">
          <i className="bi bi-camera-video-fill"></i> Live AI Face Scanner &amp; Recognition
        </div>
        <h2 className="fw-bold text-dark">Search Photos by Face</h2>
        <p className="text-muted small">
          Open your camera or upload a photo. PhotoFlow uses 128‑dimensional deep learning facial landmarks to find all matching photos in your collection.
        </p>
      </div>

      <div className="text-center mb-3">
        {modelsReady ? (
          <span className="badge bg-success-subtle text-success border border-success-subtle small px-3 py-1">
            <i className="bi bi-cpu-fill me-1"></i> Neural Network Models Active
          </span>
        ) : (
          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle small px-3 py-1">
            <span className="spinner-border spinner-border-sm me-1" role="status"></span> Loading AI Face Models...
          </span>
        )}
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} alert-dismissible fade show rounded-3 small mb-4`} role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          {alertMsg.text}
          <button type="button" className="btn-close" onClick={() => setAlertMsg({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Tabs */}
      <div className="d-flex justify-content-center mb-4">
        <div className="bg-light p-1 rounded-pill shadow-sm d-inline-flex border" style={{ maxWidth: '420px', width: '100%' }}>
          <button
            type="button"
            className={`btn btn-sm rounded-pill flex-grow-1 fw-bold py-2 ${activeTab === 'camera' ? 'btn-white bg-white text-primary shadow-sm' : 'text-muted'}`}
            onClick={() => { setActiveTab('camera'); if (!cameraActive) startCamera(); }}
          >
            <i className="bi bi-camera-video-fill me-2"></i> Live Camera Scanner
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill flex-grow-1 fw-bold py-2 ${activeTab === 'upload' ? 'btn-white bg-white text-primary shadow-sm' : 'text-muted'}`}
            onClick={() => { stopCamera(); setActiveTab('upload'); }}
          >
            <i className="bi bi-image-fill me-2"></i> Upload Photo File
          </button>
        </div>
      </div>

      <div className="row g-4 justify-content-center mb-5">
        <div className="col-lg-7">
          <div className="card-solid p-4 shadow-sm">
            {activeTab === 'camera' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-circle p-1 ${cameraActive ? 'bg-danger animate-pulse' : 'bg-secondary'}`} />
                    <span className="fw-bold small text-dark">{cameraActive ? 'Camera Live Stream' : 'Camera Ready'}</span>
                  </div>
                  {cameraActive && (
                    <button type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1" onClick={stopCamera}>
                      <i className="bi bi-camera-video-off me-1"></i> Stop Camera
                    </button>
                  )}
                </div>

                {cameraPermissionError && (
                  <div className="alert alert-danger py-2 small rounded-3 mb-3">
                    <i className="bi bi-exclamation-octagon-fill me-2"></i>{cameraPermissionError}
                  </div>
                )}

                <div
                  className="position-relative text-center rounded-4 overflow-hidden bg-black shadow mb-3"
                  style={{ minHeight: '340px', maxHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '420px',
                    objectFit: 'cover',
                    display: cameraActive ? 'block' : 'none',
                    transform: 'scaleX(-1)',
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {!cameraActive && (
                    <div className="p-5 text-center text-white">
                      <div className="rounded-circle bg-dark border border-secondary p-3 d-inline-flex mb-3 shadow" style={{ width: '80px', height: '80px', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-camera-video fs-1 text-primary"></i>
                      </div>
                      <h5 className="fw-bold mb-1">Live Camera Face Scanner</h5>
                      <p className="text-secondary small mb-4">Click below to grant camera access and scan your face directly</p>
                      <button type="button" className="btn btn-gradient-primary rounded-pill px-4 py-2 fw-bold shadow" disabled={cameraLoading} onClick={startCamera}>
                        {cameraLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span> Starting Camera...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-camera-fill me-2"></i> Start Live Camera
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {cameraActive && (
                    <>
                      <div className="scan-line" />
                      {liveFaceDetected ? (
                        <div
                          className="position-absolute border border-success border-3 rounded-3"
                          style={{
                            width: '200px',
                            height: '240px',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 25px rgba(34, 197, 94, 0.6)',
                            pointerEvents: 'none',
                          }}
                        >
                          <span className="position-absolute top-0 start-50 translate-middle badge bg-success px-2 py-1 shadow" style={{ fontSize: '0.75rem' }}> <i className="bi bi-check-circle-fill me-1"></i> Face Locked </span>
                        </div>
                      ) : (
                        <div
                          className="position-absolute border border-warning border-2 rounded-3"
                          style={{
                            width: '200px',
                            height: '240px',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            opacity: 0.6,
                            pointerEvents: 'none',
                          }}
                        >
                          <span className="position-absolute top-0 start-50 translate-middle badge bg-warning text-dark px-2 py-1 shadow" style={{ fontSize: '0.75rem' }}>Position Face in Box</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {cameraActive && (
                  <div className="text-center mb-3">
                    <button type="button" className="btn btn-danger btn-lg rounded-pill px-5 py-2 shadow-lg fw-bold d-inline-flex align-items-center gap-2" disabled={isScanning} onClick={handleCaptureAndSearch}>
                      {isScanning ? (
                        <>
                          <span className="spinner-border spinner-border-sm"></span> Scanning & Searching Database...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-camera-fill fs-5"></i> <span>Capture & Search This Face</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <div>
                <label className="upload-dropzone d-block py-5 mb-3" style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" className="d-none" onChange={handleFileUpload} />
                  <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2 d-block"></i>
                  <h6 className="fw-bold mb-1">Click to select portrait or selfie</h6>
                  <p className="text-muted small mb-0">JPEG, PNG, or WebP format</p>
                </label>
                {previewUrl && (
                  <div className="scanner-container p-3 text-center mb-3 position-relative">
                    {isScanning && <div className="scan-line" />}
                    <img src={previewUrl} alt="Query preview" className="img-fluid rounded-3 shadow-sm" style={{ maxHeight: '280px', objectFit: 'contain' }} />
                    <div className="small text-muted mt-2">
                      <span className="badge bg-primary-subtle text-primary me-2">Selected Photo</span>
                      {queryFile?.name}
                    </div>
                  </div>
                )}
                {previewUrl && (
                  <button type="button" className="btn btn-gradient-primary w-100 py-2 rounded-3 fw-bold shadow mb-2" disabled={isScanning} onClick={() => executeSearch(queryFile, queryDescriptor)}>
                    {isScanning ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span> Analyzing Face Descriptors...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i> Search Matching Photos
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info column */}
        <div className="col-lg-5">
          <div className="card-solid p-4 h-100 shadow-sm d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><i className="bi bi-info-circle text-primary"></i> Tips for Best Accuracy</h5>
              <ul className="list-unstyled small text-muted d-flex flex-column gap-3">
                <li className="d-flex gap-2"><i className="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Good Lighting:</strong> Ensure your face is evenly lit without harsh shadows.</span></li>
                <li className="d-flex gap-2"><i className="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Front Angle:</strong> Look directly into the camera or upload a front‑facing portrait.</span></li>
                <li className="d-flex gap-2"><i className="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Clear View:</strong> Remove sunglasses, masks, or hats covering key facial landmarks.</span></li>
                <li className="d-flex gap-2"><i className="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Sensitivity:</strong> If a known photo is not matching, slide the threshold to <strong>0.65 or 0.70</strong>.</span></li>
              </ul>
            </div>
            <div className="pt-3 border-top mt-4">
              <Link to="/recognition-history" className="btn btn-outline-primary btn-sm w-100 rounded-pill"><i className="bi bi-clock-history me-1"></i> View Saved Scan History</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1"><i className="bi bi-check-circle-fill text-success me-2"></i> Matched Photos ({results.totalMatches})</h4>
              <p className="text-muted small mb-0">
                {results.totalMatches > 0 ? `Found ${results.totalMatches} photo(s) with matching facial geometry.` : 'No matching faces found within this threshold.'}
              </p>
            </div>
            {results.totalMatches > 0 && (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Best Match:</span>
                <span className="badge-confidence-high">{results.highestConfidence}% Confidence</span>
              </div>
            )}
          </div>
          {results.totalMatches === 0 ? (
            <div className="card-solid p-5 text-center my-4">
              <i className="bi bi-emoji-neutral fs-1 text-muted mb-2"></i>
              <h5>No Matching Photos Found</h5>
              <p className="text-muted small mb-3">Try setting the sensitivity threshold slider to <strong>0.65 or 0.70</strong> and click search again, or upload more photos of this person to your gallery!</p>
              <div className="d-flex justify-content-center gap-2">
                <button type="button" className="btn btn-outline-primary rounded-pill px-4" onClick={() => { setThreshold(0.70); if (queryFile) executeSearch(queryFile, queryDescriptor); }}>Try With 0.70 Sensitivity</button>
                <Link to="/upload" className="btn btn-gradient-primary rounded-pill px-4">Upload More Photos</Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {results.matchedPhotos.map((item) => (
                <div key={item.photoId} className="col-sm-6 col-md-4 col-lg-3">
                  <div className="photo-card-wrapper h-100 d-flex flex-column shadow-sm">
                    <div className="position-relative" style={{ cursor: 'pointer' }} onClick={() => setSelectedPhoto(item)}>
                      <img src={item.imageUrl} alt={item.title} className="photo-card-img" />
                      <div className="position-absolute top-0 start-0 m-2">
                        <span className="badge-confidence-high shadow"><i className="bi bi-check2-circle me-1"></i> {item.confidence}% Match</span>
                      </div>
                      <div className="photo-overlay">
                        <div className="d-flex justify-content-end">
                          <button className="btn btn-sm btn-light rounded-circle p-2 shadow" title="Preview" onClick={(e) => { e.stopPropagation(); setSelectedPhoto(item); }}>
                            <i className="bi bi-arrows-fullscreen"></i>
                          </button>
                        </div>
                        <button className="btn btn-sm btn-light text-primary rounded-pill px-3 py-1 shadow fw-semibold" onClick={(e) => { e.stopPropagation(); window.open(photoService.getDownloadUrl(item.photoId), '_blank'); }}>
                          <i className="bi bi-download me-1"></i> Download
                        </button>
                      </div>
                    </div>
                    <div className="p-3 bg-white d-flex flex-column justify-content-between flex-grow-1">
                      <div>
                        <h6 className="fw-bold text-dark text-truncate mb-1">{item.title}</h6>
                        <span className="badge bg-light text-secondary border small mb-2"><i className="bi bi-folder me-1"></i> {item.albumName || 'Album'}</span>
                      </div>
                      <div className="text-muted d-flex justify-content-between align-items-center pt-2 border-top" style={{ fontSize: '0.75rem' }}>
                        <span>Distance: {item.distance}</span>
                        <span className="text-success fw-bold">Verified Match</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoModal
          photo={{ _id: selectedPhoto.photoId, imageUrl: selectedPhoto.imageUrl, title: selectedPhoto.title, albumId: { name: selectedPhoto.albumName } }}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  );
};

export default FaceRecognition;
