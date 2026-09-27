import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login - public
router.post('/login', login);

// GET /api/auth/me - protected
router.get('/me', authenticate, me);

export default router;
