/**
 * Seed runner.
 *
 * Usage: `npm run seed` (from the backend/ directory), after MySQL is
 * running and .env is configured.
 *
 * This script:
 *   1. Runs database/schema.sql (creates the database + tables, safe to
 *      re-run thanks to CREATE TABLE IF NOT EXISTS).
 *   2. Runs database/seed.sql (inserts dummy biomarkers/patients/test
 *      records, safe to re-run thanks to ON DUPLICATE KEY UPDATE).
 *   3. Creates the demo doctor account (doctor@example.com / Doctor@123)
 *      with a bcrypt-hashed password, if it doesn't already exist. The
 *      hash is computed here in Node so a real bcrypt hash never needs to
 *      be hand-written into a .sql file.
 */
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_DOCTOR = {
  name: 'Dr. Demo Doctor',
  email: 'doctor@example.com',
  password: 'Doctor@123',
  role: 'doctor',
};

async function runSqlFile(connection: mysql.Connection, filePath: string) {
  const rawSql = fs.readFileSync(filePath, 'utf-8');

  // Strip full-line "-- ..." comments BEFORE splitting into statements.
  // (Splitting first and then discarding any chunk that "starts with --"
  // is wrong: a comment header sitting directly above a CREATE TABLE
  // statement gets merged with it into one chunk, and that whole chunk -
  // real SQL included - was being thrown away. Stripping comment lines
  // first means only genuine SQL remains before we ever split on ';'.)
  const withoutComments = rawSql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  const statements = withoutComments
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await connection.query(statement);
    } catch (err: any) {
      // Make re-running the seed script safe: CREATE TABLE IF NOT EXISTS
      // and INSERT ... ON DUPLICATE KEY UPDATE already tolerate re-runs,
      // but CREATE INDEX has no "IF NOT EXISTS" equivalent on most MySQL
      // versions, so ignore "index/key already exists" specifically.
      if (err && (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_DUP_FIELDNAME')) {
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: false,
  });

  console.log('[seed] Applying schema.sql ...');
  await runSqlFile(connection, path.join(__dirname, '..', '..', 'database', 'schema.sql'));

  console.log('[seed] Applying seed.sql ...');
  await connection.changeUser({ database: process.env.DB_NAME || 'healthcare_monitoring' });
  await runSqlFile(connection, path.join(__dirname, '..', '..', 'database', 'seed.sql'));

  console.log('[seed] Ensuring demo doctor account exists ...');
  const [rows] = await connection.query<any[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [
    DEMO_DOCTOR.email,
  ]);

  if (Array.isArray(rows) && rows.length > 0) {
    console.log(`[seed] Demo doctor already exists (${DEMO_DOCTOR.email}), skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(DEMO_DOCTOR.password, 10);
    await connection.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      DEMO_DOCTOR.name,
      DEMO_DOCTOR.email,
      passwordHash,
      DEMO_DOCTOR.role,
    ]);
    console.log(`[seed] Demo doctor created: ${DEMO_DOCTOR.email} / ${DEMO_DOCTOR.password}`);
  }

  await connection.end();
  console.log('[seed] Done.');
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
