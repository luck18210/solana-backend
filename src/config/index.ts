import dotenv from 'dotenv';

import * as baseConfig from './base';
import * as heliusConfig from './helius';
import * as tokenConfig from './token';
import * as transactionConfig from './transaction';
import * as dexScreenerconfig from './dexScreener';
import * as birdeyeConfig from './birdEye';
import * as userConfig from './user';

dotenv.config();

export { baseConfig, heliusConfig, tokenConfig, transactionConfig, dexScreenerconfig, birdeyeConfig, userConfig };