# Student Management REST API - Interview Study Guide

This document contains the core architectural decisions, design patterns, and technical explanations behind the Student Management REST API. Study this to ace your backend engineering interviews.

---

## 1. System Architecture: Why Layered (Clean) Architecture?

**Interview Question:** "Why did you separate routes, controllers, and services instead of putting all logic in `app.js`?"

**Answer:** 
We used a **Layered Architecture** (Controller-Service-Model pattern) to enforce the **Separation of Concerns (SoC)** principle.
*   **Routes Layer:** Maps HTTP verbs and endpoints to specific controllers.
*   **Validators Layer:** Uses `express-validator` to sanitize and validate raw incoming data before it ever reaches the controller, preventing malformed data from causing crashes.
*   **Controllers Layer:** Responsible ONLY for HTTP transport. It extracts data from `req.body` or `req.query`, calls the Service layer, and formats the JSON response with the correct HTTP Status Code (e.g., 200, 201).
*   **Services Layer:** Contains the pure **Business Logic** and database interactions. It knows absolutely nothing about HTTP, Express, headers, or cookies. 
*   **Benefit:** This makes the codebase highly maintainable and testable. You can test the Service layer without needing to mock HTTP requests, and you can reuse the same Service for a REST API, a GraphQL API, or a CLI tool.

---

## 2. Database Design & Connection Pooling

**Interview Question:** "Why did you use `pg.Pool` instead of just connecting a single client to PostgreSQL?"

**Answer:**
Opening a new TCP database connection for every single incoming HTTP request introduces massive latency (50ms–100ms per request) and quickly exhausts PostgreSQL's connection limits. 
*   **Connection Pooling** maintains a cache of open, reusable database connections. When a user requests data, the API borrows an active connection from the pool, executes the query, and instantly returns the connection to the pool. 
*   This allows the API to handle thousands of concurrent requests efficiently without crashing the database server.

**Interview Question:** "Why did you use UUIDs instead of auto-incrementing integers for Primary Keys?"

**Answer:**
Sequential integer IDs (e.g., `1, 2, 3`) are vulnerable to **ID Enumeration Attacks** (Insecure Direct Object Reference or IDOR). If a user sees their profile is `/users/15`, they can easily guess `/users/16` and attempt to scrape or modify another user's data. UUIDs are cryptographically random and virtually impossible to guess, adding a layer of security through obscurity.

---

## 3. Security: Authentication & Authorization

**Interview Question:** "Explain your authentication flow. Why use HTTP-Only cookies instead of storing the JWT in LocalStorage?"

**Answer:**
We implemented **JSON Web Tokens (JWT)** for stateless authentication.
*   When a user logs in, we verify their password using **bcrypt** (which protects against rainbow table attacks by adding a unique cryptographic salt to the hash).
*   We generate a JWT containing their `id` and `role`.
*   Crucially, we send this JWT back to the client inside an **HTTP-Only, Secure Cookie**. 
*   **Why HTTP-Only?** If a JWT is stored in LocalStorage, any malicious JavaScript running on the frontend (Cross-Site Scripting / XSS) can read the token and steal the user's session. HTTP-Only cookies cannot be accessed by client-side JavaScript, rendering XSS token theft impossible.

**Interview Question:** "How does your Role-Based Access Control (RBAC) work?"

**Answer:**
We created two middlewares: `authenticate` and `authorize`.
1.  `authenticate`: Extracts the JWT from the cookie, verifies the cryptographic signature, fetches the user from PostgreSQL, and attaches `req.user = user`.
2.  `authorize('admin')`: Runs immediately after `authenticate`. It checks if `req.user.role === 'admin'`. If not, it rejects the request with a `403 Forbidden`. This ensures students can view data (`GET`) but cannot tamper with it (`POST`, `PUT`, `DELETE`).

---

## 4. Robust Error Handling

**Interview Question:** "How do you handle errors in your Express application?"

**Answer:**
We built a **Centralized Error Handling Infrastructure** to ensure the API never leaks stack traces or crashes unexpectedly.
1.  **Custom `ApiError` Class:** Extends the native Node `Error` object to include HTTP status codes and validation error arrays.
2.  **`asyncHandler` Wrapper:** Wrapping every controller in `asyncHandler` eliminates repetitive `try-catch` blocks. If any Promise rejects in the service layer, `asyncHandler` catches it and forwards it via `next(err)`.
3.  **Global Error Middleware:** Sitting at the very bottom of the Express stack, this middleware intercepts all errors. It intercepts specific database errors (like Postgres code `23505` for Unique Constraint violations) and translates them into clean JSON responses (`400 Bad Request`). In production, it strips the stack trace to prevent leaking sensitive system architecture details.

---

## 5. Defense in Depth (Middlewares)

**Interview Question:** "What security middlewares did you use and why?"

**Answer:**
*   **Helmet.js:** Adds over a dozen secure HTTP response headers. For example, `X-Frame-Options: DENY` prevents Clickjacking (embedding our site in a malicious iframe), and `X-Content-Type-Options: nosniff` prevents MIME-sniffing attacks.
*   **Express JSON body limits:** `express.json({ limit: '10kb' })` prevents Denial of Service (DoS) attacks where a malicious user tries to crash the server by sending a 5-gigabyte JSON payload.
*   **CORS:** Configured to only allow requests from trusted origins (like our frontend application), preventing cross-origin abuse.
*   **Express-Validator:** Validates and sanitizes all inputs (e.g., checking if an email is valid, enforcing password length, ensuring pagination limits).

---

## 6. Pagination, Filtering, and Sorting

**Interview Question:** "How did you implement pagination and sorting efficiently?"

**Answer:**
Instead of fetching all students into Node.js memory (which would crash the server for large datasets), we handle pagination entirely inside PostgreSQL using `LIMIT` and `OFFSET`.
*   **`LIMIT`** controls the page size (how many rows to fetch).
*   **`OFFSET`** controls the starting point (calculated as `(page - 1) * limit`).
*   **Sorting Safety:** To prevent SQL Injection via the `ORDER BY` clause, we mapped the user's `sort_by` query string against a strict dictionary of allowed columns (e.g., `'cgpa': 's.cgpa'`). If they pass a malicious string, it defaults to a safe column like `created_at`.
*   **Metadata:** We execute a fast `SELECT COUNT(*)` query alongside the data query to return `totalItems` and `totalPages` to the frontend, which is necessary for rendering pagination UI controls.

---

## 7. Docker and Unit Testing

**Interview Question:** "I see you used Docker. Why?"

**Answer:**
Docker containerizes the Node.js application and the PostgreSQL database into isolated environments. This eliminates the "it works on my machine" problem. By using `docker-compose`, another developer (or the production server) can spin up the entire infrastructure—with the database schema automatically seeded—using a single command, ensuring absolute environmental consistency.

**Interview Question:** "How are your unit tests structured?"

**Answer:**
We use **Jest** as the test runner and **Supertest** for integration testing. Supertest allows us to inject HTTP requests directly into the Express `app` instance without having to start a physical network server on a port. This prevents port collision errors during CI/CD pipelines and makes tests run blazingly fast.
