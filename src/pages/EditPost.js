import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import HaivlerAPI from "../services/api";
import { useAuth } from "../hooks/useAuth";

const EditPostContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
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
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background: #545b62;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const CurrentImage = styled.div`
  margin: 1rem 0;
  text-align: center;

  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  p {
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.9rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #dc3545;
`;

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await HaivlerAPI.getPost(id);
        if (result.success) {
          const postData = result.data;
          
          // Check if user owns this post
          if (user && postData.user_id !== user.id) {
            toast.error("You don't have permission to edit this post");
            navigate('/');
            return;
          }

          setPost(postData);
          setFormData({
            title: postData.title,
            description: postData.description || "",
          });
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError('Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSubmitting(true);

    try {
      const result = await HaivlerAPI.updatePost(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (result.success) {
        toast.success("Post updated successfully!");
        navigate(`/post/${id}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/post/${id}`);
  };

  if (loading) {
    return <LoadingMessage>Loading post...</LoadingMessage>;
  }

  if (error || !post) {
    return <ErrorMessage>Error: {error || 'Post not found'}</ErrorMessage>;
  }

  return (
    <EditPostContainer>
      <Title>Edit Post</Title>
      
      <CurrentImage>
        <img src={post.image_url} alt={post.title} />
        <p>Note: You can only edit the title and description. The image cannot be changed.</p>
      </CurrentImage>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          placeholder="Post Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextArea
          name="description"
          placeholder="Post Description (optional)"
          value={formData.description}
          onChange={handleChange}
        />
        <ButtonGroup>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating Post..." : "Update Post"}
          </Button>
          <CancelButton type="button" onClick={handleCancel}>
            Cancel
          </CancelButton>
        </ButtonGroup>
      </Form>
    </EditPostContainer>
  );
};

export default EditPost;