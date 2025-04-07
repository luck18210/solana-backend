import express from 'express';

import { walletController } from '../controller';

const router = express.Router();

// 6.issue
router.post("/checkWalletStatus", walletController.checkWalletStatus);
// 7.issue
router.post("/checkNewWalletStatus", walletController.checkNewWalletStatus);
// 8.issue
router.post("/checkWallet", walletController.checkWallet);

export default router;