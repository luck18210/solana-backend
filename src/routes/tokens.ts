import express from 'express';

import { tokenController } from '../controller';

const router = express.Router();

// 1.issue
router.post("/topHolderInfo", tokenController.getTopHoldersInfo);
// 2.issue
router.post("/detectSharpTokenPriceMovement", tokenController.detectSharpTokenPriceMovement);
router.post("/tokenInfo", tokenController.getTokenInfo);
router.post("/tokenAnalysis", tokenController.tokenAnalyse);
router.post("/getTokenLargetAccounts", tokenController.getTokenLargetAccounts);
router.post("/getTokenTotalSupply", tokenController.getTokenTotalSupply);
router.post("/getTokenHistoricalPrice", tokenController.getTokenHistoricalPrice);
router.post("/getTokenPriceByTimestamp", tokenController.getTokenPriceByTimestamp);
router.post("/getTokenPriceByUnixTime", tokenController.getTokenPriceByUnixTime);
router.post("/getTokenOverviewData", tokenController.getTokenOverviewData);

export default router;