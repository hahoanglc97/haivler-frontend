import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { FaThumbsUp, FaThumbsDown, FaComment, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import HaivlerAPI from "../services/api";
import { useAuth } from "../hooks/useAuth";

const HomeContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
`;

const SortButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SortButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  background: ${(props) => (props.active ? "#007bff" : "white")};
  color: ${(props) => (props.active ? "white" : "#007bff")};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #007bff;
    color: white;
  }
`;

const PostCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  max-height: 500px;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 1rem;
`;

const PostTitle = styled.h3`
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

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;

  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("new");
  const { isAuthenticated, user } = useAuth();

  const fetchPosts = async (sort = "new") => {
    setLoading(true);
    setError(null);

    try {
      const result = await HaivlerAPI.getPosts(0, 10, sort);
      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(sortBy);
  }, [sortBy]);

  const handleSort = (sort) => {
    setSortBy(sort);
  };

  const handleReaction = async (postId, reactionType) => {
    if (!isAuthenticated) {
      toast.error("Please login to react to posts");
      return;
    }

    try {
      const result = await HaivlerAPI.createReaction(postId, reactionType);
      if (result.success) {
        // Refresh posts to update reaction counts
        fetchPosts(sortBy);
        toast.success(
          `${reactionType === "like" ? "Liked" : "Disliked"} post!`
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const result = await HaivlerAPI.deletePost(postId);
      if (result.success) {
        // Remove post from local state
        setPosts(posts.filter(post => post.id !== postId));
        toast.success('Post deleted successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return <LoadingMessage>Loading posts...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <HomeContainer>
      <Header>
        <Title>Latest Posts</Title>
        <SortButtons>
          <SortButton
            active={sortBy === "new"}
            onClick={() => handleSort("new")}
          >
            New
          </SortButton>
          <SortButton
            active={sortBy === "popular"}
            onClick={() => handleSort("popular")}
          >
            Popular
          </SortButton>
        </SortButtons>
      </Header>

      {posts.length === 0 ? (
        <EmptyMessage>
          No posts yet. <Link to="/create-post">Create the first post!</Link>
        </EmptyMessage>
      ) : (
        posts.map((post) => {
          return (
            <PostCard key={post.id}>
              <PostHeader>
                <UserInfo>
                  <FaUser />
                  <span>{post.user?.username || "Unknown User"}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </UserInfo>
              </PostHeader>

              <PostImage src={post.image_url} alt={post.title} />

              <PostContent>
                <PostTitle>{post.title}</PostTitle>
                {post.description && (
                  <PostDescription>{post.description}</PostDescription>
                )}
              </PostContent>

              <PostActions>
                <ActionButton onClick={() => handleReaction(post.id, "like")}>
                  <FaThumbsUp />
                  <span>{post.like_count || 0}</span>
                </ActionButton>

                <ActionButton
                  onClick={() => handleReaction(post.id, "dislike")}
                >
                  <FaThumbsDown />
                  <span>{post.dislike_count || 0}</span>
                </ActionButton>

                <ActionButton as={Link} to={`/post/${post.id}`}>
                  <FaComment />
                  <span>Comments</span>
                </ActionButton>

                {/* Add edit/delete buttons for post owner */}
                {user && post.user_id === user.id && (
                  <>
                    <ActionButton as={Link} to={`/edit-post/${post.id}`}>
                      <FaEdit />
                      <span>Edit</span>
                    </ActionButton>
                    <ActionButton 
                      onClick={() => handleDeletePost(post.id)}
                      style={{ color: '#dc3545' }}
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </ActionButton>
                  </>
                )}
              </PostActions>
            </PostCard>
          );
        })
      )}
    </HomeContainer>
  );
};

export default Home;
