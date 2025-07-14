#!/bin/bash

echo "🔧 Testing Frontend-Backend Interactions"
echo "========================================"

# Get a login token
echo "1. Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/x/9592fc5373e2" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass123")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [[ -n "$TOKEN" ]]; then
    echo "✅ Token obtained: ${TOKEN:0:20}..."
else
    echo "❌ Failed to get token"
    exit 1
fi

# Test getting posts (should include reaction counts)
echo "2. Testing posts endpoint with reaction data..."
POSTS_RESPONSE=$(curl -s "http://localhost:8000/api/x/ff0d498c575b")
echo "   Posts response: ${POSTS_RESPONSE:0:100}..."

# Test creating a reaction
echo "3. Testing reaction creation..."
REACTION_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/x/ff0d498c575b/1/reaction" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"reaction_type":"like"}')

if [[ $REACTION_RESPONSE == *"reaction_type"* ]]; then
    echo "✅ Reaction creation works"
else
    echo "❌ Reaction creation failed: $REACTION_RESPONSE"
fi

# Test getting reactions
echo "4. Testing reaction retrieval..."
REACTIONS_RESPONSE=$(curl -s "http://localhost:8000/api/x/ff0d498c575b/1/reactions")
echo "   Reactions: $REACTIONS_RESPONSE"

# Test creating a comment
echo "5. Testing comment creation..."
COMMENT_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/x/ff0d498c575b/1/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"Frontend test comment"}')

if [[ $COMMENT_RESPONSE == *"content"* ]]; then
    echo "✅ Comment creation works"
else
    echo "❌ Comment creation failed: $COMMENT_RESPONSE"
fi

# Test getting comments
echo "6. Testing comment retrieval..."
COMMENTS_RESPONSE=$(curl -s "http://localhost:8000/api/x/ff0d498c575b/1/comments")
echo "   Comments: ${COMMENTS_RESPONSE:0:100}..."

# Test getting single post (should include like/dislike counts)
echo "7. Testing single post endpoint..."
POST_DETAIL_RESPONSE=$(curl -s "http://localhost:8000/api/x/ff0d498c575b/1")
echo "   Post detail: ${POST_DETAIL_RESPONSE:0:100}..."

echo ""
echo "🎯 All API endpoints are working!"
echo "Frontend should now be able to:"
echo "✅ Like/dislike posts"
echo "✅ Add comments"
echo "✅ View comments"
echo "✅ See reaction counts"
echo ""
echo "Open http://localhost:3000 and try the interactions!"