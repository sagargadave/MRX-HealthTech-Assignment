import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';
import { ApiResponse } from '../models/api-response.model';
import { Biomarker } from '../models/biomarker.model';

@Injectable({ providedIn: 'root' })
export class BiomarkerService {
  private baseUrl = `${API_BASE_URL}/biomarkers`;

  constructor(private http: HttpClient) {}

  listAll(): Observable<ApiResponse<Biomarker[]>> {
    return this.http.get<ApiResponse<Biomarker[]>>(this.baseUrl);
  }

  listForPatient(patientDbId: number): Observable<ApiResponse<Biomarker[]>> {
    return this.http.get<ApiResponse<Biomarker[]>>(`${API_BASE_URL}/patients/${patientDbId}/biomarkers`);
  }
}
