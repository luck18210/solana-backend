export interface getTransactionsResponse {
    error?: string;
    data?: getTransactionsType[];
}

export type getTransactionsParam = {
    wallet: string;
    type: string;
}

export type walletLoopTransactionType = {
    walletAddress: getTransactionsParam;
    offset: number;
    amountThresholds: number;
    amountLimitPerTrx: number;
}

export type getTransactionsType = {
    description: string;
    type: string;
    source: string;
    fee: number;
    feePayer: string;
    signature: string;
    slot: number;
    timestamp: number;
    tokenTransfers?: tokenTransfersType[];
    nativeTransfers?: nativeTransfersType[];
    accountData?: accountsDataType[];
    transactionError?: string;
    instructions?: instructionsType[];
    events?: string;
}

export type tokenTransfersType = {
    fromTokenAccount: string;
    toTokenAccount: string;
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
}

export type nativeTransfersType = {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
}

export type accountsDataType = {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: number;
}

export type instructionsType = {
    accounts: string[];
    data: string;
    programId: string;
    innerInstructions: any[];
}

export type transferAnalysisType = {
    amountInUsd: number;
    timestamp: number;
    signature: string;
}

export type buySameTokenAnalysisType = {
    mint: string;
    amountInUsd: number;
    timestamp: number;
    signature: string;
}

export interface transferAnalysisResponse {
    data?: detectRapidBuySellData;
    error?: string
}

export interface BuySameTokenAnalysisResponse {
    data?: detectRapidBuysameData;
    error?: string
}

export type detectBuySellType = {
    totalAmount: number;
    signaturePattern: string[];
    timePattern: string;
}

export type detectBuySameTokenType = {
    mint: string;
    totalAmount: number;
    signaturePattern: string[];
    timePattern: string;
}

export type detectRapidBuysameData = {
    detectBuySameTokenType: detectBuySameTokenType[];
    riskState: string;
}

export type detectRapidBuySellData = {
    detectBuySellType: detectBuySellType[];
    riskState: string;
}