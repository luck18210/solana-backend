import { liquidityType, tokenType } from ".";
import { topHolderInfo } from "./token";
import { detectBuySellType, detectRapidBuysameData, detectRapidBuySellData } from "./transction";
import { DetectedNewWalletType, DetectedWallet } from "./wallet";

export type checkWalletOrTokenAddressParam = {
    address: string;
}

export type checkWalletOrTokenAddressData = {
    lamports: number;
    data: string;
    owner: string;
    executable: boolean;
    rentEpoch: number;
    space: number;
}

export type checkWalletOrTokenAddressResponse = {
    data?: tokenInfoResponse | walletInfoResponse | string;
    error?: string;
}

export type tokenTopHolderInfo = {
    topHolderInfo:topHolderInfo[],
    riskState: string
}

export type tokenInfoResponse = {
    tokenTopHolders: tokenTopHolderInfo;
    detectSharpTokenPriceMovement: tokenType.detectSharpTokenPriceMovementDataType;
    checkCurrentLiquidity: liquidityType.detectLiquidityPoolInfo;
    tokenOrWallet: string;
    tokenInitialInfo: tokenType.tokenInitialInfo;
}

export type walletInfoResponse = {
    walletStatus: DetectedNewWalletType | DetectedWallet;
    detectRapidBuySell: detectRapidBuySellData;
    detectRapidBuySameToken: detectRapidBuysameData;
    tokenOrWallet: string;
}

export type getUserInfoParam = {
    email: string;
}

export type userInfoType = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    score: number;
    isPioneer: boolean;
    isEarlyRecruiter: boolean;
    isFirstRecruiter: boolean;
    isGuildMember: boolean;
}

export type UserInfoResponse = {
    data?: userInfoType;
    error?: string;
}

export type createUserParam = {
    userName: string;
    emailAddr: string;
    password: string;
}

export type updateUserParam = {
    userName: string;
    emailAddr: string;
    score: number;
}

export type CreateJwtTokenData = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    score: number;
    isPioneer: boolean;
    isEarlyRecruiter: boolean;
    isFirstRecruiter: boolean;
    isGuildMember: boolean;
    jwtToken: string;
}

export type CreateJwtTokenResponse = {
    data?: CreateJwtTokenData;
    error?: string;
}

export type updateUserEmailParam = {
    email: string;
    newEmail: string;
    password: string;
}

export type updateUserEmailResponse = {
    data?: userInfoType;
    error?: string;
}

export type updatePasswordParam = {
    email: string;
    oldPassword: string;
    newPassword: string;
}

export type createPwdForGoogleParam = {
    email: string;
    password: string;
}

export type createUserJwtForGoogleParam = {
    email: string;
    userName?: string;
}

export type updateUserByInvitationParam = {
    userId: string;
    userName: string;
    email: string;
    password: string;
}

export type updateUserByInvitationResponse = {
    data?: CreateJwtTokenData;
    error?: string;
}

export type updateUserByGuildParam = {
    email: string;
}

export type updateUserByGuildResponse = {
    data?: userInfoType;
    error?: string;
}

export type deleteUserParam = { 
    email: string;
}

export type deleteUserResponse = {
    data?: boolean;
    error?: string;
}