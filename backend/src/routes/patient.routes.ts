import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getPatients,
  getPatient,
  createPatientHandler,
  updatePatientHandler,
  deletePatientHandler,
} from '../controllers/patient.controller';
import { getBiomarkersForPatient } from '../controllers/biomarker.controller';
import { getTestRecordsForPatient, createTestRecordForPatient } from '../controllers/testRecord.controller';
import trendRoutes from './trend.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use(authenticate, requireRole('doctor'));

// Core patient CRUD
router.get('/', getPatients);
router.get('/:id', getPatient);
router.post('/', createPatientHandler);
router.put('/:id', updatePatientHandler);
router.delete('/:id', deletePatientHandler);

// Nested resources
router.get('/:id/biomarkers', getBiomarkersForPatient);
router.get('/:id/tests', getTestRecordsForPatient);
router.post('/:id/tests', createTestRecordForPatient);
router.use('/:id/trends', trendRoutes);
router.use('/:id/report', reportRoutes);

export default router;
