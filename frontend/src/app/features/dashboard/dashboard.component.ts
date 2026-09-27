import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { DashboardService, DashboardStats, RecentTestRow } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  loadingStats = signal(true);
  loadingRecent = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentTests = signal<RecentTestRow[]>([]);
  displayedColumns = ['patientId', 'patientName', 'biomarker', 'result', 'unit', 'testDate'];

  constructor(private dashboardService: DashboardService, private router: Router) {}

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loadingStats.set(false);
      },
      error: () => this.loadingStats.set(false),
    });

    this.dashboardService.getRecentTests(10).subscribe({
      next: (res) => {
        this.recentTests.set(res.data);
        this.loadingRecent.set(false);
      },
      error: () => this.loadingRecent.set(false),
    });
  }

  openPatient(row: RecentTestRow): void {
    this.router.navigate(['/patients', row.patientDbId]);
  }
}
