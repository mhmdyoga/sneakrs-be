import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/token-verify.js';
const router = express.Router();

router.get('/users', verifyToken,getUsers);
router.get('/user/:id', verifyToken,getUserById) ;
router.patch('/user/:id', verifyToken,updateUser);
router.delete('/user/:id', verifyToken,deleteUser)


export default router;