# DevPulse – Internal Tech Issue & Feature Tracker

## Live URL

[(https://dev-pulse-a2-mauve.vercel.app/)]

---

## Project Overview

DevPulse is a collaborative issue tracking platform designed for software development teams. It enables contributors to report bugs and feature requests, while maintainers can manage, update, and resolve reported issues.

The application provides role-based access control using JWT authentication and supports issue lifecycle management through different statuses.

---

## Features

### Authentication & Authorization

* User registration
* User login with JWT authentication
* Role-based access control
* Supported roles:

  * Contributor
  * Maintainer

### Issue Management

* Create new issues
* Retrieve all issues with:

  * Sorting
  * Filtering by type
  * Filtering by status
* Retrieve single issue details
* Update issues
* Delete issues (Maintainer only)

### Access Control Rules

#### Contributor

* Create issues
* View issues
* Update only their own issues
* Can update only when issue status is `open`

#### Maintainer

* View all issues
* Update any issue
* Delete any issue

### Query Features

Supported query parameters:

```http
GET /api/issues?sort=newest
GET /api/issues?sort=oldest
GET /api/issues?type=bug
GET /api/issues?status=open
GET /api/issues?sort=newest&type=bug&status=open
```

---

## Technology Stack

### Backend

* Node.js
* TypeScript
* Express.js

### Database

* PostgreSQL
* pg (Native PostgreSQL Driver)

### Authentication

* JSON Web Token (JWT)
* bcrypt

### Deployment

* Vercel

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/fakhrulhasan99/DevPulse---A2
```

### 2. Navigate to project directory

```bash
cd devpulse
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret
```

### 5. Run the project

Development:

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

---

## API Endpoints

### Authentication

#### Register User

```http
POST /api/auth/signup
```

#### Login User

```http
POST /api/auth/login
```

---

### Issues

#### Create Issue

```http
POST /api/issues
```

Access:

```text
Contributor, Maintainer
```

---

#### Get All Issues

```http
GET /api/issues
```

Query Parameters:

| Parameter | Values                      |
| --------- | --------------------------- |
| sort      | newest, oldest              |
| type      | bug, feature_request        |
| status    | open, in_progress, resolved |

---

#### Get Single Issue

```http
GET /api/issues/:id
```

---

#### Update Issue

```http
PATCH /api/issues/:id
```

Access:

```text
Maintainer OR Issue Owner (Contributor)
```

---

#### Delete Issue

```http
DELETE /api/issues/:id
```

Access:

```text
Maintainer Only
```

---

## Database Schema Summary

### Users Table

| Field      | Type                |
| ---------- | ------------------- |
| id         | SERIAL PRIMARY KEY  |
| name       | VARCHAR(100)        |
| email      | VARCHAR(255) UNIQUE |
| password   | TEXT                |
| role       | VARCHAR(20)         |
| created_at | TIMESTAMP           |
| updated_at | TIMESTAMP           |

---

### Issues Table

| Field       | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| reporter_id | INTEGER            |
| title       | VARCHAR(150)       |
| description | TEXT               |
| type        | VARCHAR(30)        |
| status      | VARCHAR(30)        |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

---

## Default Issue Status Flow

```text
open
  ↓
in_progress
  ↓
resolved
```

---

## Authentication

Protected routes require JWT token:

```http
Authorization: <JWT_TOKEN>
```

Example:

```http
Authorization: eyJhbGciOiJIUzI1NiIs...
```

---

## Project Structure

```text
src
│
├── config
├── database
├── middleware
├── modules
│   ├── auth
│   └── issues
│
├── types
├── utils
│
├── app.ts
└── server.ts
```

---

## Author

Fakhrul Hasan
