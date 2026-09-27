import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent implements OnInit {
  loading = signal(true);
  patients = signal<Patient[]>([]);
  searchTerm = '';
  genderFilter = 'All';
  displayedColumns = ['patient_id', 'name', 'age', 'gender', 'medical_history', 'test_record_count', 'actions'];

  private searchSubject = new Subject<string>();

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const initialSearch = this.route.snapshot.queryParamMap.get('search');
    if (initialSearch) {
      this.searchTerm = initialSearch;
    }

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.fetchPatients());

    this.fetchPatients();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  fetchPatients(): void {
    this.loading.set(true);
    this.patientService.list(this.searchTerm, this.genderFilter).subscribe({
      next: (res) => {
        this.patients.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(PatientFormComponent, {
      width: '480px',
      data: { mode: 'create' },
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Patient created successfully.', 'Close', { duration: 3000 });
        this.fetchPatients();
      }
    });
  }

  openEditDialog(patient: Patient): void {
    const ref = this.dialog.open(PatientFormComponent, {
      width: '480px',
      data: { mode: 'edit', patient },
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Patient updated successfully.', 'Close', { duration: 3000 });
        this.fetchPatients();
      }
    });
  }

  viewPatient(patient: Patient): void {
    this.router.navigate(['/patients', patient.id]);
  }

  confirmDelete(patient: Patient): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title: 'Delete Patient',
        message: 'Are you sure you want to delete this patient?',
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.patientService.delete(patient.id).subscribe({
          next: () => {
            this.snackBar.open('Patient deleted successfully.', 'Close', { duration: 3000 });
            this.fetchPatients();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Unable to delete patient.', 'Close', { duration: 4000 });
          },
        });
      }
    });
  }
}
