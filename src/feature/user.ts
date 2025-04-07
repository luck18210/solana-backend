import {
    heliusConfig,
    userConfig,
} from '@/config';
import { heliusServer } from '@/service/axios';
import { checkType, liquidityType, tokenType, userType } from '@/types';
import { detectSharpTokenPriceMovement, getTokenOverviewData, getTokenPrice, getTokenTopHolders } from './token';
import { checkCurrentLiquidity } from './liquidity';
import { checkNewWalletStatus, checkWallet, checkWalletStatus } from './wallet';
import { detectRapidBuySell, detectRapidBuySameToken } from './transaction';
import prisma from '@/service/db';
import jwt_encode from 'jwt-encode';
import bcrypt from 'bcryptjs';

export const checkWalletOrTokenAddress = async (param: userType.checkWalletOrTokenAddressParam): Promise<userType.checkWalletOrTokenAddressResponse> => {
    try {
        const response = await heliusServer.post(`/?api-key=${heliusConfig.HELIUS_API_KEY}`, {
            jsonrpc: "2.0",
            method: "getAccountInfo",
            id: "1",
            params: [
                param.address,
                {
                    "encoding": "base58"
                }
            ],
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if(!response?.data?.result?.value) {
            throw new Error("Please enter a valid token address or wallet address");
        }

        let errorString : string = "";
        let tokenInfoResponse : userType.tokenInfoResponse = {
            tokenTopHolders: {
                topHolderInfo: [],
                riskState: "",
            },
            detectSharpTokenPriceMovement: {
                detectSharpTokenPriceMovementData: [],
                riskState: "",
            },
            checkCurrentLiquidity: {
                detectLiquidityPoolInfo: [],
                riskState: "",
            },
            tokenOrWallet: "token",
            tokenInitialInfo: {
                mint: "",
                decimals: 0,
                symbol: "",
                name: "",
                logoURL: "",
                liquidity: 0,
                totalSupply: 0,
                price: 0,
                fdv: 0,
                marketCap: 0,
                holders: 0,
                price_change_30m: 0,
                price_change_1h: 0,
                price_change_2h: 0,
                price_change_4h: 0,
                price_change_6h: 0,
                price_change_8h: 0, 
                price_change_12h: 0,
                price_change_24h: 0,
                tokenType: "",
            },
        };

        if(response.data.result.value.owner === userConfig.SYSTEM_PROGRAM) {
            console.log("--------------This address is wallet---------------");            

            const detectRapidBuySellResponse = await detectRapidBuySell({
                walletAddress: {
                    wallet: param.address,
                    type: "SWAP",
                },
                offset: 1,
                amountThresholds: 100,
                amountLimitPerTrx: 1,
            });

            if(detectRapidBuySellResponse.error) {
                errorString.concat(detectRapidBuySellResponse.error, "-");
            }

            console.log("detectRapidBuySellResponse", detectRapidBuySellResponse);

            const buySell = detectRapidBuySellResponse.data && Array.isArray(detectRapidBuySellResponse.data.detectBuySellType) ? detectRapidBuySellResponse.data.detectBuySellType.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 3) : [];

            const detectRapidBuySellData = {
                detectBuySellType: buySell,
                riskState: detectRapidBuySellResponse.data ? detectRapidBuySellResponse.data.riskState : "",
            }

            const detectRapidBuySameTokenResponse = await detectRapidBuySameToken({
                walletAddress: {
                    wallet: param.address,
                    type: "SWAP",
                },
                offset: 1,
                amountThresholds: 100,
                amountLimitPerTrx: 1,
            });

            if(detectRapidBuySameTokenResponse.error) {
                errorString.concat(detectRapidBuySameTokenResponse.error, "-");
            }

            const data = detectRapidBuySameTokenResponse.data && Array.isArray(detectRapidBuySameTokenResponse.data.detectBuySameTokenType) ? detectRapidBuySameTokenResponse.data.detectBuySameTokenType.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 3) : [];

            const detectRapidBuySameTokenData = {
                detectBuySameTokenType: data,
                riskState: detectRapidBuySameTokenResponse.data ? detectRapidBuySameTokenResponse.data.riskState : "",
            }
            
            const checkWalletResponse = await checkWallet({
                wallet: param.address,
                percentage: 5,
                thresholds: 10000,
                thresholdsTimestampe: 30,
            });

            if(checkWalletResponse.error) { 
                errorString.concat(checkWalletResponse.error, "-");
            }

            if(checkWalletResponse.data){   

                const walletInfoResponse: userType.walletInfoResponse = {
                    walletStatus: checkWalletResponse.data,
                    detectRapidBuySell: detectRapidBuySellData,
                    detectRapidBuySameToken: detectRapidBuySameTokenData,
                    tokenOrWallet: "wallet",
                };

                console.log("walletInfoResponse", walletInfoResponse);

                return {
                    data: walletInfoResponse,
                }
            }

            // const newwalletStatusResponse = await checkNewWalletStatus({
            //     percentage: 5,
            //     wallet: param.address,
            //     thresholdsTimestampe: 30,
            // });

            // if(newwalletStatusResponse.error) {
            //     errorString.concat(newwalletStatusResponse.error, "-");
            // }

            // console.log("newwalletStatusResponse", newwalletStatusResponse.data);

            // if(newwalletStatusResponse?.data?.riskState) {
            //     if (newwalletStatusResponse?.data?.riskState.includes("Alert")) {
            //         const WalletStatusResponse = await checkWalletStatus({
            //             percentage: 5,
            //             wallet: param.address,
            //             thresholds: 10000,
            //         });
        
            //         if(WalletStatusResponse.error) {
            //             errorString.concat(WalletStatusResponse.error, "-");
            //         }

            //         if(WalletStatusResponse.data && detectRapidBuySellData && detectRapidBuySameTokenData) {
            //             const walletInfoResponse: userType.walletInfoResponse = {
            //                 walletStatus: WalletStatusResponse.data as checkType.DetectedNewWalletType,
            //                 detectRapidBuySell: detectRapidBuySellData,
            //                 detectRapidBuySameToken: detectRapidBuySameTokenData,
            //                 tokenOrWallet: "wallet",
            //             };
            
            //             return {
            //                 data: walletInfoResponse,
            //             }
            //         }
            //     } else{
            //         if(newwalletStatusResponse.data && detectRapidBuySellData && detectRapidBuySameTokenData) {
            //             const walletStatus: checkType.DetectedNewWalletType = {
            //                 TokenInfoInWalletType: newwalletStatusResponse.data.TokenInfoInWalletType,
            //                 riskState: newwalletStatusResponse.data.riskState
            //             }

            //             const walletInfoResponse: userType.walletInfoResponse = {
            //                 walletStatus: walletStatus,
            //                 detectRapidBuySell: detectRapidBuySellData,
            //                 detectRapidBuySameToken: detectRapidBuySameTokenData,
            //                 tokenOrWallet: "wallet",
            //             };
            
            //             return {
            //                 data: walletInfoResponse,
            //             }
            //         }
            //     }
            // } 
            // if(newwalletStatusResponse.data && Array.isArray(newwalletStatusResponse.data) && detectRapidBuySellData && detectRapidBuySameTokenData) {
            //     const walletInfoResponse: userType.walletInfoResponse = {
            //         walletStatus: newwalletStatusResponse.data,
            //         detectRapidBuySell: detectRapidBuySellData,
            //         detectRapidBuySameToken: detectRapidBuySameTokenData,
            //         tokenOrWallet: "wallet",
            //     };

            //     return {
            //         data: walletInfoResponse,
            //     }
            // }
            
        } else if(response.data.result.value.owner === userConfig.SYSTEM_PROGRAM || response.data.result.value.owner === userConfig.TOKEN_PROGRAM || response.data.result.value.owner === userConfig.TOKEN_2022_PROGRAM) {
            console.log("--------------This address is token---------------");

            const tokenType = response.data.result.value.owner === userConfig.TOKEN_2022_PROGRAM ? "spl-token-2022" : "spl-token";

            const tokenOverviewDataResponse = await getTokenOverviewData({
                mint: param.address,
            });

            if(tokenOverviewDataResponse.error) {
                errorString.concat(tokenOverviewDataResponse.error, "-");
            }

            const tokenInitialData: tokenType.tokenInitialInfo = {
                mint: param.address,
                decimals: tokenOverviewDataResponse.data?.decimals || 0,
                symbol: tokenOverviewDataResponse.data?.symbol || "",
                name: tokenOverviewDataResponse.data?.name || "",
                logoURL: tokenOverviewDataResponse.data?.logoURL || "",
                liquidity: tokenOverviewDataResponse.data?.liquidity || 0,
                totalSupply: tokenOverviewDataResponse.data?.totalSupply || 0,
                price: tokenOverviewDataResponse.data?.price || 0,
                fdv: tokenOverviewDataResponse.data?.fdv || 0,
                marketCap: tokenOverviewDataResponse.data?.marketCap || 0,
                holders: tokenOverviewDataResponse.data?.holders || 0,
                price_change_30m: tokenOverviewDataResponse.data?.price_change_30m || 0,
                price_change_1h: tokenOverviewDataResponse.data?.price_change_1h || 0,
                price_change_2h: tokenOverviewDataResponse.data?.price_change_2h || 0,
                price_change_4h: tokenOverviewDataResponse.data?.price_change_4h || 0,
                price_change_6h: tokenOverviewDataResponse.data?.price_change_6h || 0,
                price_change_8h: tokenOverviewDataResponse.data?.price_change_8h || 0,
                price_change_12h: tokenOverviewDataResponse.data?.price_change_12h || 0,
                price_change_24h: tokenOverviewDataResponse.data?.price_change_24h || 0,
                tokenType: tokenType,
            }

            const tokenTopHoldersResponse = await getTokenTopHolders({
                mint: param.address,
                totalMem: 3,
                percentage: 5,
            });

            if(tokenTopHoldersResponse.error) {
                errorString.concat(tokenTopHoldersResponse.error, "-");
            }

            console.log("tokenTopHoldersResponse", tokenTopHoldersResponse.data);

            const detectSharpTokenPriceMovementResponse = await detectSharpTokenPriceMovement({
                threshold: 5,
                period: 1,
                mint: param.address,
                address_type: "token",
                type: "15m",
                from: 0,
                to: 0,
            });

            if(detectSharpTokenPriceMovementResponse.error) {
                errorString.concat(detectSharpTokenPriceMovementResponse.error, "-");
            }

            const checkCurrentLiquidityResponse = await checkCurrentLiquidity({
                mint: param.address,
                threshold: 50000,
            });

            if(checkCurrentLiquidityResponse.error) {
                errorString.concat(checkCurrentLiquidityResponse.error, "-");
            }

            let newDetectSharpTokenPriceMovementData: tokenType.detectSharpTokenPriceMovementData[] | string = [];

            newDetectSharpTokenPriceMovementData = detectSharpTokenPriceMovementResponse.data ? detectSharpTokenPriceMovementResponse.data.detectSharpTokenPriceMovementData.sort((a, b) => b.variety - a.variety).slice(0, 3) : [];

            const detectSharpTokenPriceMovementData: tokenType.detectSharpTokenPriceMovementDataType = {
                detectSharpTokenPriceMovementData: newDetectSharpTokenPriceMovementData,
                riskState: detectSharpTokenPriceMovementResponse.data ? detectSharpTokenPriceMovementResponse.data.riskState : "",
            }

            let newCheckCurrentLiquidityData: liquidityType.liquidityPoolInfoByToken[] = [];

            newCheckCurrentLiquidityData = checkCurrentLiquidityResponse.data ? checkCurrentLiquidityResponse.data.detectLiquidityPoolInfo.sort((a: liquidityType.liquidityPoolInfoByToken, b: liquidityType.liquidityPoolInfoByToken) => 
                (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
            ).slice(0, 3) : [];

            const checkCurrentLiquidityData = {
                detectLiquidityPoolInfo: newCheckCurrentLiquidityData,
                riskState: checkCurrentLiquidityResponse.data ? checkCurrentLiquidityResponse.data.riskState : "",
            };

            tokenInfoResponse = {
                tokenTopHolders: tokenTopHoldersResponse.data || {
                    topHolderInfo: [],
                    riskState: "",
                },
                detectSharpTokenPriceMovement: detectSharpTokenPriceMovementData,
                checkCurrentLiquidity: checkCurrentLiquidityData,
                tokenOrWallet: "token",
                tokenInitialInfo: tokenInitialData,
            }
            return {
                data: tokenInfoResponse
            }
        }

        return {
            data: errorString,
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const createUser = async (param: userType.createUserParam): Promise<userType.UserInfoResponse> => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.emailAddr,
            },
        });

        if(user) {
            throw new Error("User already exists");
        }

        const response = await prisma.user.create({
            data: {
                userName: param.userName,
                emailAddr: param.emailAddr,
                password: param.password,
                created_at: new Date(),
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
            },
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const createUserJwt = async (param: userType.createUserParam): Promise<userType.CreateJwtTokenResponse> => {
    try {

        console.log(param);
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.emailAddr,
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,    
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        }); 

        if(!user) {
            throw new Error("User Email or Password is incorrect");
        }

        const isPasswordValid = await bcrypt.compare(param.password, user.password || "");

        if(!isPasswordValid) {
            throw new Error("Password is incorrect");
        }

        const payload = {
            email: user.emailAddr,
        }

        const jwtToken = jwt_encode(payload, userConfig.JWT_SECRET);

        return {
            data: {
                id: user.id,
                name: user.userName || "",
                email: user.emailAddr || "",
                password: user.password || "",
                createdAt: user.created_at.toISOString(),
                updatedAt: user.updated_at.toISOString(),
                score: user.score,
                isPioneer: user.isPioneer,
                isEarlyRecruiter: user.isEarlyRecruiter,
                isFirstRecruiter: user.isFirstRecruiter,
                isGuildMember: user.isGuildMember,
                jwtToken: jwtToken,
            },
        }
        
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const getUserInfo = async (param: userType.getUserInfoParam): Promise<userType.UserInfoResponse> => {
    try {
        const response = await prisma.user.findFirst({
            where: {
                emailAddr: param.email,
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });        

        if(!response) {
            throw new Error("User not found");
        }

        const userInfoResponse: userType.userInfoType = {
            id: response.id,
            name: response.userName,
            email: response.emailAddr || "",
            password: response.password || "",
            createdAt: response.created_at.toISOString(),
            updatedAt: response.updated_at.toISOString(),
            score: response.score,
            isPioneer: response.isPioneer,
            isEarlyRecruiter: response.isEarlyRecruiter,
            isFirstRecruiter: response.isFirstRecruiter,
            isGuildMember: response.isGuildMember,
        }

        return {
            data: userInfoResponse
        }

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const updateUser = async (param: userType.updateUserParam): Promise<userType.UserInfoResponse> => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.emailAddr,
            },
        });

        if(!user) {     
            throw new Error("User not found");
        }

        if(userConfig.IS_MVP === "true") {
            await prisma.user.update({
                where: {
                    emailAddr: param.emailAddr,
                },
                data: {
                    isPioneer: true,
                },
            });
        }
        
        const response = await prisma.user.update({
            where: {
                emailAddr: param.emailAddr,
            },
            data: {
                userName: param.userName,
                emailAddr: param.emailAddr,
                score: param.score,
                updated_at: new Date(),
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });     

        if(!response) {
            throw new Error("User not found");
        }

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
            },
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const updateUserEmail = async (param: userType.updateUserEmailParam): Promise<userType.UserInfoResponse> => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.email,
            }
        });

        if(!user) { 
            throw new Error("User not found");
        }

        const userWithNewEmail = await prisma.user.findFirst({
            where: {
                emailAddr: param.newEmail,
            }
        });

        if(userWithNewEmail) {
            throw new Error("That email already exists");
        }
        
        const isPasswordValid = await bcrypt.compare(param.password, user.password || "");

        if(!isPasswordValid) {
            throw new Error("Password is incorrect, If you logged in with Google, please use Google login or create a new password");
        }

        const response = await prisma.user.update({
            where: {
                emailAddr: param.email,
            },
            data: {
                emailAddr: param.newEmail,
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });

        if(!response) { 
            throw new Error("User not found");
        }

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
            },
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const updatePassword = async (param: userType.updatePasswordParam): Promise<userType.UserInfoResponse> => {
    try {
        console.log(param);
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.email,
            },
        });

        if(!user) {
            throw new Error("User not found");
        }

        console.log(user.password);

        if(!user.password){
            throw new Error("Password is not set, If you logged in with Google, please use Google login or create a new password");
        }

        console.log(param.oldPassword, user.password);

        const isOldPasswordValid = await bcrypt.compare(param.oldPassword, user.password || "");

        if(!isOldPasswordValid) {
            throw new Error("Old password is incorrect");
        }

        const hashedNewPassword = await bcrypt.hash(param.newPassword, 10);

        const response = await prisma.user.update({
            where: {
                emailAddr: param.email,
            },
            data: {
                password: hashedNewPassword,
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });

        if(!response) {
            throw new Error("User not found");
        }

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
            },
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const createPwdForGoogle = async (param: userType.createPwdForGoogleParam): Promise<userType.UserInfoResponse> => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.email,
            },
        });

        console.log("user", user);
        
        if(!user) {
            throw new Error("User not found");
        }

        if(user.password) {
            throw new Error("You have already sign up with email and password");
        }

        const hashedPassword = await bcrypt.hash(param.password, 10);
        
        const response = await prisma.user.update({
            where: {
                emailAddr: param.email,
            },
            data: {
                password: hashedPassword,
            },
        });

        if(!response) {
            throw new Error("User not found");
        }

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
            },
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}  

export const createUserJwtForGoogle = async (param: userType.createUserJwtForGoogleParam): Promise<userType.CreateJwtTokenResponse> => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.email,
            },
        });

        if(user) {
            const payload = {
                email: user.emailAddr,
            }
            const jwtToken = jwt_encode(payload, userConfig.JWT_SECRET);

            return {
                data: {
                    id: user.id,
                    name: user.userName || "",
                    email: user.emailAddr || "",
                    password: user.password || "",
                    createdAt: user.created_at.toISOString(),
                    updatedAt: user.updated_at.toISOString(),
                    score: user.score,
                    isPioneer: user.isPioneer,
                    isEarlyRecruiter: user.isEarlyRecruiter,
                    isFirstRecruiter: user.isFirstRecruiter,
                    isGuildMember: user.isGuildMember,
                    jwtToken: jwtToken,
                }
            }
        }

        const createUserResponse = await prisma.user.create({    
            data: {
                emailAddr: param.email,
                userName: param.userName || "",
                password: "",
                created_at: new Date(),
            },
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });  

        const payload = {
            email: createUserResponse.emailAddr,
        }

        const jwtToken = jwt_encode(payload, userConfig.JWT_SECRET);

        return {
            data: {
                id: createUserResponse.id,
                name: createUserResponse.userName || "",
                email: createUserResponse.emailAddr || "",
                password: createUserResponse.password || "",
                createdAt: createUserResponse.created_at.toISOString(),
                updatedAt: createUserResponse.updated_at.toISOString(),
                score: createUserResponse.score,
                isPioneer: createUserResponse.isPioneer,
                isEarlyRecruiter: createUserResponse.isEarlyRecruiter,
                isFirstRecruiter: createUserResponse.isFirstRecruiter,
                isGuildMember: createUserResponse.isGuildMember,
                jwtToken: jwtToken,
            }
        }
        
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const updateUserByInvitation = async (param: userType.updateUserByInvitationParam): Promise<userType.updateUserByInvitationResponse> => {
    try {
        const earlyUser = await prisma.user.findFirst({
            where: {
                id: param.userId,
            },
        });

        if(!earlyUser) {
            throw new Error("Invalid Invitation Code");
        }

        const user = await prisma.user.findFirst({
            where: {
                emailAddr: param.email,
            },
        });

        if(user) {
            const payload = {
                email: user.emailAddr,
            }
            const jwtToken = jwt_encode(payload, userConfig.JWT_SECRET);

            return {
                data: {
                    id: user.id,
                    name: user.userName,
                    email: user.emailAddr || "",
                    password: user.password || "",
                    createdAt: user.created_at.toISOString(),
                    updatedAt: user.updated_at.toISOString(),
                    score: user.score,
                    isPioneer: user.isPioneer,
                    isEarlyRecruiter: user.isEarlyRecruiter,
                    isFirstRecruiter: user.isFirstRecruiter,
                    isGuildMember: user.isGuildMember,
                    jwtToken: jwtToken,
                }
            }
        }

        const hashedPassword = await bcrypt.hash(param.password, 10);

        const response = await prisma.user.create({
            data: {
                emailAddr: param.email,
                userName: param.userName,
                password: hashedPassword,
                created_at: new Date(),
            },  
            select: {
                id: true,
                userName: true,
                emailAddr: true,
                password: true,
                created_at: true,
                updated_at: true,
                score: true,
                isPioneer: true,
                isEarlyRecruiter: true,
                isFirstRecruiter: true,
                isGuildMember: true,
            },
        });

        const payload = {
            email: response.emailAddr,
        }

        const jwtToken = jwt_encode(payload, userConfig.JWT_SECRET);
            
        if(userConfig.IS_MVP === "true") {

            await prisma.user.update({
                where: {
                    id: param.userId,
                },
                data: {
                    isEarlyRecruiter: true,
                },
            });
        } else {
            await prisma.user.update({
                where: {
                    id: param.userId,
                },
                data: {
                    isFirstRecruiter: true,
                },
            });
        }

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
                jwtToken: jwtToken,
            }
        }
        
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const updateUserByGuild = async (param: userType.updateUserByGuildParam): Promise<userType.updateUserByGuildResponse> => {
    try {
        const user = await prisma.user.findFirst({  
            where: {
                emailAddr: param.email,
            },
        });

        if(!user) {
            throw new Error("User not found");
        }


        const response = await prisma.user.update({
            where: {
                emailAddr: param.email,
            },
            data: {
                isGuildMember: true,
            },
        }); 

        return {
            data: {
                id: response.id,
                name: response.userName,
                email: response.emailAddr || "",
                password: response.password || "",
                createdAt: response.created_at.toISOString(),
                updatedAt: response.updated_at.toISOString(),
                score: response.score,
                isPioneer: response.isPioneer,
                isEarlyRecruiter: response.isEarlyRecruiter,
                isFirstRecruiter: response.isFirstRecruiter,
                isGuildMember: response.isGuildMember,
            }
        }
        
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const deleteUser = async (param: userType.deleteUserParam): Promise<userType.deleteUserResponse> => {
    try {
        const response = await prisma.user.delete({
            where: {
                emailAddr: param.email,
            },
        });

        if(!response) {
            throw new Error("User not found");
        }

        return {
            data: true,
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}