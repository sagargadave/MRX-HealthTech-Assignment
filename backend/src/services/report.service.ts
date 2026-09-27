import { getPatientById } from './patient.service';
import { listTestRecordsForPatient } from './testRecord.service';
import { ApiError } from '../utils/apiResponse';

export async function buildPatientReport(patientDbId: number) {
  const patient = await getPatientById(patientDbId);
  if (!patient) {
    throw new ApiError('Patient not found.', 404);
  }

  const testHistory = await listTestRecordsForPatient(patientDbId);

  return {
    patient: {
      patientId: patient.patient_id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      medicalHistory: patient.medical_history,
    },
    testHistory: testHistory.map((r) => ({
      id: r.id,
      biomarker: r.biomarker_name,
      biomarkerId: r.biomarker_id,
      result: Number(r.result_value),
      unit: r.unit,
      testDate: r.test_date,
    })),
    generatedAt: new Date().toISOString(),
  };
}
