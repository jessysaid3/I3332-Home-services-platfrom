import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { fetchProfile, updateProfile } from "../api/signInApi";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    country: '',
    city: '',
    street: '',
    building: '',
    floor: '',
    apartment: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchProfile();
        console.log('Profile data received:', data);
        setProfile(data);
        setEditForm({
          name: data.name || '',
          country: data.country || '',
          city: data.city || '',
          street: data.street || '',
          building: data.building || '',
          floor: data.floor || '',
          apartment: data.apartment || ''
        });
        setError(null);
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to current profile data
    if (profile) {
      setEditForm({
        name: profile.name || '',
        country: profile.country || '',
        city: profile.city || '',
        street: profile.street || '',
        building: profile.building || '',
        floor: profile.floor || '',
        apartment: profile.apartment || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="profile-container"><p style={{ color: 'red' }}>{error}</p></div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-card">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={editForm.country}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={editForm.city}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Street:</label>
              <input
                type="text"
                name="street"
                value={editForm.street}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Building:</label>
              <input
                type="text"
                name="building"
                value={editForm.building}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Floor:</label>
              <input
                type="number"
                name="floor"
                value={editForm.floor}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Apartment:</label>
              <input
                type="text"
                name="apartment"
                value={editForm.apartment}
                onChange={handleChange}
              />
            </div>
            <div className="button-group">
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        ) : (
          <>
            <p><strong>Name:</strong> {profile?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {profile?.role || 'N/A'}</p>
            <p><strong>Country:</strong> {profile?.country || 'N/A'}</p>
            <p><strong>City:</strong> {profile?.city || 'N/A'}</p>
            <p><strong>Street:</strong> {profile?.street || 'N/A'}</p>
            <p><strong>Building:</strong> {profile?.building || 'N/A'}</p>
            <p><strong>Floor:</strong> {profile?.floor || 'N/A'}</p>
            <p><strong>Apartment:</strong> {profile?.apartment || 'N/A'}</p>

            <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;