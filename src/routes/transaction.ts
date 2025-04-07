import express from 'express';

import { transactionController } from '../controller';

const router = express.Router();

router.post("/getAllTrasactions", transactionController.getAllTrasactions);
// 3.issue
router.post("/detectLoopWalletTransaction", transactionController.detectLoopWalletTransaction);
// 4.issue
router.post("/detectRapidBuySell", transactionController.detectRapidBuySell);
// 5.issue
router.post("/detectRapidBuySameToken", transactionController.detectRapidBuySameToken);

export default router;