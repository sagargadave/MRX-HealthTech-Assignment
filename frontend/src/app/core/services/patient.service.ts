import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';
import { ApiResponse } from '../models/api-response.model';
import { CreatePatientPayload, Patient, UpdatePatientPayload } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private baseUrl = `${API_BASE_URL}/patients`;

  constructor(private http: HttpClient) {}

  list(search?: string, gender?: string): Observable<ApiResponse<Patient[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (gender) params = params.set('gender', gender);
    return this.http.get<ApiResponse<Patient[]>>(this.baseUrl, { params });
  }

  get(id: number): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreatePatientPayload): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdatePatientPayload): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
