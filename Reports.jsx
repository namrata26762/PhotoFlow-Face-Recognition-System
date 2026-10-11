import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [statsRes, reportsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getReports(),
        ]);
        setData({
          stats: statsRes.stats,
          reports: reportsRes.reports,
        });
      } catch (err) {
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">System Analytics & Project Reports</h3>
          <p className="text-muted small mb-0">Aggregated statistics and metrics for BCA Sem-5 evaluation</p>
        </div>

        <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i> Print Report Summary
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Compiling report analytics...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Executive Summary Cards */}
          <div className="col-12">
            <div className="card-solid p-4 shadow-sm">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-clipboard-data text-primary"></i>
                <span>PhotoFlow System Performance Summary</span>
              </h5>

              <div className="row g-3 text-center">
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small">Total Registered Users</div>
                    <h3 className="fw-bold text-dark mt-1">{data?.stats?.totalUsers || 0}</h3>
                    <span className="small text-success">
                      {data?.stats?.activeUsers || 0} Active ({Math.round(((data?.stats?.activeUsers || 0) / Math.max(1, data?.stats?.totalUsers || 1)) * 100)}%)
                    </span>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small">Photos Cataloged</div>
                    <h3 className="fw-bold text-dark mt-1">{data?.stats?.totalPhotos || 0}</h3>
                    <span className="small text-info">In {data?.stats?.totalAlbums || 0} Albums</span>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small">Face Vectors Indexed</div>
                    <h3 className="fw-bold text-dark mt-1">{data?.stats?.totalFaceRecords || 0}</h3>
                    <span className="small text-primary">128-D Descriptors</span>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small">Recognition Queries</div>
                    <h3 className="fw-bold text-dark mt-1">{data?.stats?.totalScans || 0}</h3>
                    <span className="small text-success">Euclidean Searches</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Breakdown: Uploads by Date */}
          <div className="col-md-6">
            <div className="card-solid p-4 h-100 shadow-sm">
              <h5 className="fw-bold mb-3">Upload Frequency by Date</h5>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th className="text-end">Photos Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.reports?.photosByDate?.map((item) => (
                      <tr key={item._id}>
                        <td>{item._id}</td>
                        <td className="text-end fw-bold text-primary">{item.count}</td>
                      </tr>
                    ))}
                    {(!data?.reports?.photosByDate || data.reports.photosByDate.length === 0) && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted py-3">
                          No recent uploads recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Match Distribution */}
          <div className="col-md-6">
            <div className="card-solid p-4 h-100 shadow-sm">
              <h5 className="fw-bold mb-3">Recognition Scan Outcomes</h5>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Status Category</th>
                      <th className="text-end">Total Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.reports?.scansByStatus?.map((item) => (
                      <tr key={item._id}>
                        <td className="text-capitalize">
                          <span className={`badge me-2 ${item._id === 'matched' ? 'bg-success' : 'bg-secondary'}`}>
                            {item._id}
                          </span>
                        </td>
                        <td className="text-end fw-bold text-dark">{item.count}</td>
                      </tr>
                    ))}
                    {(!data?.reports?.scansByStatus || data.reports.scansByStatus.length === 0) && (
                      <tr>
                        <td colSpan="2" className="text-center text-muted py-3">
                          No scan logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
