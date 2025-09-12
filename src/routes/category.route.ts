import  express  from "express";
import { createCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/categories.controller.js";
import { verifyToken } from "../middleware/token-verify.js";

const router = express.Router();

router.get('/categories', verifyToken,getCategories);
router.get('/category/:id', verifyToken,getCategoryById);
router.post('/category', verifyToken,createCategory);
router.put('/category/:id', verifyToken,updateCategory);
router.delete('/category/:id', verifyToken,deleteCategory);

export default router