# Installation Guide: City Connector

This guide outlines all the necessary steps to run the City Connector application on a new laptop.

## Prerequisites

Before starting, ensure that you have the following software installed on your machine:
1. **Git**: Required to clone the repository. [Download Git](https://git-scm.com/downloads)
2. **Node.js**: Required to install dependencies and run the frontend/backend servers. (We recommend v18 or later) [Download Node.js](https://nodejs.org/en/download/)
3. **PostgreSQL**: Required for the database. Install PostgreSQL and PgAdmin (optional but recommended for a graphical interface). [Download PostgreSQL](https://www.postgresql.org/download/)

---

## 1. Clone the Repository

Open your terminal (or Command Prompt/Git Bash) and clone the repository locally:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd City_Connecter
```

---

## 2. Set Up the Database

First, open the **psql** command line tool, or use **pgAdmin** to create the required database and tables.

### Step 2.1: Create the Database
```sql
CREATE DATABASE city_connector;
```

*(Connect to the `city_connector` database before running the following queries)*

### Step 2.2: Create the Tables
Run these SQL scripts to create the basic tables:

#### Departments Table
```sql
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- Examples: 'citizen', 'admin', 'department'
    department_id INTEGER REFERENCES departments(id),
    phone VARCHAR(20),
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

### Step 2.3: Insert Initial Data
You can insert an admin and some initial departments so that you can log in immediately. The password must be hashed inside the registration flow, so the easiest approach is to create a test user *after* starting your backend via the normal `/register` route. However, here are some base departments to insert directly via SQL:

```sql
INSERT INTO departments (department_name, email)
VALUES ('Sanitation', 'sanitation@city.gov'),
       ('Water Supply', 'water@city.gov'),
       ('Traffic', 'traffic@city.gov'),
       ('Public Works', 'publicworks@city.gov'),
       ('Electricity', 'electricity@city.gov');
```

---

## 3. Set Up the Backend Environment

1. In the root of the project folder (`City_Connecter`), create a file named `.env`.
2. Add the following environment variables to the `.env` file. Be sure to replace `your-password` with your real PostgreSQL password:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key-make-it-secure
DB_HOST=localhost
DB_PORT=5432
DB_NAME=city_connector
DB_USER=postgres
DB_PASSWORD=your-password
```

3. Install the dependencies for the backend. From the main `City_Connecter` directory, run:
```bash
npm install
```

---

## 4. Set Up the Frontend Environment

1. Navigate into the `frontend` folder:
```bash
cd frontend
```

2. Inside the `frontend` directory, create a `.env` file (or just use the default development config) if your API is configured for anything other than `localhost:5000`. By default, Vite configurations typically handle their proxy or use standard `.env` variables.

3. Install the frontend dependencies:
```bash
npm install
```

---

## 5. Running the Application

Once everything is installed, you need to run two separate terminal windows—one for the backend and one for the frontend.

### Terminal 1 - Start the Backend Server
```bash
# In the root 'City_Connecter' directory
npm run dev
```
*(This will typically use nodemon to run the backend on port 5000: http://localhost:5000)*

### Terminal 2 - Start the Frontend
```bash
# In the 'City_Connecter/frontend' directory
npm run dev
```
*(This usually runs the Vite app on port 5173: http://localhost:5173)*

---

## 6. Access the Application

- Open your browser and go to: `http://localhost:5173`
- You are now ready to register a new user or log in to the application!
