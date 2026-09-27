import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import biomarkerRoutes from './biomarker.routes';
import testRecordRoutes from './testRecord.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/biomarkers', biomarkerRoutes);
router.use('/test-records', testRecordRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
