import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface TestRecordRow extends RowDataPacket {
  id: number;
  patient_id: number;
  biomarker_id: number;
  result_value: string; // DECIMAL comes back as string from mysql2
  unit: string;
  test_date: string;
  created_at: string;
  updated_at: string;
  patient_display_id?: string;
  patient_name?: string;
  biomarker_name?: string;
}

const BASE_SELECT = `
  SELECT tr.*, p.patient_id AS patient_display_id, p.name AS patient_name, b.name AS biomarker_name
  FROM test_records tr
  JOIN patients p ON p.id = tr.patient_id
  JOIN biomarkers b ON b.id = tr.biomarker_id
`;

export async function listAllTestRecords(limit?: number): Promise<TestRecordRow[]> {
  const query = `${BASE_SELECT} ORDER BY tr.test_date DESC, tr.id DESC ${limit ? 'LIMIT ?' : ''}`;
  const params = limit ? [limit] : [];
  const [rows] = await pool.query<TestRecordRow[]>(query, params);
  return rows;
}

export async function listTestRecordsForPatient(patientDbId: number): Promise<TestRecordRow[]> {
  const [rows] = await pool.query<TestRecordRow[]>(
    `${BASE_SELECT} WHERE tr.patient_id = ? ORDER BY tr.test_date DESC, tr.id DESC`,
    [patientDbId]
  );
  return rows;
}

export async function getTestRecordById(id: number): Promise<TestRecordRow | null> {
  const [rows] = await pool.query<TestRecordRow[]>(`${BASE_SELECT} WHERE tr.id = ? LIMIT 1`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

export async function createTestRecord(input: {
  patient_id: number;
  biomarker_id: number;
  result_value: number;
  unit: string;
  test_date: string;
}): Promise<TestRecordRow> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date) VALUES (?, ?, ?, ?, ?)`,
    [input.patient_id, input.biomarker_id, input.result_value, input.unit, input.test_date]
  );
  const created = await getTestRecordById(result.insertId);
  return created as TestRecordRow;
}

export async function updateTestRecord(
  id: number,
  input: Partial<{ biomarker_id: number; result_value: number; unit: string; test_date: string }>
): Promise<TestRecordRow | null> {
  const fields: string[] = [];
  const params: any[] = [];

  if (input.biomarker_id !== undefined) {
    fields.push('biomarker_id = ?');
    params.push(input.biomarker_id);
  }
  if (input.result_value !== undefined) {
    fields.push('result_value = ?');
    params.push(input.result_value);
  }
  if (input.unit !== undefined) {
    fields.push('unit = ?');
    params.push(input.unit);
  }
  if (input.test_date !== undefined) {
    fields.push('test_date = ?');
    params.push(input.test_date);
  }

  if (fields.length === 0) {
    return getTestRecordById(id);
  }

  params.push(id);
  await pool.query(`UPDATE test_records SET ${fields.join(', ')} WHERE id = ?`, params);
  return getTestRecordById(id);
}

export async function deleteTestRecord(id: number): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM test_records WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getTrendForPatientBiomarker(patientDbId: number, biomarkerId: number): Promise<TestRecordRow[]> {
  const [rows] = await pool.query<TestRecordRow[]>(
    `${BASE_SELECT} WHERE tr.patient_id = ? AND tr.biomarker_id = ? ORDER BY tr.test_date ASC, tr.id ASC`,
    [patientDbId, biomarkerId]
  );
  return rows;
}
