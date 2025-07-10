# Real-Time Chat Application

A full-stack real-time chat application built with Node.js/Express backend and React frontend, featuring WebSocket communication, JWT authentication, and MongoDB database integration.

## Live Demo

- **Frontend**: [https://adorable-youtiao-284ca3.netlify.app](https://adorable-youtiao-284ca3.netlify.app)
- **Backend API**: [https://real-time-chat-app-4p7j.onrender.com](https://real-time-chat-app-4p7j.onrender.com)

## Users for testing:
1. dornow ; Dor123!@#
2. dortest ; Dortest123!@#

## Technology Stack

### Backend Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access & Refresh tokens)
- **Real-time Communication**: WebSockets (native)
- **Security**: bcrypt for password hashing
- **File Upload**: Multer for profile pictures
- **CORS**: Cross-origin resource sharing enabled

### Frontend Technologies

- **Framework**: React.js
- **Styling**: Bootstrap & React-Bootstrap
- **Routing**: React Router
- **WebSocket**: Native WebSocket API
- **State Management**: React Hooks (useState, useEffect)

## System Architecture

### API Design

The application follows RESTful principles with the following endpoint structure:

- **Authentication**: `/api/auth/` - User registration, login, and token management
- **User Management**: `/api/user/` - Profile operations and user data
- **Chat Operations**: `/api/chat/` - Chat room creation and management
- **Message Handling**: `/api/message/` - Message operations and history

### Real-time Communication

WebSocket implementation provides:

- **Instant Message Delivery**: Real-time bidirectional communication
- **User Presence Tracking**: Online/offline status indicators
- **Typing Indicators**: Live typing status updates
- **Chat Notifications**: New chat creation alerts
- **Message Status**: Read receipts and delivery confirmation

### Database Design

**Users Collection**

- Authentication credentials and security data
- User profiles and personal information
- Contact lists and relationship management
- Chat references and permissions

**Chats Collection**

- Support for both group and private conversations
- Participant management and roles
- Last message tracking and metadata
- Chat settings and configurations

**Messages Collection**

- Message content and formatting
- Author information and timestamps
- Read status and delivery tracking
- Message threading and replies

### Security Implementation

**Authentication & Authorization**

- Dual-token JWT system (access and refresh tokens)
- Secure password hashing using bcrypt
- Session management and token rotation
- Middleware-based route protection

**Data Validation & Protection**

- Password strength requirements and validation
- Age verification system (18+ requirement)
- Input sanitization and SQL injection prevention
- CORS configuration for cross-origin security
- Rate limiting and request throttling

## Key Features

### Core Functionality

- User registration and authentication
- Real-time messaging with instant delivery
- Private and group chat support
- File sharing and media upload
- Message history and search
- User profiles with customizable avatars

### User Experience

- Responsive design for all devices
- Intuitive chat interface
- Typing indicators and read receipts
- Online presence indicators
- Push notifications for new messages
- Dark/light theme support

### Administrative Features

- User management and moderation
- Chat analytics and reporting
- Content filtering and spam protection
- Backup and data export capabilities

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install backend dependencies
3. Configure environment variables
4. Install frontend dependencies
5. Start the development servers

### Environment Configuration

Required environment variables for backend:

- Database connection string
- JWT secret keys
- CORS origins
- File upload settings
- WebSocket configuration
