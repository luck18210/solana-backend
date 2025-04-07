import axios from 'axios';
import https from 'https';

import { heliusConfig, dexScreenerconfig, birdeyeConfig } from '../config';

export const heliusServer = axios.create({
  baseURL: heliusConfig.HELIUS_SERVER,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export const heliusAPIServer = axios.create({
  baseURL: heliusConfig.HELIUS_API_SERVER,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export const dexScreenerAPIServer = axios.create({
  baseURL: dexScreenerconfig.DEXSCREENER_API_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

export const birdeyeAPIServer = axios.create({
  baseURL: birdeyeConfig.BIRDEYE_API_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
