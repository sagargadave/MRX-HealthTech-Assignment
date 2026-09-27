import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import {
  getAllTestRecords,
  updateTestRecordHandler,
  deleteTestRecordHandler,
} from '../controllers/testRecord.controller';

const router = Router();

router.use(authenticate, requireRole('doctor'));

// GET /api/test-records
router.get('/', getAllTestRecords);

// PUT /api/test-records/:id
router.put('/:id', updateTestRecordHandler);

// DELETE /api/test-records/:id
router.delete('/:id', deleteTestRecordHandler);

export default router;
