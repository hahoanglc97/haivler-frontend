import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaThumbsUp, FaThumbsDown, FaUser, FaArrowLeft, FaTrash, FaEdit } from 'react-icons/fa';
import HaivlerAPI from '../services/api';
import { useAuth } from '../hooks/useAuth';

const PostDetailContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #007bff;
  text-decoration: none;
  margin-bottom: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PostCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const PostHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const PostImage = styled.img`
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
`;

const PostContent = styled.div`
  padding: 1rem;
`;

const PostTitle = styled.h1`
  color: #333;
  margin: 0 0 0.5rem 0;
`;

const PostDescription = styled.p`
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const PostActions = styled.div`
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.active {
    color: #007bff;
  }
`;

const CommentsSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
`;

const CommentsTitle = styled.h3`
  color: #333;
  margin-bottom: 1rem;
`;

const CommentForm = styled.form`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentTextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const CommentButton = styled.button`
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CommentItem = styled.div`
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #f8f9fa;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CommentUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const CommentContent = styled.p`
  color: #333;
  margin: 0;
  line-height: 1.5;
`;

const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #c82333;
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

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState({ like_count: 0, dislike_count: 0 });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const fetchPost = async () => {
    try {
      const result = await HaivlerAPI.getPost(id);
      if (result.success) {
        setPost(result.data);
        setReactions({
          like_count: result.data.like_count || 0,
          dislike_count: result.data.dislike_count || 0
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to fetch post');
    }
  };

  const fetchComments = async () => {
    try {
      const result = await HaivlerAPI.getComments(id);
      if (result.success) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const result = await HaivlerAPI.getReactions(id);
      if (result.success) {
        setReactions(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch reactions:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPost(), fetchComments(), fetchReactions()]);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleReaction = async (reactionType) => {
    if (!isAuthenticated) {
      toast.error('Please login to react to posts');
      return;
    }

    try {
      const result = await HaivlerAPI.createReaction(id, reactionType);
      if (result.success) {
        await fetchReactions();
        toast.success(`${reactionType === 'like' ? 'Liked' : 'Disliked'} post!`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setCommentLoading(true);

    try {
      const result = await HaivlerAPI.createComment(id, newComment.trim());
      if (result.success) {
        setNewComment('');
        await fetchComments();
        toast.success('Comment added!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const result = await HaivlerAPI.deleteComment(commentId);
      if (result.success) {
        await fetchComments();
        toast.success('Comment deleted!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const result = await HaivlerAPI.deletePost(id);
      if (result.success) {
        toast.success('Post deleted successfully!');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return <LoadingMessage>Loading post...</LoadingMessage>;
  }

  if (error || !post) {
    return <ErrorMessage>Error: {error || 'Post not found'}</ErrorMessage>;
  }

  return (
    <PostDetailContainer>
      <BackButton to="/">
        <FaArrowLeft />
        Back to Home
      </BackButton>

      <PostCard>
        <PostHeader>
          <UserInfo>
            <FaUser />
            <span>{post.user?.username || 'Unknown User'}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </UserInfo>
          {/* Add edit/delete buttons for post owner */}
          {user && post.user_id === user.id && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ActionButton as={Link} to={`/edit-post/${post.id}`}>
                <FaEdit />
              </ActionButton>
              <ActionButton 
                onClick={handleDeletePost}
                style={{ color: '#dc3545' }}
              >
                <FaTrash />
              </ActionButton>
            </div>
          )}
        </PostHeader>
        
        <PostImage src={post.image_url} alt={post.title} />
        
        <PostContent>
          <PostTitle>{post.title}</PostTitle>
          {post.description && (
            <PostDescription>{post.description}</PostDescription>
          )}
        </PostContent>
        
        <PostActions>
          <ActionButton onClick={() => handleReaction('like')}>
            <FaThumbsUp />
            <span>{reactions.like_count}</span>
          </ActionButton>
          
          <ActionButton onClick={() => handleReaction('dislike')}>
            <FaThumbsDown />
            <span>{reactions.dislike_count}</span>
          </ActionButton>
        </PostActions>
      </PostCard>

      <CommentsSection>
        <CommentsTitle>Comments ({comments.length})</CommentsTitle>
        
        {isAuthenticated ? (
          <CommentForm onSubmit={handleCommentSubmit}>
            <CommentTextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <CommentButton type="submit" disabled={commentLoading}>
              {commentLoading ? 'Adding...' : 'Add Comment'}
            </CommentButton>
          </CommentForm>
        ) : (
          <p>
            <Link to="/login">Login</Link> to add comments
          </p>
        )}

        <CommentsList>
          {comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id}>
                <CommentHeader>
                  <CommentUserInfo>
                    <FaUser />
                    <span>{comment.user?.username || 'Unknown User'}</span>
                    <span>•</span>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </CommentUserInfo>
                  {user && comment.user_id === user.id && (
                    <DeleteButton onClick={() => handleDeleteComment(comment.id)}>
                      <FaTrash />
                    </DeleteButton>
                  )}
                </CommentHeader>
                <CommentContent>{comment.content}</CommentContent>
              </CommentItem>
            ))
          )}
        </CommentsList>
      </CommentsSection>
    </PostDetailContainer>
  );
};

export default PostDetail;