import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { listAllTestRecords } from './testRecord.service';

export async function getDashboardStats() {
  const [[patientCountRow]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM patients');
  const [[testRecordCountRow]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM test_records');
  const [[biomarkerCountRow]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS total FROM biomarkers');
  const [[recentTestsRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM test_records WHERE test_date >= (CURDATE() - INTERVAL 30 DAY)`
  );

  return {
    totalPatients: patientCountRow.total,
    totalTestRecords: testRecordCountRow.total,
    totalBiomarkers: biomarkerCountRow.total,
    recentTests: recentTestsRow.total,
  };
}

export async function getRecentTestRecords(limit = 10) {
  return listAllTestRecords(limit);
}
