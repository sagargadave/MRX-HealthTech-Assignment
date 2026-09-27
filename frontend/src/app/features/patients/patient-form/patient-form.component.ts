import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../../core/services/patient.service';
import { Patient } from '../../../core/models/patient.model';

export interface PatientFormDialogData {
  mode: 'create' | 'edit';
  patient?: Patient;
}

@Component({
  selector: 'app-patient-form',
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
  ],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css',
})
export class PatientFormComponent {
  Object = Object;
  saving = signal(false);
  serverErrors = signal<Record<string, string> | null>(null);
  isEdit = this.data.mode === 'edit';

  form = this.fb.group({
    patient_id: [
      { value: this.data.patient?.patient_id ?? '', disabled: this.isEdit },
      [Validators.required],
    ],
    name: [this.data.patient?.name ?? '', [Validators.required]],
    age: [this.data.patient?.age ?? null, [Validators.required, Validators.min(1), Validators.max(149)]],
    gender: [this.data.patient?.gender ?? '', [Validators.required]],
    medical_history: [this.data.patient?.medical_history ?? ''],
  });

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    public dialogRef: MatDialogRef<PatientFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PatientFormDialogData
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.serverErrors.set(null);
    const raw = this.form.getRawValue();

    const request$ = this.isEdit
      ? this.patientService.update(this.data.patient!.id, {
          name: raw.name!,
          age: Number(raw.age),
          gender: raw.gender as any,
          medical_history: raw.medical_history ?? '',
        })
      : this.patientService.create({
          patient_id: raw.patient_id!,
          name: raw.name!,
          age: Number(raw.age),
          gender: raw.gender as any,
          medical_history: raw.medical_history ?? '',
        });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.close({ saved: true });
      },
      error: (err) => {
        this.saving.set(false);
        this.serverErrors.set(err.error?.errors || null);
        if (!err.error?.errors && err.error?.message) {
          this.serverErrors.set({ general: err.error.message });
        }
      },
    });
  }

  cancel(): void {
    this.dialogRef.close({ saved: false });
  }
}
