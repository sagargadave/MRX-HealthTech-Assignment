-- ============================================================
-- Healthcare Monitoring Dashboard - Database Schema
-- ============================================================
-- Deletion strategy (documented, see also README.md section
-- "Deletion Strategy"):
--   When a patient is deleted, all of that patient's test_records
--   rows are automatically deleted via ON DELETE CASCADE. This is
--   intentional: a test record has no meaning without its patient,
--   and this is a demo/assessment system with dummy data, so we
--   favor simplicity and referential integrity over soft-deletes.
--   Biomarkers are treated as reference/lookup data and cannot be
--   deleted through the API in this version (ON DELETE RESTRICT),
--   so historical test_records always retain a valid biomarker.
-- ============================================================

CREATE DATABASE IF NOT EXISTS healthcare_monitoring
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE healthcare_monitoring;

-- ------------------------------------------------------------
-- USERS TABLE (doctors / future roles)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'doctor',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_users_role ON users (role);

-- ------------------------------------------------------------
-- PATIENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  medical_history TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_patient_age CHECK (age > 0 AND age < 150)
) ENGINE=InnoDB;

CREATE INDEX idx_patients_patient_id ON patients (patient_id);
CREATE INDEX idx_patients_name ON patients (name);
CREATE INDEX idx_patients_gender ON patients (gender);

-- ------------------------------------------------------------
-- BIOMARKERS TABLE (reference / lookup data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS biomarkers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  default_unit VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_biomarkers_name ON biomarkers (name);

-- ------------------------------------------------------------
-- TEST_RECORDS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS test_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  biomarker_id INT NOT NULL,
  result_value DECIMAL(10, 3) NOT NULL,
  unit VARCHAR(30) NOT NULL,
  test_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_test_records_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_test_records_biomarker
    FOREIGN KEY (biomarker_id) REFERENCES biomarkers(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_test_records_patient_id ON test_records (patient_id);
CREATE INDEX idx_test_records_biomarker_id ON test_records (biomarker_id);
CREATE INDEX idx_test_records_test_date ON test_records (test_date);
