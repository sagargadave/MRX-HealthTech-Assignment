import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { getStats, getRecentTests } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate, requireRole('doctor'));

// GET /api/dashboard/stats
router.get('/stats', getStats);

// GET /api/dashboard/recent-tests
router.get('/recent-tests', getRecentTests);

export default router;
