import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { getBiomarkers } from '../controllers/biomarker.controller';

const router = Router();

router.use(authenticate, requireRole('doctor'));

// GET /api/biomarkers
router.get('/', getBiomarkers);

export default router;
