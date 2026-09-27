import { AfterViewInit, Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import jsPDF from 'jspdf';

import { Patient } from '../../core/models/patient.model';
import { Biomarker } from '../../core/models/biomarker.model';
import { PatientService } from '../../core/services/patient.service';
import { BiomarkerService } from '../../core/services/biomarker.service';
import { TestRecordService } from '../../core/services/test-record.service';
import { ReportService, PatientReport } from '../../core/services/report.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    BaseChartDirective,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent implements OnInit {
  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  loadingPatients = signal(true);
  loadingReport = signal(false);
  generatingPdf = signal(false);

  patients = signal<Patient[]>([]);
  selectedPatientId = signal<number | null>(null);

  report = signal<PatientReport | null>(null);
  availableBiomarkers = signal<Biomarker[]>([]);
  selectedBiomarkerId = signal<number | null>(null);

  displayedColumns = ['biomarker', 'result', 'unit', 'testDate'];

  chartData = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // keep the render synchronous & consistent for PDF capture
    plugins: {
      legend: { display: true },
      title: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Test Date' } },
      y: { title: { display: true, text: 'Result Value' } },
    },
  };

  constructor(
    private patientService: PatientService,
    private biomarkerService: BiomarkerService,
    private testRecordService: TestRecordService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.patientService.list().subscribe({
      next: (res) => {
        this.patients.set(res.data);
        this.loadingPatients.set(false);
      },
      error: () => this.loadingPatients.set(false),
    });
  }

  onPatientChange(): void {
    const patientId = this.selectedPatientId();
    if (!patientId) return;

    this.loadingReport.set(true);
    this.report.set(null);
    this.selectedBiomarkerId.set(null);
    this.chartData.set({ labels: [], datasets: [] });

    this.reportService.getReport(patientId).subscribe({
      next: (res) => {
        this.report.set(res.data);
        this.loadingReport.set(false);
      },
      error: () => this.loadingReport.set(false),
    });

    this.biomarkerService.listForPatient(patientId).subscribe({
      next: (res) => {
        this.availableBiomarkers.set(res.data);
        if (res.data.length > 0) {
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
    const patientId = this.selectedPatientId();
    const biomarkerId = this.selectedBiomarkerId();
    if (!patientId || !biomarkerId) return;

    this.testRecordService.getTrend(patientId, biomarkerId).subscribe({
      next: (res) => {
        const trend = res.data;
        this.chartData.set({
          labels: trend.records.map((r) => r.date),
          datasets: [
            {
              label: `${trend.biomarker} (${trend.unit})`,
              data: trend.records.map((r) => r.value),
              borderColor: '#0f766e',
              backgroundColor: 'rgba(15, 118, 110, 0.12)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointBackgroundColor: '#0f766e',
            },
          ],
        });
      },
    });
  }

  async downloadPdf(): Promise<void> {
    const report = this.report();
    if (!report) return;

    this.generatingPdf.set(true);

    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const marginX = 48;
      let cursorY = 56;

      doc.setFontSize(18);
      doc.setTextColor('#1e293b');
      doc.text('Patient Health Monitoring Report', marginX, cursorY);
      cursorY += 28;

      doc.setFontSize(10);
      doc.setTextColor('#64748b');
      doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, marginX, cursorY);
      cursorY += 24;

      doc.setDrawColor('#e2e8f0');
      doc.line(marginX, cursorY, 547, cursorY);
      cursorY += 20;

      doc.setFontSize(13);
      doc.setTextColor('#1e293b');
      doc.text('Patient Details', marginX, cursorY);
      cursorY += 18;

      doc.setFontSize(11);
      const details: [string, string][] = [
        ['Patient ID', report.patient.patientId],
        ['Name', report.patient.name],
        ['Age', String(report.patient.age)],
        ['Gender', report.patient.gender],
        ['Medical History', report.patient.medicalHistory || 'None recorded.'],
      ];
      for (const [label, value] of details) {
        doc.setTextColor('#64748b');
        doc.text(`${label}:`, marginX, cursorY);
        doc.setTextColor('#1e293b');
        doc.text(String(value), marginX + 120, cursorY, { maxWidth: 380 });
        cursorY += 18;
      }

      cursorY += 8;
      doc.setDrawColor('#e2e8f0');
      doc.line(marginX, cursorY, 547, cursorY);
      cursorY += 20;

      doc.setFontSize(13);
      doc.setTextColor('#1e293b');
      doc.text('Test History', marginX, cursorY);
      cursorY += 18;

      doc.setFontSize(10);
      const colX = [marginX, marginX + 150, marginX + 260, marginX + 340, marginX + 420];
      doc.setTextColor('#64748b');
      doc.text('Biomarker', colX[0], cursorY);
      doc.text('Result', colX[1], cursorY);
      doc.text('Unit', colX[2], cursorY);
      doc.text('Test Date', colX[3], cursorY);
      cursorY += 6;
      doc.line(marginX, cursorY, 547, cursorY);
      cursorY += 14;

      doc.setTextColor('#1e293b');
      for (const row of report.testHistory) {
        if (cursorY > 760) {
          doc.addPage();
          cursorY = 56;
        }
        doc.text(row.biomarker, colX[0], cursorY, { maxWidth: 140 });
        doc.text(String(row.result), colX[1], cursorY);
        doc.text(row.unit, colX[2], cursorY);
        doc.text(new Date(row.testDate).toLocaleDateString(), colX[3], cursorY);
        cursorY += 16;
      }

      cursorY += 12;

      const selectedBiomarker = this.availableBiomarkers().find((b) => b.id === this.selectedBiomarkerId());
      if (selectedBiomarker && this.chartDirective?.chart) {
        if (cursorY > 560) {
          doc.addPage();
          cursorY = 56;
        }
        doc.setFontSize(13);
        doc.setTextColor('#1e293b');
        doc.text(`Trend: ${selectedBiomarker.name}`, marginX, cursorY);
        cursorY += 12;

        const chartImage = this.chartDirective.chart.toBase64Image('image/png', 1);
        const imageWidth = 499;
        const imageHeight = 220;
        doc.addImage(chartImage, 'PNG', marginX, cursorY, imageWidth, imageHeight);
        cursorY += imageHeight + 10;
      }

      doc.save(`patient-report-${report.patient.patientId}.pdf`);
    } finally {
      this.generatingPdf.set(false);
    }
  }
}
