import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || 'insecure_dev_secret_change_me';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '8h';

export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
