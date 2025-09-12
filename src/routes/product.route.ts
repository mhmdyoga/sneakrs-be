import express from "express";
import { upload } from "../middleware/upload.js";
import { createProduct, deleteProduct, getProductById, getProductByName, getProducts, updateProduct } from "../controllers/product.controller.js";
import { verifyToken } from "../middleware/token-verify.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/product/:name", getProductByName);
router.get("/product/:id", verifyToken,getProductById);
router.post("/product", verifyToken, upload.single("image"), createProduct);
router.put("/product/:id", verifyToken, updateProduct);
router.delete("/product/:id", verifyToken, deleteProduct);


export default router;