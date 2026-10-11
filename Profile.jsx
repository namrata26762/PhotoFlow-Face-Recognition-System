import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();

  // Ensure latest user data from backend
  useEffect(() => {
  const syncUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        updateUser(res.data.user);
        setName(res.data.user.name || '');
      }
    } catch (err) {
      console.error('Error syncing user data:', err);
    }
  };
  syncUser();
}, []);

  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadProfileStats = async () => {
      try {
        const res = await api.get('/users/profile');
        if (res.data.success && res.data.stats) {
          setStats(res.data.stats);
        } else {
          // Fallback to zero counts if stats missing
          setStats({ totalPhotos: 0, totalAlbums: 0, totalScans: 0 });
        }
      } catch (err) {
        console.error('Error fetching profile stats:', err);
        // Ensure UI displays zeros on error
        setStats({ totalPhotos: 0, totalAlbums: 0, totalScans: 0 });
      }
    };
    loadProfileStats();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (avatarFile) {
        formData.append('profileImage', avatarFile);
      }

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Error updating profile.',
      });
    } finally {
      setProfileLoading(false);
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
        setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwdMsg({
        type: 'danger',
        text: err.response?.data?.message || 'Error updating password.',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-4">
          <div className="card-solid p-4 text-center shadow-xl border border-secondary border-opacity-25">
            <div className="position-relative d-inline-block mb-3">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="rounded-circle shadow-lg"
                  style={{ width: '110px', height: '110px', objectFit: 'cover', border: '3px solid #6366f1' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-lg mx-auto"
                  style={{ width: '110px', height: '110px', fontSize: '2.5rem', boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className={`badge position-absolute bottom-0 end-0 rounded-pill px-2 py-1 ${user?.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>

            <h5 className="fw-black mb-0 text-white">{user?.name}</h5>
            <p className="text-muted small mb-3">{user?.email}</p>

            <div className="p-3 rounded-3 text-start small mb-3 border border-secondary border-opacity-25" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
                <span className="text-muted">Account Role:</span>
                <span className="fw-semibold text-capitalize text-info">{user?.role}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
                <span className="text-muted">Hosted Photos:</span>
                <span className="fw-bold text-white">{stats?.totalPhotos ?? '...'}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom border-secondary border-opacity-25">
                <span className="text-muted">Photo Albums:</span>
                <span className="fw-bold text-white">{stats?.totalAlbums ?? '...'}</span>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted">AI Face Scans:</span>
                <span className="fw-bold text-success">{stats?.totalScans ?? '...'}</span>
              </div>
            </div>

            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password Forms */}
        <div className="col-lg-8">
          {/* Edit Profile Info */}
          <div className="card-solid p-4 mb-4 shadow-xl border border-secondary border-opacity-25">
            <h5 className="fw-black mb-3 d-flex align-items-center gap-2 text-white">
              <i className="bi bi-person-gear text-info"></i>
              <span>Profile Information</span>
            </h5>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} py-2 small rounded-3 mb-3 bg-${profileMsg.type} bg-opacity-25 border-${profileMsg.type} border-opacity-50 text-${profileMsg.type}`}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-light">Update Avatar Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                />
              </div>

              <button
                type="submit"
                className="btn btn-gradient-primary rounded-pill px-4 fw-semibold shadow"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card-solid p-4 shadow-xl border border-secondary border-opacity-25">
            <h5 className="fw-black mb-3 d-flex align-items-center gap-2 text-white">
              <i className="bi bi-shield-lock text-info"></i>
              <span>Security & Password</span>
            </h5>

            {pwdMsg.text && (
              <div className={`alert alert-${pwdMsg.type} py-2 small rounded-3 mb-3 bg-${pwdMsg.type} bg-opacity-25 border-${pwdMsg.type} border-opacity-50 text-${pwdMsg.type}`}>
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-light">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-light">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-light">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-outline-info rounded-pill px-4 fw-semibold"
                disabled={pwdLoading}
              >
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
