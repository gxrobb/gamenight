import { query } from './database';
import bcrypt from 'bcryptjs';
import { DatabaseUser, CreateUserData, LoginCredentials } from '@/types/user';

// Re-export types for backward compatibility
export type { DatabaseUser as User, CreateUserData, LoginCredentials };

// Create a new user
export async function createUser(
  userData: CreateUserData
): Promise<DatabaseUser> {
  const { username, email, password } = userData;

  // Hash the password
  const saltRounds = 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `INSERT INTO users (username, email, password_hash) 
     VALUES ($1, $2, $3) 
     RETURNING id, username, email, is_active, created_at, updated_at`,
    [username, email, password_hash]
  );

  return result.rows[0];
}

// Find user by username
export async function findUserByUsername(
  username: string
): Promise<DatabaseUser | null> {
  const result = await query(
    'SELECT id, username, email, is_active, created_at, updated_at FROM users WHERE username = $1',
    [username]
  );

  return result.rows[0] || null;
}

// Find user by email
export async function findUserByEmail(
  email: string
): Promise<DatabaseUser | null> {
  const result = await query(
    'SELECT id, username, email, is_active, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<DatabaseUser | null> {
  const result = await query(
    'SELECT id, username, email, is_active, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  return result.rows[0] || null;
}

// Verify user password
export async function verifyPassword(
  username: string,
  password: string
): Promise<DatabaseUser | null> {
  const result = await query(
    'SELECT id, username, email, password_hash, is_active, created_at, updated_at FROM users WHERE username = $1',
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Update user
export async function updateUser(
  id: string,
  updates: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>
): Promise<DatabaseUser | null> {
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
     RETURNING id, username, email, is_active, created_at, updated_at`,
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
