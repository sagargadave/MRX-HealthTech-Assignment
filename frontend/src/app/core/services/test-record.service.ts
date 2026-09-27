import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';
import { ApiResponse } from '../models/api-response.model';
import {
  CreateTestRecordPayload,
  TestRecord,
  TrendResponse,
  UpdateTestRecordPayload,
} from '../models/test-record.model';

@Injectable({ providedIn: 'root' })
export class TestRecordService {
  private baseUrl = `${API_BASE_URL}/test-records`;
  private patientsUrl = `${API_BASE_URL}/patients`;

  constructor(private http: HttpClient) {}

  listAll(): Observable<ApiResponse<TestRecord[]>> {
    return this.http.get<ApiResponse<TestRecord[]>>(this.baseUrl);
  }

  listForPatient(patientDbId: number): Observable<ApiResponse<TestRecord[]>> {
    return this.http.get<ApiResponse<TestRecord[]>>(`${this.patientsUrl}/${patientDbId}/tests`);
  }

  createForPatient(patientDbId: number, payload: CreateTestRecordPayload): Observable<ApiResponse<TestRecord>> {
    return this.http.post<ApiResponse<TestRecord>>(`${this.patientsUrl}/${patientDbId}/tests`, payload);
  }

  update(id: number, payload: UpdateTestRecordPayload): Observable<ApiResponse<TestRecord>> {
    return this.http.put<ApiResponse<TestRecord>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  getTrend(patientDbId: number, biomarkerId: number): Observable<ApiResponse<TrendResponse>> {
    return this.http.get<ApiResponse<TrendResponse>>(
      `${this.patientsUrl}/${patientDbId}/trends/${biomarkerId}`
    );
  }
}
