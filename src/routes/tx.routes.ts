import express from "express";
import { createTx, getTx, getTxById, notification } from "../controllers/tx.controller.js";

const router = express.Router();

router.get("/transactions",  getTx);
router.get("/transaction/:id",  getTxById);
router.post("/snap", createTx); 
router.post("/notification", express.raw({ type: 'application/json' }), notification);

export default router;