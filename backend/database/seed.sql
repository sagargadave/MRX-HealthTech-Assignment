-- ============================================================
-- Healthcare Monitoring Dashboard - Seed Data
-- ============================================================
-- All values below are fictitious/dummy data for demonstration
-- and development/testing purposes only. This is NOT real
-- patient or medical data.
--
-- NOTE: the demo doctor user (doctor@example.com) is NOT created
-- here because its password must be bcrypt-hashed. It is created
-- by running `npm run seed` in the backend (see
-- src/utils/runSeed.ts), which hashes the password in Node and
-- inserts it safely. This file only seeds biomarkers, patients,
-- and test records.
-- ============================================================

USE healthcare_monitoring;

-- ------------------------------------------------------------
-- BIOMARKERS
-- ------------------------------------------------------------
INSERT INTO biomarkers (name, description, default_unit) VALUES
  ('Biomarker A', 'Demo biomarker A (dummy data)', 'mg/dL'),
  ('Biomarker B', 'Demo biomarker B (dummy data)', 'mg/dL'),
  ('Biomarker C', 'Demo biomarker C (dummy data)', 'mg/dL'),
  ('Glucose', 'Fasting blood glucose (dummy data)', 'mg/dL'),
  ('Cholesterol', 'Total cholesterol (dummy data)', 'mg/dL'),
  ('Hemoglobin', 'Blood hemoglobin level (dummy data)', 'g/dL')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ------------------------------------------------------------
-- PATIENTS (fictitious)
-- ------------------------------------------------------------
INSERT INTO patients (patient_id, name, age, gender, medical_history) VALUES
  ('P001', 'Mr. XYZ', 54, 'Male', 'Hypertension, monitored quarterly. No known allergies.'),
  ('P002', 'Ms. ABC', 38, 'Female', 'Type 2 diabetes, on routine glucose monitoring.'),
  ('P003', 'Mr. DEF', 61, 'Male', 'History of high cholesterol, dietary management.'),
  ('P004', 'Mrs. GHI', 46, 'Female', 'Mild anemia, iron supplementation.'),
  ('P005', 'Mr. JKL', 29, 'Male', 'No significant medical history.')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ------------------------------------------------------------
-- TEST RECORDS (fictitious)
-- ------------------------------------------------------------

-- P001 - Mr. XYZ - Biomarker A
INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date)
SELECT p.id, b.id, v.result_value, b.default_unit, v.test_date
FROM patients p
JOIN biomarkers b ON b.name = 'Biomarker A'
JOIN (
  SELECT 42 AS result_value, '2026-09-01' AS test_date
  UNION ALL SELECT 38, '2026-09-08'
  UNION ALL SELECT 31, '2026-09-15'
  UNION ALL SELECT 25, '2026-09-22'
) v ON 1 = 1
WHERE p.patient_id = 'P001';

-- P001 - Mr. XYZ - Biomarker B
INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date)
SELECT p.id, b.id, v.result_value, b.default_unit, v.test_date
FROM patients p
JOIN biomarkers b ON b.name = 'Biomarker B'
JOIN (
  SELECT 120 AS result_value, '2026-09-05' AS test_date
  UNION ALL SELECT 115, '2026-09-15'
) v ON 1 = 1
WHERE p.patient_id = 'P001';

-- P002 - Ms. ABC - Glucose
INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date)
SELECT p.id, b.id, v.result_value, b.default_unit, v.test_date
FROM patients p
JOIN biomarkers b ON b.name = 'Glucose'
JOIN (
  SELECT 145 AS result_value, '2026-08-20' AS test_date
  UNION ALL SELECT 138, '2026-09-03'
  UNION ALL SELECT 126, '2026-09-17'
) v ON 1 = 1
WHERE p.patient_id = 'P002';

-- P003 - Mr. DEF - Cholesterol
INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date)
SELECT p.id, b.id, v.result_value, b.default_unit, v.test_date
FROM patients p
JOIN biomarkers b ON b.name = 'Cholesterol'
JOIN (
  SELECT 230 AS result_value, '2026-08-10' AS test_date
  UNION ALL SELECT 215, '2026-09-01'
  UNION ALL SELECT 198, '2026-09-20'
) v ON 1 = 1
WHERE p.patient_id = 'P003';

-- P004 - Mrs. GHI - Hemoglobin
INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date)
SELECT p.id, b.id, v.result_value, b.default_unit, v.test_date
FROM patients p
JOIN biomarkers b ON b.name = 'Hemoglobin'
JOIN (
  SELECT 10.2 AS result_value, '2026-08-05' AS test_date
  UNION ALL SELECT 11.0, '2026-09-05'
  UNION ALL SELECT 11.8, '2026-09-22'
) v ON 1 = 1
WHERE p.patient_id = 'P004';

-- P005 - Mr. JKL - Biomarker C (single record, demonstrates "one record" case)
INSERT INTO test_records (patient_id, biomarker_id, result_value, unit, test_date)
SELECT p.id, b.id, 55, b.default_unit, '2026-09-18'
FROM patients p
JOIN biomarkers b ON b.name = 'Biomarker C'
WHERE p.patient_id = 'P005';
