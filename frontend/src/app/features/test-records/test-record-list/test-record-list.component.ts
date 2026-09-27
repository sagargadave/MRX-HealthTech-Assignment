import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TestRecord } from '../../../core/models/test-record.model';
import { TestRecordService } from '../../../core/services/test-record.service';
import { TestRecordFormComponent } from '../test-record-form/test-record-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-test-record-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './test-record-list.component.html',
  styleUrl: './test-record-list.component.css',
})
export class TestRecordListComponent implements OnInit {
  loading = signal(true);
  records = signal<TestRecord[]>([]);
  displayedColumns = ['patient', 'biomarker', 'result', 'unit', 'testDate', 'actions'];

  constructor(
    private testRecordService: TestRecordService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchRecords();
  }

  fetchRecords(): void {
    this.loading.set(true);
    this.testRecordService.listAll().subscribe({
      next: (res) => {
        // Backend already sorts newest-first by test_date; keep that order.
        this.records.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(TestRecordFormComponent, {
      width: '480px',
      data: { mode: 'create' },
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Test record added successfully.', 'Close', { duration: 3000 });
        this.fetchRecords();
      }
    });
  }

  openEditDialog(record: TestRecord): void {
    const ref = this.dialog.open(TestRecordFormComponent, {
      width: '480px',
      data: { mode: 'edit', record },
    });

    ref.afterClosed().subscribe((result) => {
      if (result?.saved) {
        this.snackBar.open('Test record updated successfully.', 'Close', { duration: 3000 });
        this.fetchRecords();
      }
    });
  }

  confirmDelete(record: TestRecord): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { title: 'Delete Test Record', message: 'Are you sure you want to delete this test record?' },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.testRecordService.delete(record.id).subscribe({
          next: () => {
            this.snackBar.open('Test record deleted successfully.', 'Close', { duration: 3000 });
            this.fetchRecords();
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

  openPatient(record: TestRecord): void {
    this.router.navigate(['/patients', record.patientDbId]);
  }
}
