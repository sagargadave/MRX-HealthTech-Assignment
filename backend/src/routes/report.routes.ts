import { Router } from 'express';
import { getPatientReport } from '../controllers/report.controller';

// mergeParams so this router can read :id from the parent patient.routes.ts mount point
const router = Router({ mergeParams: true });

// GET /api/patients/:id/report
router.get('/', getPatientReport);

export default router;
