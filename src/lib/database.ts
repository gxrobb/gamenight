import {Pool} from 'pg';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gamenight',
  user: process.env.DB_USER || 'gamenight_user',
  password: process.env.DB_PASSWORD || 'gamenight_password',
  ssl:
    process.env.NODE_ENV === 'production' ? {rejectUnauthorized: false} : false,
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Execute a query
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Get a client from the pool
export async function getClient() {
  return await pool.connect();
}

// Close the pool (call this when shutting down the app)
export async function closePool() {
  await pool.end();
}

export default pool;
