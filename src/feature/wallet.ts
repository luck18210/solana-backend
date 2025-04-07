import {
  baseConfig,
  heliusConfig,
  tokenConfig,
} from '@/config';
import { heliusServer } from '@/service/axios';
import { checkType } from '@/types';
import { getTokenAccounts, getTokenDecimals, getTokenPrice, getTokenTotalSupply } from './token';
import { token } from '.';
import { getTransactions } from './transaction';

export const checkWalletStatus = async (param: checkType.checkWalletStatusParam): Promise<checkType.checkWalletStatusResponse> => {
    try {
        const tokenAccounts = await getTokenAccounts({
            wallet: param.wallet,
            page: 1,
            limit: 100
        })

        if(tokenAccounts.error) throw new Error(tokenAccounts.error);

        const tokenInfo: checkType.TokenInfoInWalletType[] = [];

        if(tokenAccounts.data){
            for(const tokenAccount of tokenAccounts.data) {
                if(tokenAccount.mint == tokenConfig.WSOL_MINT_ADDR) continue;
                const totalSupply= await getTokenTotalSupply({
                    mint: tokenAccount.mint
                });

                const tokenPrice = await getTokenPrice(
                    tokenAccount.mint
                );

                const tokenDecimal = await getTokenDecimals(
                    tokenAccount.mint
                )

                if(!tokenPrice){
                    continue
                }
                if(!tokenDecimal){
                    continue;
                }
                if(totalSupply.error){
                    continue;
                }

                if(totalSupply.data){
                    tokenInfo.push({
                        address: tokenAccount.address,
                        mint: tokenAccount.mint,
                        totalSupply: Number(totalSupply.data.amount),
                        supply: tokenAccount.amount,
                        price: tokenPrice,
                        decimals: tokenDecimal
                    });
                }
            }
        }

        let detextedWalletInfo: checkType.DetextedWalletType = {
            issue: {
                address: "",
                mint: "",
                totalSupply: 0,
                supply: 0,
                price: 0,
                decimals: 0
            },
            otherTokenSum: 0,
            otherMints: []
        }
            
        for (let index = 0; index < tokenInfo.length; index++) {
            const mainTokenInfo = tokenInfo[index]
            if(mainTokenInfo.supply / mainTokenInfo.totalSupply * 100 > param.percentage){
                let tokenSum: number = 0;
                let mints: string[] = [];
                for (let count = 0; count < tokenInfo.length; count++) {
                    if(index === count) continue;
                    else{
                        const element = tokenInfo[count];
                        tokenSum += element.supply * element.price / Math.pow(10, element.decimals);
                        mints.push(element.mint);
                    }
                }
                if(tokenSum < param.thresholds){
                    detextedWalletInfo = {
                        issue: {
                            address: mainTokenInfo.address,
                            mint: mainTokenInfo.mint,
                            totalSupply: mainTokenInfo.totalSupply,
                            supply: mainTokenInfo.supply,
                            price: mainTokenInfo.price,
                            decimals: mainTokenInfo.decimals
                        },
                        otherTokenSum: tokenSum,
                        otherMints: mints
                    }

                    break;
                }
            }
        }

        console.log("detextedWalletInfo", detextedWalletInfo);

        if(detextedWalletInfo.issue.mint === "" || detextedWalletInfo.issue.address === ""){
            let riskState = `<p>🟢 Safe: </br /> This wallet holds multiple tokens—common for real users.</p>`;
            return{
                data: {
                    DetextedWalletType: detextedWalletInfo,
                    riskState: riskState
                }
            }
        }

        let riskState = `<p>🔴 Not Safe: </br /> New wallet received a large amount of tokens quickly. Could be part of fake distribution or insider control.</p>`;

        const detectedWallet: checkType.DetectedWallet = {
            DetextedWalletType: detextedWalletInfo,
            riskState: riskState
        }

        return {
            data: detectedWallet,
        }

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}


export const checkNewWalletStatus = async (param: checkType.checkNewWalletStatusParam): Promise<checkType.checkNewWalletStatusResponse> => {
    try {
        console.log("param", param);
        const response = await getTransactions({
            wallet: param.wallet,
            type: "TRANSFER"
        });

        if(response.error){
            throw new Error(response.error);
        }

        const currentTimestamp = Math.floor(new Date().getTime() / 1000);
        const limitTimeStamp = currentTimestamp - param.thresholdsTimestampe * 24 * 60 * 60;

        if(response.data && response.data[response.data?.length - 1].timestamp < limitTimeStamp){
            let riskState = `<p>⚠️ Alert: </br /> This wallet is not a new wallet.</p>`;
            return {
                data: {
                    TokenInfoInWalletType: [],
                    riskState: riskState
                }
            }
        } 

        const tokenAccounts = await getTokenAccounts({
            wallet: param.wallet,
            page: 1,
            limit: 100
        })

        if(tokenAccounts.error) throw new Error(tokenAccounts.error);

        const tokenInfo: checkType.TokenInfoInWalletType[] = [];

        if(tokenAccounts.data){
            for(const tokenAccount of tokenAccounts.data) {
                if(tokenAccount.mint == tokenConfig.WSOL_MINT_ADDR) continue;
                const totalSupply= await getTokenTotalSupply({
                    mint: tokenAccount.mint
                });

                const tokenPrice = await getTokenPrice(
                    tokenAccount.mint
                );

                const tokenDecimal = await getTokenDecimals(
                    tokenAccount.mint
                )

                if(totalSupply.error) throw new Error(totalSupply.error);

                if(totalSupply.data){
                    if(tokenAccount.amount / Number(totalSupply.data.amount) * 100 > param.percentage){
                        tokenInfo.push({
                            address: tokenAccount.address,
                            mint: tokenAccount.mint,
                            totalSupply: Number(totalSupply.data.amount),
                            supply: tokenAccount.amount,
                            price: tokenPrice || 0,
                            decimals: tokenDecimal || 0
                        });
                    }
                }
            }
        }

        let riskState: string = ""
        if(tokenInfo.length == 0){
            riskState = `<p>🟢 Safe: </br /> This wallet holds multiple tokens—common for real users.</p>`;
        } else {
            riskState = `<p>🔴 Not Safe: </br /> New wallet received a large amount of tokens quickly. Could be part of fake distribution or insider control.</p>`;
        }

        if(tokenInfo.length == 0){
            return{
                data: {
                    TokenInfoInWalletType: [],
                    riskState: riskState
                }
            };
        }

        return {
            data: {
                TokenInfoInWalletType: tokenInfo,
                riskState: riskState
            }
        }

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const checkWallet = async (param: checkType.checkWalletParam): Promise<checkType.checkWalletResponse> => {
    try {
        console.log("param", param);
        const response = await getTransactions({
            wallet: param.wallet,
            type: "TRANSFER"
        });

        if(response.error){
            throw new Error(response.error);
        }

        const currentTimestamp = Math.floor(new Date().getTime() / 1000);
        const limitTimeStamp = currentTimestamp - param.thresholdsTimestampe * 24 * 60 * 60;

        if(response.data && response.data[response.data?.length - 1].timestamp < limitTimeStamp){
            console.log("------------checkWalletStatus----------");
            const walletInfo = await checkWalletStatus({
                wallet: param.wallet,
                percentage: param.percentage,
                thresholds: param.thresholds
            });
            
            if(walletInfo.error){
                throw new Error(walletInfo.error);
            }

            if(walletInfo.data){
                const detectedWallet: checkType.DetectedWallet = {
                    DetextedWalletType: walletInfo.data.DetextedWalletType,
                    riskState: walletInfo.data.riskState
                }
                return {
                    data: detectedWallet
                }
            }
        } 

        const tokenAccounts = await getTokenAccounts({
            wallet: param.wallet,
            page: 1,
            limit: 100
        })

        if(tokenAccounts.error) throw new Error(tokenAccounts.error);

        const tokenInfo: checkType.TokenInfoInWalletType[] = [];

        if(tokenAccounts.data){
            for(const tokenAccount of tokenAccounts.data) {
                if(tokenAccount.mint == tokenConfig.WSOL_MINT_ADDR) continue;
                const totalSupply= await getTokenTotalSupply({
                    mint: tokenAccount.mint
                });

                const tokenPrice = await getTokenPrice(
                    tokenAccount.mint
                );

                const tokenDecimal = await getTokenDecimals(
                    tokenAccount.mint
                )

                if(totalSupply.error) throw new Error(totalSupply.error);

                if(totalSupply.data){
                    if(tokenAccount.amount / Number(totalSupply.data.amount) * 100 > param.percentage){
                        tokenInfo.push({
                            address: tokenAccount.address,
                            mint: tokenAccount.mint,
                            totalSupply: Number(totalSupply.data.amount),
                            supply: tokenAccount.amount,
                            price: tokenPrice || 0,
                            decimals: tokenDecimal || 0
                        });
                    }
                }
            }
        }

        let riskState: string = ""
        if(tokenInfo.length == 0){
            riskState = `<p>🟢 Safe: </br /> This wallet holds multiple tokens—common for real users.</p>`;
        } else {
            riskState = `<p>🔴 Not Safe: </br /> New wallet received a large amount of tokens quickly. Could be part of fake distribution or insider control.</p>`;
        }

        if(tokenInfo.length == 0){
            return{
                data: {
                    TokenInfoInWalletType: [],
                    riskState: riskState
                }
            };
        }

        return {
            data: {
                TokenInfoInWalletType: tokenInfo,
                riskState: riskState
            }
        }

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}