import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'healthcare_monitoring',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATE columns as 'YYYY-MM-DD' strings instead of JS Date
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
    console.log('[database] MySQL connection successful');
  } finally {
    conn.release();
  }
}

export default pool;
