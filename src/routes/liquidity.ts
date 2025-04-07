import express from 'express';

import { liquidityController } from '../controller';

const router = express.Router();

// 8.issue
router.post("/detectLiquidityPoolChangeByTimeStamp", liquidityController.detectLiquidityPoolChangeByTimeStamp);
// 9.issue
router.post("/detectLiquidityPoolRiseChangeByTimeStamp", liquidityController.detectLiquidityPoolRiseChangeByTimeStamp);
// 10.issue
router.post("/checkCurrentLiquidity", liquidityController.checkCurrentLiquidity);

router.post("/liquidityPoolInfoByToken", liquidityController.liquidityPoolInfoByToken);
router.post("/getLiquidityPoolInfoByTimeStamp", liquidityController.getLiquidityPoolInfoByTimeStamp);
router.post("/getLiquidityPoolInfoByPairAddress", liquidityController.getLiquidityPoolInfoByPairAddress);

export default router;