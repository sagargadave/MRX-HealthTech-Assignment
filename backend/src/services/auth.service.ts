import bcrypt from 'bcrypt';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface UserRecord extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const [rows] = await pool.query<UserRecord[]>('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows.length > 0 ? rows[0] : null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const [rows] = await pool.query<UserRecord[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/** Returns a user object safe to send to the client (never includes password_hash). */
export function toSafeUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}
