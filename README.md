# City Connector

A full-stack civic issue reporting platform built with React, Node.js, and PostgreSQL.

## Features

### For Citizens
- Register and login
- Submit complaints with images and location
- Track complaint status
- View complaint history
- Provide feedback on resolved complaints

### For Admins
- View all complaints
- Assign complaints to departments
- Update complaint status
- View analytics dashboard
- Manage departments

### For Departments
- View assigned complaints
- Update progress
- Mark complaints as resolved

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- Context API

### Backend
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- Multer for file uploads
- bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database configuration.

4. Create the database and run the schema:
```sql
CREATE DATABASE city_connector;
```
Then run the SQL script from `backend/config/database.sql`.

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Admin Account

- Email: `admin@cityconnector.com`
- Password: `password`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Complaints
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints` - Get all complaints (admin only)
- `GET /api/complaints/:id` - Get complaint by ID
- `GET /api/complaints/user/my-complaints` - Get user's complaints
- `PUT /api/complaints/:id/status` - Update complaint status
- `PUT /api/complaints/:id/assign` - Assign department to complaint
- `GET /api/complaints/stats/all` - Get complaint statistics

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department (admin only)
- `GET /api/departments/:id/complaints` - Get department complaints

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback/complaint/:id` - Get feedback by complaint ID
- `GET /api/feedback/stats/all` - Get feedback statistics

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications/unread/count` - Get unread notification count

## Database Schema

### Users
- id (PK)
- name
- email (unique)
- password
- role (citizen/admin/department)
- phone
- created_at

### Departments
- id
- department_name
- email

### Complaints
- id (PK)
- title
- description
- category
- image_url
- location
- status
- priority
- user_id (FK)
- department_id (FK)
- created_at
- updated_at

### Feedback
- id
- complaint_id (FK)
- rating
- comments
- created_at

### Notifications
- id
- user_id (FK)
- message
- is_read
- created_at

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Register as a new user or login with the admin account
4. Submit and manage complaints based on your role

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.
