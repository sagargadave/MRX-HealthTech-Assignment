import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardStats {
  totalPatients: number;
  totalTestRecords: number;
  totalBiomarkers: number;
  recentTests: number;
}

export interface RecentTestRow {
  id: number;
  patientDbId: number;
  patientId: string;
  patientName: string;
  biomarker: string;
  result: number;
  unit: string;
  testDate: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = `${API_BASE_URL}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/stats`);
  }

  getRecentTests(limit = 10): Observable<ApiResponse<RecentTestRow[]>> {
    return this.http.get<ApiResponse<RecentTestRow[]>>(`${this.baseUrl}/recent-tests`, {
      params: { limit },
    });
  }
}
