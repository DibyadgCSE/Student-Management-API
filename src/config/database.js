const { Pool } = require('pg');

// Create PostgreSQL connection pool using environment configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'student_management_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
});

// Event listener for pool connection logging
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('📦 Connected to PostgreSQL database pool');
  }
});

// Event listener for idle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  process.exit(-1);
});

/**
 * Executes a single SQL query against the pool.
 * @param {string} text - The SQL query text.
 * @param {Array} params - Parameterized query arguments to prevent SQL injection.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Gets a dedicated client from the pool (used for database transactions).
 */
const getClient = () => pool.getClient();

module.exports = {
  pool,
  query,
  getClient,
};
