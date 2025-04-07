export type checkCurrentLiquidityParam = {
    mint: string;
    threshold: number;
}

export type liquidityPoolInfoByToken = {
    dexId: string;
    pairAddress: string;
    labels: string[];
    baseToken: string;
    quoteToken: string;
    priceNative: string;
    priceUsd: string;
    txns: trxVariety | null;
    volume: volumeVariety | null;
    priceChange: priceChangeVariety | null;
    liquidity: liquidityVariety | null;
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
}

export type detectLiquidityPoolInfo = {
    detectLiquidityPoolInfo: liquidityPoolInfoByToken[];
    riskState: string;
}

export interface detectLiquidityPoolInfoResponse {
    data?: detectLiquidityPoolInfo;
    error?: string;
}

export type trxVariety = {
    m5?: {
        buys?: number;
        sells?: number;
    },
    h1?: {
        buys?: number;
        sells?: number;
    },
    h6?: {
        buys?: number;
        sells?: number;
    },
    h24?: {
        buys?: number;
        sells?: number;
    }
}

export type volumeVariety = {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
}

export type priceChangeVariety = {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
}

export type liquidityVariety = {
    usd?: number;
    base?: number;
    quote?: number;
}

export type liquidityPoolInfoByTokenParam = {
    mint: string
}

export interface liquidityPoolInfoByTokenResponse {
    data?: liquidityPoolInfoByToken[];
    error?: string;
}

export type liquidityPoolInfoByTimeStampParam = {
    poolAddress: string;
    offset: number;
    limit: number;
    txType: string;
    beforeTimestamp: number;
    afterTimestamp: number;
}

export type liquidityPoolInfoByTimeStampData = {
    txHash: string[];
    txType: string;
    blockUnixTime: number;
    baseTokenAmount: number;
    quoteTokenAmount: number;
    finished: boolean;
}

export interface liquidityPoolInfoByTimeStampResponse {
    data?: liquidityPoolInfoByTimeStampData;
    error?: string;
}

export type detectLiquidityPoolChangeByTimeStampParam = {
    poolAddress: string;
    offset: number;
    limit: number;
    beforeTimestamp: number;
    afterTimestamp: number;
    threshold: number;
}

export type detectLiquidityPoolChangeByTimeStampData = {
    fromTimestamp: number;
    toTimestamp: number;
    baseTokenAmountChange: number;
    quoteTokenAmountChange: number;
    liquidityChange: number;
    liquidityChangePercentage: number;
    liquidityUiAmount?: number;
    reason: string
}

export interface detectLiquidityPoolChangeByTimeStampResponse {
    data?: detectLiquidityPoolChangeByTimeStampData | string;
    error?: string;
}

export type liquidityPoolInfoByPairAddressParam = {
    pairAddress: string;
}

export type liquidityPoolInfoByPairAddressResponse = {
    data?: liquidityPoolInfoByToken;
    error?: string;
}
    