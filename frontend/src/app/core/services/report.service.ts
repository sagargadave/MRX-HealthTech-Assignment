import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';
import { ApiResponse } from '../models/api-response.model';

export interface PatientReport {
  patient: {
    patientId: string;
    name: string;
    age: number;
    gender: string;
    medicalHistory: string | null;
  };
  testHistory: {
    id: number;
    biomarker: string;
    biomarkerId: number;
    result: number;
    unit: string;
    testDate: string;
  }[];
  generatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getReport(patientDbId: number): Observable<ApiResponse<PatientReport>> {
    return this.http.get<ApiResponse<PatientReport>>(`${API_BASE_URL}/patients/${patientDbId}/report`);
  }
}
