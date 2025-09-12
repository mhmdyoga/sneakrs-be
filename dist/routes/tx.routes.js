import express from "express";
import { createTx, getTx, getTxById, notification } from "../controllers/tx.controller.js";
import { verifyToken } from "../middleware/token-verify.js";
const router = express.Router();
router.get("/transactions", verifyToken, getTx);
router.get("/transaction/:id", verifyToken, getTxById);
router.post("/transaction", verifyToken, createTx);
router.post("/notification", express.raw({ type: 'application/json' }), notification);
export default router;
//# sourceMappingURL=tx.routes.js.map