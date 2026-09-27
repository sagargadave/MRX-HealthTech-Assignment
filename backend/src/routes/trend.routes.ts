import { Router } from 'express';
import { getPatientTrend } from '../controllers/trend.controller';

// mergeParams so this router can read :id from the parent patient.routes.ts mount point
const router = Router({ mergeParams: true });

// GET /api/patients/:id/trends/:biomarkerId
router.get('/:biomarkerId', getPatientTrend);

export default router;
