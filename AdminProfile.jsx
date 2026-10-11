import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', name);
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg({ type: 'success', text: 'Admin name updated successfully.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Error updating profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'danger', text: 'New passwords do not match.' });
      return;
    }

    setPwdLoading(true);

    try {
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setPwdMsg({ type: 'success', text: 'Admin password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdMsg({ type: 'danger', text: err.response?.data?.message || 'Error changing password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold mb-1 text-dark">Admin Security & Settings</h3>
        <p className="text-muted small mb-0">Manage root administrator profile and security credentials</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card-solid p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-person-badge text-danger"></i>
              <span>Administrator Details</span>
            </h5>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} py-2 small rounded-3 mb-3`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateName}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Admin Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Admin Email</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <button
                type="submit"
                className="btn btn-dark rounded-pill px-4"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Details'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card-solid p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-key-fill text-warning"></i>
              <span>Update Master Password</span>
            </h5>

            {pwdMsg.text && (
              <div className={`alert alert-${pwdMsg.type} py-2 small rounded-3 mb-3`}>
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Current Admin Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">New Master Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-outline-danger rounded-pill px-4"
                disabled={pwdLoading}
              >
                {pwdLoading ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
