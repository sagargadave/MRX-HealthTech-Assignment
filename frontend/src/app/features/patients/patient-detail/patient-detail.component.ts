import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { Patient } from '../../../core/models/patient.model';
import { Biomarker } from '../../../core/models/biomarker.model';
import { TestRecord } from '../../../core/models/test-record.model';
import { PatientService } from '../../../core/services/patient.service';
import { BiomarkerService } from '../../../core/services/biomarker.service';
import { TestRecordService } from '../../../core/services/test-record.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { TestRecordFormComponent } from '../../test-records/test-record-form/test-record-form.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    BaseChartDirective,
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css',
})
export class PatientDetailComponent implements OnInit {
  patientDbId!: number;

  loadingPatient = signal(true);
  loadingHistory = signal(true);
  loadingTrend = signal(false);

  patient = signal<Patient | null>(null);
  availableBiomarkers = signal<Biomarker[]>([]);
  selectedBiomarkerId = signal<number | null>(null);
  testHistory = signal<TestRecord[]>([]);

  displayedColumns = ['biomarker', 'result', 'unit', 'testDate', 'actions'];

  latestResult = computed<TestRecord | null>(() => {
    const history = this.testHistory();
    return history.length > 0 ? history[0] : null;
  });

  filteredHistoryForSelectedBiomarker = computed<TestRecord[]>(() => {
    const biomarkerId = this.selectedBiomarkerId();
    if (!biomarkerId) return [];
    return this.testHistory().filter((r) => r.biomarkerId === biomarkerId);
  });

  chartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Test Date' } },
      y: { title: { display: true, text: 'Result Value' } },
    },
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private biomarkerService: BiomarkerService,
    private testRecordService: TestRecordService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.patientDbId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatient();
    this.loadHistoryAndBiomarkers();
  }

  loadPatient(): void {
    this.loadingPatient.set(true);
    this.patientService.get(this.patientDbId).subscribe({
      next: (res) => {
        this.patient.set(res.data);
        this.loadingPatient.set(false);
      },
      error: () => {
        this.loadingPatient.set(false);
        this.snackBar.open('Patient not found.', 'Close', { duration: 3000 });
        this.router.navigate(['/patients']);
      },
    });
  }

  loadHistoryAndBiomarkers(): void {
    this.loadingHistory.set(true);
    this.testRecordService.listForPatient(this.patientDbId).subscribe({
      next: (res) => {
        this.testHistory.set(res.data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });

    this.biomarkerService.listForPatient(this.patientDbId).subscribe({
      next: (res) => {
        this.availableBiomarkers.set(res.data);
        if (res.data.length > 0 && !this.selectedBiomarkerId()) {
          this.selectedBiomarkerId.set(res.data[0].id);
          this.loadTrend();
        }
      },
    });
  }

  onBiomarkerChange(): void {
    this.loadTrend();
  }

  loadTrend(): void {
    const biomarkerId = this.selectedBiomarkerId();
    if (!biomarkerId) {
      this.chartData.set({ labels: [], datasets: [] });
      return;
    }

    this.loadingTrend.set(true);
    this.testRecordService.getTrend(this.patientDbId, biomarkerId).subscribe({
      next: (res) => {
        const trend = res.data;
        this.chartData.set({
          labels: trend.records.map((r) => r.date),
          datasets: [
            {
              label: `${trend.biomarker} (${trend.unit})`,
              data: trend.records.map((r) => r.value),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#2563eb',
            },
          ],
        });
        this.loadingTrend.set(false);
      },
      error: () => this.loadingTrend.set(false),
    });
  }

  refreshAfterMutation(): void {
    this.loadHistoryAndBiomarkers();
    this.loadTrend();
  }

  openAddTestRecordDialog(): void {
    const ref = this.dialog.open(TestRecordFormComponent, {
      width: '480px',
      data: { mode: 'create', patient: this.patient() },
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Test record added successfully.', 'Close', { duration: 3000 });
        this.refreshAfterMutation();
      }
    });
  }

  openEditTestRecordDialog(record: TestRecord): void {
    const ref = this.dialog.open(TestRecordFormComponent, {
      width: '480px',
      data: { mode: 'edit', record },
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Test record updated successfully.', 'Close', { duration: 3000 });
        this.refreshAfterMutation();
      }
    });
  }

  confirmDeleteTestRecord(record: TestRecord): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Delete Test Record', message: 'Are you sure you want to delete this test record?' },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.testRecordService.delete(record.id).subscribe({
          next: () => {
            this.snackBar.open('Test record deleted successfully.', 'Close', { duration: 3000 });
            this.refreshAfterMutation();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Unable to delete test record.', 'Close', {
              duration: 4000,
            });
          },
        });
      }
    });
  }
}
