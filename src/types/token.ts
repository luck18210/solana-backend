import { getTokenLargetAccounts } from "@/feature/token";

export interface getTokenAccountsResponse {
    error?: string;
    data?: tokenInfo[];
}

export interface getTokenTopHoldersResponse {
    error?: string;
    data?: tokenTopHolderInfo;
}

export type tokenTopHolderInfo = {
    topHolderInfo:topHolderInfo[],
    riskState: string
}

export interface getTokenInformsResponse {
    error?: string;
    data?: any;
}

export interface tokenCheckResponse {
    error?: string;
    data?: tokenAnalysis[];
}

export type tokenCheckParam = {
    wallet: string,
    percentage: number
}

export type gettokenParam = {
    wallet: string;
    page: number,
    limit: number
}

export type getTopHolderParam = {
    mint: string,
    totalMem: number,
    percentage: number
}

export type getTokenLargetAccountsParam = {
    mint: string,
    totalMem: number,
}

export type tokenLargetAccountData = {
    address: string,
    amount: string,
    decimals: number,
    uiAmount: number,
    uiAmountString: string
}

export interface getTokenLargetAccountResponse {
    data?: tokenLargetAccountData[];
    error?: string
}

export type tokenInfo = {
    address: string,
    mint: string,
    owner: string,
    amount: number,
    delegated_amount: number,
    frozen: boolean
}

export type topHolderInfo = {
    address: string,
    amount: string,
    decimals: number,
    uiAmount: number,
    uiAmountString: string,
    percentage: number
}

export type tokenAnalysis = {
    token: tokenInfo;
    holders: topHolderInfo[]
}

export type getTokenTotalSupplyParam = {
    mint: string;
}

export type getTokenTotalSupplyData = {
    amount: string,
    decimals: number,
    uiAmount: number,
    uiAmountString: string
}

export interface getTokenTotalSupplyResponse {
    data?: getTokenTotalSupplyData,
    error?: string
}

export type getTokenHistoricalPriceParam = {
    mint: string;
    from: number;
    to: number;
    address_type: string;
    type: string;
}

export type getTokenHistoricalPriceResponse = {
    data?: getTokenHistoricalPriceData[];
    error?: string;
}

export type getTokenHistoricalPriceData = {
    price: number;
    timestamp: number;
}

export type detectSharpTokenPriceMovementParam = {
    threshold: number;
    period: number;
    mint: string;
    address_type: string;
    type: string;
    from: number;
    to: number;
}

export type detectSharpTokenPriceMovementResponse = {
    data?: detectSharpTokenPriceMovementDataType;
    error?: string;
}

export type detectSharpTokenPriceMovementDataType = {
    detectSharpTokenPriceMovementData: detectSharpTokenPriceMovementData[];
    riskState: string;
}

export type detectSharpTokenPriceMovementData = {
    variety: number;
    priceVariety: number[];
    timestampPeriod: number[];
}

export type getTokenPriceByTimestampParam = {
    mint: string;
    timestamp: number;
}

export type getTokenPriceByTimestampResponse = {
    data?: number;
    error?: string;
}

export type getTokenPriceByUnixTimeParam = {
    mint: string;
    timestamp: number;
}

export type getTokenPriceByUnixTimeResponse = {
    data?: number;
    error?: string;
}

export type getTokenOverviewDataParam = {
    mint: string;
}

export type getTokenOverviewData = {
    mint: string;
    decimals: number;
    symbol: string;
    name: string;
    logoURL: string;
    liquidity: number;
    price: number;
    totalSupply: number;
    fdv: number;
    marketCap: number;
    holders: number;
    price_change_30m: number;
    price_change_1h: number;
    price_change_2h: number;
    price_change_4h: number;
    price_change_6h: number;
    price_change_8h: number;
    price_change_12h: number;
    price_change_24h: number;
}

export type getTokenOverviewDataResponse = {
    data?: getTokenOverviewData;
    error?: string;
}

export type tokenInitialInfo = {
    mint: string;
    decimals: number;
    symbol: string;
    name: string;
    logoURL: string;
    liquidity: number;
    totalSupply: number;
    price: number;
    fdv: number;
    marketCap: number;
    holders: number;
    price_change_30m: number;
    price_change_1h: number;
    price_change_2h: number;
    price_change_4h: number;
    price_change_6h: number;
    price_change_8h: number;
    price_change_12h: number;
    price_change_24h: number;
    tokenType: string;
}