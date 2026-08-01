# Student Management REST API 🎓

A production-ready, highly scalable RESTful API for managing students, built using Node.js, Express, and PostgreSQL. This project enforces Clean Architecture, Role-Based Access Control (RBAC), and robust security practices suitable for enterprise environments.

## 🚀 Key Features

*   **Clean Layered Architecture:** Strict separation of Routes, Controllers, Services, and Data Access.
*   **Authentication & Authorization:** Secure JWT authentication stored in HTTP-Only cookies. Role-Based Access Control (Admin vs. Student).
*   **Security First:** Passwords hashed with `bcryptjs`. Headers secured with `helmet`. Cross-Site Scripting (XSS) and SQL Injection prevention out of the box.
*   **Advanced PostgreSQL Features:** UUID primary keys, foreign key constraints (`ON DELETE CASCADE`), database triggers for timestamp updates.
*   **Data Validation:** Request payloads validated and sanitized using `express-validator`.
*   **Robust Error Handling:** Centralized custom error handling middleware catching and formatting unhandled exceptions predictably.
*   **Pagination, Filtering, & Sorting:** Efficient database-level pagination (`LIMIT`, `OFFSET`) with dynamic filtering and sorting.
*   **Containerized Environment:** Fully Dockerized infrastructure (`Node.js` + `PostgreSQL`) via `docker-compose`.
*   **Automated Testing:** Integration testing setup via `jest` and `supertest`.
*   **Interactive Documentation:** Auto-generated Swagger UI portal.

---

## 🛠️ Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** PostgreSQL (`pg` connection pooling)
*   **Auth:** JSON Web Tokens (JWT)
*   **Testing:** Jest, Supertest
*   **Documentation:** Swagger OpenAPI (`swagger-ui-express`)
*   **Containerization:** Docker, Docker Compose

---

## 💻 Getting Started (Local Development)

### 1. Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL (v14 or higher) running locally

### 2. Environment Setup
Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd student-management-api
npm install
```

Create a `.env` file in the root directory and add your database credentials (refer to `.env.example`):
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=super_secret_key
```

### 3. Database Initialization
Run the database migration script to automatically create the tables and seed a default Admin user:
```bash
npm run db:init
```
*(Default Admin: `admin@example.com` | Password: `Admin@123456`)*

### 4. Run the Application
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 🐳 Getting Started (Docker)

If you have Docker installed, you don't need Node.js or PostgreSQL installed locally!

1. Ensure Docker Desktop is running.
2. Spin up the entire infrastructure:
   ```bash
   docker-compose up --build
   ```
The database schema will automatically initialize, and the API will be available at `http://localhost:5000`.

---

## 🧪 Testing

Run the automated integration tests:
```bash
npm test
```

---

## 📖 API Documentation (Swagger)

Once the server is running, navigate to the interactive API portal:
👉 **`http://localhost:5000/api-docs`**

You can register users, log in, and test all CRUD endpoints directly from the browser.

### Key Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user | Public |
| `POST` | `/api/v1/auth/login` | Login and receive JWT | Public |
| `GET` | `/api/v1/auth/logout` | Clear JWT cookie | Public |
| `POST` | `/api/v1/students` | Create student profile | **Admin Only** |
| `GET` | `/api/v1/students` | Get all students (paginated) | Admin/Student |
| `GET` | `/api/v1/students/:id` | Get student by ID | Admin/Student |
| `PUT` | `/api/v1/students/:id` | Update student profile | **Admin Only** |
| `DELETE` | `/api/v1/students/:id` | Delete student profile | **Admin Only** |

---
*Built with ❤️ for backend engineering excellence.*
