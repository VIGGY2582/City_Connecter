# City Connector - Municipal Complaint Management System

A comprehensive web application for citizens to submit complaints to municipal departments and track their resolution status.

## 📋 Project Overview

City Connector is a full-stack web application that bridges the communication gap between citizens and municipal departments. It allows citizens to submit various types of complaints (sanitation, water supply, traffic, public works, electricity) and enables department officials to efficiently manage and resolve these issues.

### 🎯 Key Features

- **Citizen Portal**: Submit and track complaints
- **Department Dashboard**: View and manage assigned complaints
- **Admin Panel**: User management and department administration
- **Real-time Updates**: Status tracking and notifications
- **Role-based Access**: Secure authentication system
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend (Client-Side)

#### Core Technologies
- **React 18** - Modern JavaScript library for building user interfaces
  - *Why*: Component-based architecture, virtual DOM, excellent ecosystem
  - *Used for*: All UI components, routing, state management

- **Vite** - Next-generation build tool and development server
  - *Why*: Lightning-fast HMR, optimized builds, modern tooling
  - *Used for*: Development server, bundling, asset optimization

- **React Router DOM** - Client-side routing library
  - *Why*: Declarative routing, route protection, navigation
  - *Used for*: Page navigation, protected routes, URL management

#### UI Framework & Styling
- **Bootstrap 5** - CSS framework for responsive design
  - *Why*: Pre-built components, grid system, cross-browser compatibility
  - *Used for*: Layouts, forms, buttons, responsive design

- **React Bootstrap** - Bootstrap components for React
  - *Why*: Bootstrap integration with React components
  - *Used for*: Forms, modals, navigation components

#### HTTP Client & State Management
- **Axios** - Promise-based HTTP client
  - *Why*: Request/response transformation, error handling, interceptors
  - *Used for*: API calls, authentication headers, error handling

- **React Context API** - Global state management
  - *Why*: Built-in solution for global state, provider pattern
  - *Used for*: Authentication state, user data, global settings

### Backend (Server-Side)

#### Core Framework
- **Node.js** - JavaScript runtime for server-side development
  - *Why*: Non-blocking I/O, npm ecosystem, JavaScript everywhere
  - *Used for*: Server runtime, API endpoints, middleware

- **Express.js** - Web application framework
  - *Why*: Minimalist, flexible, extensive middleware ecosystem
  - *Used for*: REST API, routing, middleware, error handling

#### Database & ORM
- **PostgreSQL** - Powerful relational database
  - *Why*: ACID compliance, complex queries, scalability, JSON support
  - *Used for*: User data, complaints, departments, relationships

- **Node.js pg** - PostgreSQL client for Node.js
  - *Why*: Native PostgreSQL driver, connection pooling, async/await support
  - *Used for*: Database queries, transactions, connection management

#### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
  - *Why*: Secure, scalable, no server-side session storage
  - *Used for*: User authentication, API authorization, token validation

- **bcryptjs** - Password hashing library
  - *Why*: Secure password storage, salted hashes, timing attacks protection
  - *Used for*: Password hashing, user registration, login verification

#### Security Middleware
- **Helmet** - Security header middleware
  - *Why*: Protection against common web vulnerabilities
  - *Used for*: Security headers, XSS protection, content security

- **CORS** - Cross-Origin Resource Sharing
  - *Why*: Enable frontend-backend communication
  - *Used for*: API access from different origins, browser security

#### Development Tools
- **Nodemon** - Auto-restart development server
  - *Why*: Automatic restart on file changes, improved development workflow
  - *Used for*: Development server, hot reloading, file watching

- **Morgan** - HTTP request logger
  - *Why*: Request logging, debugging, monitoring
  - *Used for*: API logging, request tracking, development debugging

## 🏗️ Architecture

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'citizen', 'admin', 'department'
    department_id INTEGER REFERENCES departments(id),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Departments Table
```sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Complaints Table
```sql
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    location TEXT,
    citizen_id INTEGER REFERENCES users(id),
    department_id INTEGER REFERENCES departments(id),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

#### Complaint Routes (`/api/complaints`)
- `GET /` - Get all complaints (admin)
- `GET /my-complaints` - Get user complaints (citizen)
- `GET /department` - Get department complaints (department)
- `POST /` - Create new complaint
- `PUT /:id` - Update complaint status
- `DELETE /:id` - Delete complaint

#### Department Routes (`/api/departments`)
- `GET /` - Get all departments
- `POST /` - Create department (admin)
- `PUT /:id` - Update department (admin)
- `DELETE /:id` - Delete department (admin)

## 🔐 Authentication & Authorization

### Role-Based Access Control

1. **Citizen Role**
   - Submit complaints
   - View own complaints
   - Update profile

2. **Department Role**
   - View assigned complaints
   - Update complaint status
   - Add resolution notes
   - View department analytics

3. **Admin Role**
   - Full system access
   - User management
   - Department management
   - All complaint access
   - System configuration

### JWT Implementation

#### Token Structure
```javascript
{
  "id": user_id,
  "iat": issued_at,
  "exp": expiration_time
}
```

#### Middleware Flow
1. **Authentication Middleware** (`auth.js`)
   - Verify JWT token
   - Extract user information
   - Attach user to request object

2. **Authorization Middleware** (`authorize.js`)
   - Check user role
   - Validate resource access
   - Enforce business rules

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── ComplaintList.jsx
│   ├── ComplaintCard.jsx
│   └── DepartmentManagement.jsx
├── context/            # Global state management
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Register.jsx
│   └── Profile.jsx
├── services/           # API integration
│   └── api.js
└── utils/              # Helper functions
    └── constants.js
```

### State Management

#### AuthContext Pattern
```javascript
const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: () => {},
  logout: () => {},
  register: () => {}
});
```

#### Protected Routes
```javascript
<ProtectedRoute>
  {user ? <Outlet /> : <Navigate to="/login" />}
</ProtectedRoute>
```

## 🚀 Development Workflow

### Environment Setup

#### Backend Environment Variables (`.env`)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=city_connector
DB_USER=postgres
DB_PASSWORD=your-password
```

#### Frontend Configuration
- **Development Server**: `http://localhost:5173`
- **API Base URL**: `http://localhost:5000/api`
- **Build Output**: `dist/`

### Scripts

#### Backend Scripts
```json
{
  "start": "node backend/server.js",
  "dev": "nodemon backend/server.js",
  "test": "jest"
}
```

#### Frontend Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## 🔧 Key Implementation Details

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Storage**: Only hashed passwords in database
- **Validation**: Password strength requirements

### Error Handling
- **Frontend**: Axios interceptors, user-friendly messages
- **Backend**: Try-catch blocks, proper HTTP status codes
- **Database**: Transaction rollback on errors

### Input Validation
- **Frontend**: HTML5 form validation, React state validation
- **Backend**: Express validation middleware, sanitization
- **Database**: Constraints, data types, NOT NULL fields

### Responsive Design
- **Breakpoints**: Mobile (<576px), Tablet (576-768px), Desktop (>768px)
- **Components**: Bootstrap grid system, responsive utilities
- **Testing**: Chrome DevTools, mobile emulation

## 📊 Data Flow

### Complaint Submission Flow
1. **Citizen** submits complaint form
2. **Frontend** validates and sends to backend
3. **Backend** validates and saves to database
4. **System** assigns to appropriate department
5. **Notification** sent to department users
6. **Dashboard** updates for department officials

### User Authentication Flow
1. **User** enters credentials
2. **Frontend** sends login request
3. **Backend** validates credentials
4. **JWT token** generated and returned
5. **Frontend** stores token and user data
6. **Subsequent requests** include Authorization header

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Cypress for user flows

### Backend Testing
- **Unit Tests**: Jest for individual functions
- **Integration Tests**: Supertest for API endpoints
- **Database Tests**: Test database operations

## 📦 Deployment Considerations

### Production Environment
- **Frontend**: Static files on CDN or web server
- **Backend**: Node.js server with PM2 or Docker
- **Database**: PostgreSQL with connection pooling
- **Security**: HTTPS, environment variables, rate limiting

### Performance Optimization
- **Frontend**: Code splitting, lazy loading, caching
- **Backend**: Database indexing, query optimization
- **Network**: CDN, compression, caching headers

## 🤝 Contributing Guidelines

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start backend: `npm run dev` (port 5000)
4. Start frontend: `npm run frontend` (port 5173)
5. Configure database connection

### Code Standards
- **ESLint**: JavaScript code quality
- **Prettier**: Code formatting
- **Git**: Conventional commits, feature branches

## 📝 Project Summary

City Connector demonstrates a complete full-stack application with:

- **Modern Tech Stack**: React, Node.js, PostgreSQL
- **Security Best Practices**: JWT, bcrypt, CORS, Helmet
- **Scalable Architecture**: Component-based, RESTful APIs
- **User Experience**: Responsive design, real-time updates
- **Maintainable Code**: Clear structure, documentation, testing

This project serves as a comprehensive example of building real-world web applications with industry-standard technologies and best practices.

---

**🚀 Ready for Production**: The application is production-ready with proper security, error handling, and scalability considerations.

**📚 Learning Resource**: Perfect for understanding full-stack development, authentication, and database design.

**🔧 Extensible**: Easy to add new features, departments, or integrate with external services.
