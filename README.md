# Haivler Frontend - React Image Sharing Client

A modern React frontend for the Haivler image sharing platform that communicates with obfuscated backend endpoints for enhanced security.

## Features

- **Authentication**: Login, register, logout with JWT tokens
- **User Management**: Profile viewing and editing
- **Post Management**: Create, view, and interact with image posts
- **Comments System**: Add and delete comments on posts
- **Reactions**: Like and dislike posts
- **Responsive Design**: Works on desktop and mobile devices
- **Security**: Uses obfuscated API endpoints from backend
- **Real-time Updates**: Automatic refresh of data after interactions

## Technology Stack

- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Axios**: HTTP client for API calls
- **React Icons**: Icon library
- **React Toastify**: Toast notifications
- **Docker**: Containerization with Nginx

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.js       # Navigation header
│   │   ├── Login.js        # Login form
│   │   └── Register.js     # Registration form
│   ├── pages/              # Page components
│   │   ├── Home.js         # Post listing page
│   │   ├── Profile.js      # User profile page
│   │   ├── CreatePost.js   # Post creation form
│   │   └── PostDetail.js   # Post detail with comments
│   ├── services/           # API integration
│   │   └── api.js          # Obfuscated API client
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.js      # Authentication context
│   ├── App.js              # Main app component
│   └── index.js            # App entry point
├── Dockerfile              # Multi-stage Docker build
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies and scripts
```

## Obfuscated API Integration

The frontend uses obfuscated endpoint URLs for security:

### Original vs Obfuscated Endpoints

| Function | Original Endpoint | Obfuscated Endpoint |
|----------|------------------|-------------------|
| Register | `/api/v1/auth/register` | `/api/x/1f217a698b25` |
| Login | `/api/v1/auth/login` | `/api/x/9592fc5373e2` |
| User Profile | `/api/v1/users/me` | `/api/x/5baaf1c55a0a` |
| Posts | `/api/v1/posts` | `/api/x/ff0d498c575b` |
| Comments | `/api/v1/comments` | `/api/x/0ebcf2cda524` |
| Reactions | `/api/v1/reactions` | `/api/x/7e7cc3288efb` |

### API Client Features

```javascript
// Example usage of the obfuscated API client
import HaivlerAPI from './services/api';

// Login with obfuscated endpoint
const result = await HaivlerAPI.login({ username, password });

// Create post with automatic authentication
const postResult = await HaivlerAPI.createPost({
  title: "My Image",
  description: "Description",
  image: fileObject
});

// All API calls automatically handle:
// - JWT token attachment
// - Error handling and token refresh
// - Obfuscated endpoint routing
```

## Key Components

### Authentication System

```javascript
// useAuth hook provides authentication state
const { user, login, register, logout, isAuthenticated } = useAuth();

// Protected routes automatically redirect to login
<ProtectedRoute>
  <CreatePost />
</ProtectedRoute>
```

### Post Management

- **Home Page**: Lists all posts with pagination and sorting (new/popular)
- **Create Post**: Image upload with title and description
- **Post Detail**: Full post view with comments and reactions

### Comments & Reactions

- **Comments**: Add, view, and delete comments (owner only)
- **Reactions**: Like/dislike posts with real-time count updates
- **User Permissions**: Edit/delete only own content

## Docker Integration

### Development Mode
```bash
# Run with hot reload
npm start
```

### Production Mode (Docker)
```bash
# Build and run with Docker
docker build -t haivler-frontend .
docker run -p 3000:80 haivler-frontend
```

### Full Stack with Docker Compose
```bash
# From backend directory
docker-compose up -d
```

The frontend will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000 (proxied through Nginx)

## Environment Configuration

```bash
# .env file
REACT_APP_API_URL=http://localhost:8000
GENERATE_SOURCEMAP=false
```

## Security Features

1. **Obfuscated Endpoints**: Uses hashed URLs to hide API structure
2. **JWT Authentication**: Secure token-based authentication
3. **Auto Token Refresh**: Handles expired tokens gracefully
4. **CSRF Protection**: Secure headers and proper CORS handling
5. **Input Validation**: Client-side validation with server-side verification

## User Interface

### Design Features
- **Clean, Modern UI**: Styled with styled-components
- **Responsive Design**: Mobile-friendly layout
- **Toast Notifications**: User feedback for actions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: Graceful error display and recovery

### Accessibility
- **Semantic HTML**: Proper HTML structure
- **Keyboard Navigation**: Tab-friendly interface
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: Accessible color schemes

## API Error Handling

```javascript
// Automatic error handling with user-friendly messages
try {
  const result = await HaivlerAPI.createPost(postData);
  if (result.success) {
    toast.success('Post created successfully!');
  } else {
    toast.error(result.error); // Backend error message
  }
} catch (error) {
  toast.error('Network error occurred'); // Client error handling
}
```

## Development Workflow

1. **Local Development**: `npm start` for hot reload
2. **Testing**: Built-in React testing utilities
3. **Building**: `npm run build` for production bundle
4. **Docker**: Multi-stage build for optimized production image

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

## Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Proper image sizing and loading
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Nginx-level caching for static assets
- **Lazy Loading**: Components loaded on demand

## Nginx Configuration

The production build uses Nginx with:
- **SPA Routing**: Fallback to index.html for client routes
- **API Proxying**: Backend requests proxied to avoid CORS
- **Static Caching**: Long-term caching for assets
- **Security Headers**: XSS protection and content type validation

## Getting Started

1. **Prerequisites**: Node.js 18+, Docker (optional)
2. **Install Dependencies**: `npm install`
3. **Environment Setup**: Configure `.env` file
4. **Start Development**: `npm start`
5. **Access Application**: http://localhost:3000

The frontend automatically connects to the backend's obfuscated endpoints and provides a complete social media experience for image sharing.