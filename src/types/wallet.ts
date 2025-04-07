export interface checkWalletStatusParam {
    percentage: number;
    wallet: string; 
    thresholds: number;
}

export type checkNewWalletStatusParam = {
    percentage: number;
    wallet: string;
    thresholdsTimestampe: number;
}

export interface checkNewWalletStatusResponse{
    data?: DetectedNewWalletType;
    error?: string
}

export interface checkWalletStatusResponse{
    data?: DetectedWallet;
    error?: string
}

export interface walletAmountStatus{
    address: string,
    amount: number,
}


export type resposneType = {
    mint: string;
}

export type checkWalletParam = {
    wallet: string;
    percentage: number;
    thresholds: number;
    thresholdsTimestampe: number;
}

export interface checkWalletResponse {
    data?: DetectedNewWalletType | DetectedWallet;
    error?: string
}

export type DetectedNewWalletType = {
    TokenInfoInWalletType: TokenInfoInWalletType[];
    riskState: string;
}

export type TokenInfoInWalletType = {
    address: string
    mint: string;
    totalSupply: number;
    supply: number;
    price: number;
    decimals: number;
}

export type DetectedWallet = {
    DetextedWalletType: DetextedWalletType;
    riskState: string;
}

export type DetextedWalletType = {
    issue: TokenInfoInWalletType;
    otherTokenSum: number;
    otherMints: string[];
}