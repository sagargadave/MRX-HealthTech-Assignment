import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface PatientRecord extends RowDataPacket {
  id: number;
  patient_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  medical_history: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientListFilters {
  search?: string;
  gender?: string;
}

export async function listPatients(filters: PatientListFilters) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.search && filters.search.trim()) {
    conditions.push('(p.patient_id LIKE ? OR p.name LIKE ?)');
    const like = `%${filters.search.trim()}%`;
    params.push(like, like);
  }

  if (filters.gender && filters.gender !== 'All') {
    conditions.push('p.gender = ?');
    params.push(filters.gender);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.*, COUNT(tr.id) AS test_record_count
     FROM patients p
     LEFT JOIN test_records tr ON tr.patient_id = p.id
     ${whereClause}
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    params
  );

  return rows;
}

export async function getPatientById(id: number): Promise<PatientRecord | null> {
  const [rows] = await pool.query<PatientRecord[]>('SELECT * FROM patients WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function getPatientByPatientId(patientId: string): Promise<PatientRecord | null> {
  const [rows] = await pool.query<PatientRecord[]>('SELECT * FROM patients WHERE patient_id = ? LIMIT 1', [patientId]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createPatient(input: {
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  medical_history?: string | null;
}): Promise<PatientRecord> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO patients (patient_id, name, age, gender, medical_history) VALUES (?, ?, ?, ?, ?)`,
    [input.patient_id, input.name, input.age, input.gender, input.medical_history ?? null]
  );
  const created = await getPatientById(result.insertId);
  return created as PatientRecord;
}

export async function updatePatient(
  id: number,
  input: Partial<{ name: string; age: number; gender: string; medical_history: string | null }>
): Promise<PatientRecord | null> {
  const fields: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) {
    fields.push('name = ?');
    params.push(input.name);
  }
  if (input.age !== undefined) {
    fields.push('age = ?');
    params.push(input.age);
  }
  if (input.gender !== undefined) {
    fields.push('gender = ?');
    params.push(input.gender);
  }
  if (input.medical_history !== undefined) {
    fields.push('medical_history = ?');
    params.push(input.medical_history);
  }

  if (fields.length === 0) {
    return getPatientById(id);
  }

  params.push(id);
  await pool.query(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, params);
  return getPatientById(id);
}

export async function deletePatient(id: number): Promise<boolean> {
  // ON DELETE CASCADE on test_records.patient_id handles associated test
  // records automatically at the database level (see schema.sql).
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM patients WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
