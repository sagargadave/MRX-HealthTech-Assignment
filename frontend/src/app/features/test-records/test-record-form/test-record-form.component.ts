import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Patient } from '../../../core/models/patient.model';
import { Biomarker } from '../../../core/models/biomarker.model';
import { TestRecord } from '../../../core/models/test-record.model';
import { PatientService } from '../../../core/services/patient.service';
import { BiomarkerService } from '../../../core/services/biomarker.service';
import { TestRecordService } from '../../../core/services/test-record.service';

export interface TestRecordFormDialogData {
  mode: 'create' | 'edit';
  patient?: Patient | null; // pre-selected patient, when opened from the Patient Dashboard
  record?: TestRecord; // when editing
}

@Component({
  selector: 'app-test-record-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './test-record-form.component.html',
  styleUrl: './test-record-form.component.css',
})
export class TestRecordFormComponent implements OnInit {
  Object = Object;
  saving = signal(false);
  serverErrors = signal<Record<string, string> | null>(null);
  isEdit = this.data.mode === 'edit';

  patients = signal<Patient[]>([]);
  biomarkers = signal<Biomarker[]>([]);
  loadingLookups = signal(true);

  // When editing, the patient is fixed and shown as read-only text (patient
  // identity never changes on an existing test record).
  fixedPatientLabel = this.data.record
    ? `${this.data.record.patientId} - ${this.data.record.patientName}`
    : this.data.patient
    ? `${this.data.patient.patient_id} - ${this.data.patient.name}`
    : null;

  form = this.fb.group({
    patient_db_id: [
      this.data.patient?.id ?? null,
      this.isEdit || this.data.patient ? [] : [Validators.required],
    ],
    biomarker_id: [this.data.record?.biomarkerId ?? null, [Validators.required]],
    result_value: [this.data.record?.resultValue ?? null, [Validators.required]],
    unit: [this.data.record?.unit ?? '', [Validators.required]],
    test_date: [this.data.record ? new Date(this.data.record.testDate) : new Date(), [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private biomarkerService: BiomarkerService,
    private testRecordService: TestRecordService,
    public dialogRef: MatDialogRef<TestRecordFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TestRecordFormDialogData
  ) {}

  ngOnInit(): void {
    this.loadingLookups.set(true);

    // Only need the full patient dropdown when creating a record without a
    // pre-selected patient (i.e. opened from the Test Records page).
    const needsPatientList = !this.isEdit && !this.data.patient;
    let patientsDone = !needsPatientList;
    let biomarkersDone = false;

    const maybeFinish = () => {
      if (patientsDone && biomarkersDone) {
        this.loadingLookups.set(false);
      }
    };

    if (needsPatientList) {
      this.patientService.list().subscribe({
        next: (res) => {
          this.patients.set(res.data);
          patientsDone = true;
          maybeFinish();
        },
        error: () => {
          patientsDone = true;
          maybeFinish();
        },
      });
    }

    this.biomarkerService.listAll().subscribe({
      next: (res) => {
        this.biomarkers.set(res.data);
        biomarkersDone = true;
        maybeFinish();
      },
      error: () => {
        biomarkersDone = true;
        maybeFinish();
      },
    });
  }

  onBiomarkerSelected(biomarkerId: number): void {
    const biomarker = this.biomarkers().find((b) => b.id === biomarkerId);
    // Auto-fill the biomarker's default unit; the doctor can still edit it.
    if (biomarker) {
      this.form.controls.unit.setValue(biomarker.default_unit);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.serverErrors.set(null);
    const raw = this.form.getRawValue();
    const testDate = this.formatDate(raw.test_date as unknown as Date);

    if (this.isEdit && this.data.record) {
      this.testRecordService
        .update(this.data.record.id, {
          biomarker_id: Number(raw.biomarker_id),
          result_value: Number(raw.result_value),
          unit: raw.unit!,
          test_date: testDate,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.dialogRef.close({ saved: true });
          },
          error: (err) => this.handleError(err),
        });
      return;
    }

    const patientDbId = this.data.patient?.id ?? Number(raw.patient_db_id);
    this.testRecordService
      .createForPatient(patientDbId, {
        biomarker_id: Number(raw.biomarker_id),
        result_value: Number(raw.result_value),
        unit: raw.unit!,
        test_date: testDate,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.dialogRef.close({ saved: true });
        },
        error: (err) => this.handleError(err),
      });
  }

  private handleError(err: any): void {
    this.saving.set(false);
    this.serverErrors.set(err.error?.errors || (err.error?.message ? { general: err.error.message } : null));
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  cancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
