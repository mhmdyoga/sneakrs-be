import express from 'express';
import { LoginUser, logoutUser, RegisterUser } from '../controllers/auth.controller.js';
const router = express.Router();
router.post('/register', RegisterUser);
router.post('/login', LoginUser);
router.post('/logout', logoutUser);
export default router;
//# sourceMappingURL=auth.route.js.map