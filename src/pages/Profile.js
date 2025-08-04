import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import HaivlerAPI from '../services/api';

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
`;

const UserInfo = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  margin-bottom: 1rem;
  
  strong {
    color: #333;
    display: inline-block;
    width: 120px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ToggleButton = styled.button`
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background: #007bff;
    color: white;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 2rem;
  
  &:hover {
    background: #c82333;
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    avatar_url: user?.avatar_url || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {};
      
      if (formData.email !== user.email && formData.email) {
        updateData.email = formData.email;
      }
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (formData.avatar_url !== user.avatar_url) {
        updateData.avatar_url = formData.avatar_url;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setEditing(false);
        setLoading(false);
        return;
      }

      const result = await HaivlerAPI.updateUserProfile(updateData);
      
      if (result.success) {
        updateUser(result.data);
        toast.success('Profile updated successfully!');
        setEditing(false);
        setFormData({
          ...formData,
          password: ''
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      password: '',
      avatar_url: user?.avatar_url || ''
    });
    setEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileContainer>
      <Title>User Profile</Title>
      
      <UserInfo>
        <InfoItem>
          <strong>Username:</strong> {user.username}
        </InfoItem>
        <InfoItem>
          <strong>Email:</strong> {user.email}
        </InfoItem>
        <InfoItem>
          <strong>Avatar:</strong> {user.avatar_url || 'No avatar set'}
        </InfoItem>
        <InfoItem>
          <strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}
        </InfoItem>
      </UserInfo>

      {!editing ? (
        <div>
          <ToggleButton onClick={() => setEditing(true)}>
            Edit Profile
          </ToggleButton>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </div>
      ) : (
        <div>
          <h3>Edit Profile</h3>
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              type="password"
              name="password"
              placeholder="New Password (leave empty to keep current)"
              value={formData.password}
              onChange={handleChange}
            />
            <Input
              type="url"
              name="avatar_url"
              placeholder="Avatar URL"
              value={formData.avatar_url}
              onChange={handleChange}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <ToggleButton type="button" onClick={handleCancel}>
                Cancel
              </ToggleButton>
            </div>
          </Form>
        </div>
      )}
      
      <LogoutButton onClick={handleLogout}>
        Logout from Account
      </LogoutButton>
    </ProfileContainer>
  );
};

export default Profile;