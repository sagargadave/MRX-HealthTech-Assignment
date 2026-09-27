export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: number;
  patient_id: string;
  name: string;
  age: number;
  gender: Gender;
  medical_history: string | null;
  test_record_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientPayload {
  patient_id: string;
  name: string;
  age: number;
  gender: Gender;
  medical_history?: string;
}

export type UpdatePatientPayload = Partial<Omit<CreatePatientPayload, 'patient_id'>>;
