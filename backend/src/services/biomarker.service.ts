import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface BiomarkerRecord extends RowDataPacket {
  id: number;
  name: string;
  description: string | null;
  default_unit: string;
  created_at: string;
}

export async function listBiomarkers(): Promise<BiomarkerRecord[]> {
  const [rows] = await pool.query<BiomarkerRecord[]>('SELECT * FROM biomarkers ORDER BY name ASC');
  return rows;
}

export async function getBiomarkerById(id: number): Promise<BiomarkerRecord | null> {
  const [rows] = await pool.query<BiomarkerRecord[]>('SELECT * FROM biomarkers WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0 ? rows[0] : null;
}

/** Returns only the biomarkers that have at least one test record for the given patient. */
export async function listBiomarkersForPatient(patientDbId: number): Promise<BiomarkerRecord[]> {
  const [rows] = await pool.query<BiomarkerRecord[]>(
    `SELECT DISTINCT b.*
     FROM biomarkers b
     JOIN test_records tr ON tr.biomarker_id = b.id
     WHERE tr.patient_id = ?
     ORDER BY b.name ASC`,
    [patientDbId]
  );
  return rows;
}
