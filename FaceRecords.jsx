import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const FaceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await adminService.getFaceRecords();
      if (res.success) {
        setRecords(res.records || []);
      }
    } catch (err) {
      console.error('Error fetching face records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Face Recognition Logs</h3>
          <p className="text-muted small mb-0">Audit history of facial queries and vector descriptor matches</p>
        </div>
      </div>

      <div className="card-solid p-0 overflow-hidden shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Query Image</th>
                <th>Requested By</th>
                <th>Status</th>
                <th>Top Confidence</th>
                <th>Matched Photos</th>
                <th>Executed At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                    Loading face scan records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No face scans recorded yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ width: '60px' }}>
                      <img
                        src={r.uploadedPhoto}
                        alt="Query"
                        className="rounded-2"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48?text=Scan';
                        }}
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{r.userId?.name || 'Unknown'}</div>
                      <div className="text-muted small">{r.userId?.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'matched' ? 'bg-success' : 'bg-secondary'}`}>
                        {r.status === 'matched' ? 'Matched' : 'No Match'}
                      </span>
                    </td>
                    <td>
                      {r.highestConfidence > 0 ? (
                        <span className="badge-confidence-high small">
                          {r.highestConfidence}%
                        </span>
                      ) : (
                        <span className="text-muted small">N/A</span>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {r.matchedPhotos?.length || 0} photo(s)
                      </span>
                    </td>
                    <td className="text-muted small">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FaceRecords;
