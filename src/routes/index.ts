import express from 'express';

import token_route from './tokens';
import transaction_route from './transaction';
import liquidity_route from './liquidity';
import wallet_route from './wallet';
import user_route from './user'

const router = express.Router();

router.use("/token", token_route);
router.use("/wallet", wallet_route);
router.use("/transaction", transaction_route);
router.use("/liquidity", liquidity_route);
router.use("/user", user_route);

export default router;