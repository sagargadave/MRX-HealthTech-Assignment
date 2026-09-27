export interface TestRecord {
  id: number;
  patientDbId: number;
  patientId: string;
  patientName: string;
  biomarkerId: number;
  biomarker: string;
  resultValue: number;
  unit: string;
  testDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTestRecordPayload {
  biomarker_id: number;
  result_value: number;
  unit: string;
  test_date: string;
}

export type UpdateTestRecordPayload = Partial<CreateTestRecordPayload>;

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendResponse {
  patientId: string;
  biomarker: string;
  unit: string;
  records: TrendPoint[];
}
