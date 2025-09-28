import { query } from './database';
import bcrypt from 'bcryptjs';

export interface User {
  id: string; // Changed to string for UUID
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Create a new user
export async function createUser(userData: CreateUserData): Promise<User> {
  const { username, email, password, first_name, last_name } = userData;

  // Hash the password
  const saltRounds = 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, username, email, first_name, last_name, is_active, created_at, updated_at`,
    [username, email, password_hash, first_name, last_name]
  );

  return result.rows[0];
}

// Find user by username
export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query(
    'SELECT id, username, email, first_name, last_name, is_active, created_at, updated_at FROM users WHERE username = $1',
    [username]
  );

  return result.rows[0] || null;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    'SELECT id, username, email, first_name, last_name, is_active, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const result = await query(
    'SELECT id, username, email, first_name, last_name, is_active, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
}

// Verify user password
export async function verifyPassword(username: string, password: string): Promise<User | null> {
  const result = await query(
    'SELECT id, username, email, first_name, last_name, password_hash, is_active, created_at, updated_at FROM users WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return null;
  }

  // Remove password_hash from returned user object
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Update user
export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
  const fields = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  const result = await query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $${paramCount} 
     RETURNING id, username, email, first_name, last_name, is_active, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
}

// Delete user (soft delete)
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );

  return result.rowCount > 0;
}
