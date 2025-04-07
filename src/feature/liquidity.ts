import { liquidityType } from '@/types';
import { birdeyeAPIServer, dexScreenerAPIServer } from '@/service/axios';
import { birdeyeConfig } from '@/config';
import { getTokenPrice } from './token';

export const checkCurrentLiquidity = async (param: liquidityType.checkCurrentLiquidityParam): Promise<liquidityType.detectLiquidityPoolInfoResponse> => {
    try {
        const response = await getLiquidityPoolInfoByToken({mint: param.mint});

        if(response.error) {
            throw new Error(response.error);
        }        

        if (!response.data || !response.data[0]?.liquidity?.usd) {
            throw new Error("This token is not listed on any dex");
        }

        const liquidityPoolInfoByTokenInfo = response.data;

        let detectLiquidityPoolInfo: liquidityType.liquidityPoolInfoByToken[] = [];

        liquidityPoolInfoByTokenInfo?.forEach((item: liquidityType.liquidityPoolInfoByToken) => {
            if( item.liquidity?.usd && item.liquidity.usd < param.threshold) {
                detectLiquidityPoolInfo.push({
                    dexId: item.dexId,
                    pairAddress: item.pairAddress,
                    labels: item.labels,
                    baseToken: item.baseToken,
                    quoteToken: item.quoteToken,
                    priceNative: item.priceNative,
                    priceUsd: item.priceUsd,
                    txns: item.txns,
                    volume: item.volume,
                    priceChange: item.priceChange,
                    liquidity: item.liquidity,
                    fdv: item.fdv,
                    marketCap: item.marketCap,
                    pairCreatedAt: item.pairCreatedAt,
                });
            }
        });

        let riskState:string = "";
        if (detectLiquidityPoolInfo.length > 0) {
            riskState = `<p>🔴 Not Safe <br /> ⚠️Liquidity is very low at $${param.threshold}. This makes it easy to manipulate and hard to sell without major price slippage.</p>`;
        } else {
            riskState = `<p>🟢 Safe <br /> Token has healthy liquidity of $${param.threshold}, in line with its market cap and trading activity.</p>`;
        }

        const detectLiquidityPoolTotalInfo = {
            detectLiquidityPoolInfo,
            riskState: riskState
        }

        return {
            data: detectLiquidityPoolTotalInfo
        }
       
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const getLiquidityPoolInfoByToken = async (param: liquidityType.liquidityPoolInfoByTokenParam): Promise<liquidityType.liquidityPoolInfoByTokenResponse> => {
    try {
        const response = await dexScreenerAPIServer.get(`/latest/dex/tokens/${param.mint}`);

        if(response?.data?.pairs?.length === 0) {
            throw new Error("No data found");
        }

        let liquidityPoolInfoByTokenInfo: liquidityType.liquidityPoolInfoByToken[] = [];

        response.data.pairs.forEach((item: any) => {
            liquidityPoolInfoByTokenInfo.push({
                dexId: item.dexId,
                pairAddress: item.pairAddress,
                labels: item.labels,
                baseToken: item.baseToken.address,
                quoteToken: item.quoteToken.address,
                priceNative: item.priceNative,
                priceUsd: item.priceUsd,
                txns: {
                    m5: {
                        buys: item.txns?.m5?.buys,
                        sells: item.txns?.m5?.sells,
                    },
                    h1: {
                        buys: item.txns?.h1?.buys,
                        sells: item.txns?.h1?.sells,
                    },
                    h6: {
                        buys: item.txns?.h6?.buys,
                        sells: item.txns?.h6?.sells,
                    },
                    h24: {
                        buys: item.txns?.h24?.buys,
                        sells: item.txns?.h24?.sells,
                    },
                },
                volume: {
                    h24: item.volume?.h24,
                    h6: item.volume?.h6,
                    h1: item.volume?.h1,
                    m5: item.volume?.m5,
                },
                priceChange: {
                    m5: item.priceChange?.m5,
                    h1: item.priceChange?.h1,
                    h6: item.priceChange?.h6,
                    h24: item.priceChange?.h24,
                },
                liquidity: {
                    usd: item.liquidity?.usd,
                    base: item.liquidity?.base,
                    quote: item.liquidity?.quote,
                },
                fdv: item.fdv,
                marketCap: item.marketCap,
                pairCreatedAt: item.pairCreatedAt,
            })
        });

        return {
            data: liquidityPoolInfoByTokenInfo
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const getLiquidityPoolInfoByPairAddress = async (param: liquidityType.liquidityPoolInfoByPairAddressParam): Promise<liquidityType.liquidityPoolInfoByPairAddressResponse> => {
    try {
        const response = await dexScreenerAPIServer.get(`/latest/dex/pairs/solana/${param.pairAddress}`);

        if(!response?.data?.pair.pairAddress) {
            throw new Error("No data found");
        }

        const liquidityPoolInfoByPairAddressData: liquidityType.liquidityPoolInfoByToken = {
            dexId: response?.data?.pair.dexId,
            pairAddress: response?.data?.pair.pairAddress,
            labels: response?.data?.pair.labels,
            baseToken: response?.data?.pair.baseToken.address,
            quoteToken: response?.data?.pair.quoteToken.address,
            priceNative: response?.data?.pair.priceNative,
            priceUsd: response?.data?.pair.priceUsd,
            txns: {
                m5: {
                    buys: response?.data?.pair.txns.m5.buys,
                    sells: response?.data?.pair.txns.m5.sells,
                },
                h1: {
                    buys: response?.data?.pair.txns.h1.buys,
                    sells: response?.data?.pair.txns.h1.sells,
                },
                h6: {
                    buys: response?.data?.pair.txns.h6.buys,
                    sells: response?.data?.pair.txns.h6.sells,
                },
                h24: {
                    buys: response?.data?.pair.txns.h24.buys,
                    sells: response?.data?.pair.txns.h24.sells,
                },
            },
            volume: {
                h24: response?.data?.pair.volume.h24,
                h6: response?.data?.pair.volume.h6,
                h1: response?.data?.pair.volume.h1,
                m5: response?.data?.pair.volume.m5,
            },
            priceChange: {
                m5: response?.data?.pair.priceChange.m5,
                h1: response?.data?.pair.priceChange.h1,
                h6: response?.data?.pair.priceChange.h6,
                h24: response?.data?.pair.priceChange.h24,
            },
            liquidity: {
                usd: response?.data?.pair.liquidity.usd,
                base: response?.data?.pair.liquidity.base,
                quote: response?.data?.pair.liquidity.quote,
            },
            fdv: response?.data?.pair.fdv,
            marketCap: response?.data?.pair.marketCap,
            pairCreatedAt: response?.data?.pair.pairCreatedAt,
        }

        
        return {
            data: liquidityPoolInfoByPairAddressData
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const getLiquidityPoolInfoByTimeStamp = async (param: liquidityType.liquidityPoolInfoByTimeStampParam): Promise<liquidityType.liquidityPoolInfoByTimeStampResponse> => {
    try {
        let liquidityPoolInfoByTimeStampData: liquidityType.liquidityPoolInfoByTimeStampData = {
            txHash: [],
            txType: "",
            blockUnixTime: 0,
            baseTokenAmount: 0,
            quoteTokenAmount: 0,
            finished: false
        };
        if(param.beforeTimestamp && param.afterTimestamp){
            let loop:boolean = false;
            while(!loop) {
                const response = await birdeyeAPIServer.get(`/defi/txs/pair/seek_by_time`, {
                    params: {
                        address: param.poolAddress,
                        offset: param.offset,
                        limit: param.limit,
                        tx_type: param.txType,
                        before_time: param.beforeTimestamp,
                        // afterTimestamp: param.afterTimestamp
                    },
                    headers: {
                        'X-API-KEY': birdeyeConfig.BIRDEYE_API_KEY,
                        'accept': 'application/json',
                        'x-chain': 'solana'
                    }
                });
    
                if(response.data.data.items.length === 0 && response.data.success === true) {
                    throw new Error("No data found, please check the pool address or reset the timestamp");
                }
        
                const baseTokenPrice = await getTokenPrice(response.data.data.items[0].tokens[0].address);
        
                const quoteTokenPrice = await getTokenPrice(response.data.data.items[0].tokens[1].address);
        
                let txHash: string[] = [];
                const txType: string = response.data.data.items[0].txType;
                let blockUnixTime: number = 0;
                let baseTokenAmount: number = 0;
                let quoteTokenAmount: number = 0;
                let finished: boolean = false;
        
                for(let i = 0 ; i < response.data.data.items.length && !finished; i++) {
                    const item = response.data.data.items[i];
                    if (item.blockUnixTime > param.afterTimestamp) {
                        txHash.push(item.txHash);
                        blockUnixTime = item.blockUnixTime;
                        baseTokenAmount += (item.tokens[0].amount / 10 ** item.tokens[0].decimals) * baseTokenPrice;
                        quoteTokenAmount += (item.tokens[1].amount / 10 ** item.tokens[1].decimals) * quoteTokenPrice;
                    }
                    if(item.blockUnixTime <= param.afterTimestamp) {
                        finished = true;
                    }
                };
        
                liquidityPoolInfoByTimeStampData = {
                    txHash: liquidityPoolInfoByTimeStampData.txHash.concat(txHash),
                    txType: txType,
                    blockUnixTime: blockUnixTime,
                    baseTokenAmount: liquidityPoolInfoByTimeStampData.baseTokenAmount + baseTokenAmount,
                    quoteTokenAmount: liquidityPoolInfoByTimeStampData.quoteTokenAmount + quoteTokenAmount,
                    finished: finished,
                };
    
                loop = finished
                param.beforeTimestamp = response.data.data.items[response.data.data.items.length - 1].blockUnixTime;
            }
        } else if (param.afterTimestamp && param.beforeTimestamp === 0) {
            let loop:boolean = false;
            while(!loop) {
                const response = await birdeyeAPIServer.get(`/defi/txs/pair/seek_by_time`, {
                    params: {
                        address: param.poolAddress,
                        offset: param.offset,
                        limit: param.limit,
                        tx_type: param.txType,
                        // before_time: param.beforeTimestamp,
                        after_time: param.afterTimestamp
                    },
                    headers: {
                        'X-API-KEY': birdeyeConfig.BIRDEYE_API_KEY,
                        'accept': 'application/json',
                        'x-chain': 'solana'
                    }
                });
        
                if(response.data.data.items.length === 0 && response.data.success === true) {
                    throw new Error("No data found, please check the pool address or reset the timestamp");
                }
        
                const baseTokenPrice = await getTokenPrice(response.data.data.items[0].tokens[0].address);
        
                const quoteTokenPrice = await getTokenPrice(response.data.data.items[0].tokens[1].address);
        
                let txHash: string[] = [];
                const txType: string = response.data.data.items[0].txType;
                let blockUnixTime: number = 0;
                let baseTokenAmount: number = 0;
                let quoteTokenAmount: number = 0;
                const finished: boolean = response.data.data.hasNext ? false : true;
        
                for(let i = 0 ; i < response.data.data.items.length && !finished; i++) {
                    const item = response.data.data.items[i];
                    // txHash.push(item.txHash);
                    blockUnixTime = item.blockUnixTime;
                    baseTokenAmount += (item.tokens[0].amount / 10 ** item.tokens[0].decimals) * baseTokenPrice;
                    quoteTokenAmount += (item.tokens[1].amount / 10 ** item.tokens[1].decimals) * quoteTokenPrice;
                };
        
                liquidityPoolInfoByTimeStampData = {
                    txHash: [],
                    txType: txType,
                    blockUnixTime: blockUnixTime,
                    baseTokenAmount: liquidityPoolInfoByTimeStampData.baseTokenAmount + baseTokenAmount,
                    quoteTokenAmount: liquidityPoolInfoByTimeStampData.quoteTokenAmount + quoteTokenAmount,
                    finished: finished,
                };

                loop = response.data.data.hasNext ? false : true;
                param.afterTimestamp = response.data.data.items[response.data.data.items.length - 1].blockUnixTime;
            }
        }

        return {
            data: liquidityPoolInfoByTimeStampData
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const detectLiquidityPoolChangeByTimeStamp = async (param: liquidityType.detectLiquidityPoolChangeByTimeStampParam): Promise<liquidityType.detectLiquidityPoolChangeByTimeStampResponse> => {
    try {
        // Add
        let responseAddData: liquidityType.liquidityPoolInfoByTimeStampData = {
            txHash: [],
            txType: "",
            blockUnixTime: 0,
            baseTokenAmount: 0,
            quoteTokenAmount: 0,
            finished: false
        };
        let paramAdd = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "add",
            beforeTimestamp: param.beforeTimestamp,
            afterTimestamp: param.afterTimestamp
        }

        const responseAdd = await getLiquidityPoolInfoByTimeStamp(paramAdd);

        if(responseAdd.error) {
            throw new Error(responseAdd.error);
        }

        if (responseAdd.data?.txHash) {
            responseAddData.txHash.push(...responseAdd.data.txHash);
        }
        responseAddData.txType = responseAdd.data?.txType || "";
        responseAddData.blockUnixTime = responseAdd.data?.blockUnixTime || 0;
        responseAddData.baseTokenAmount += responseAdd.data?.baseTokenAmount || 0;
        responseAddData.quoteTokenAmount += responseAdd.data?.quoteTokenAmount || 0;
        responseAddData.finished = responseAdd.data?.finished || false;
        
        paramAdd.beforeTimestamp = responseAddData.baseTokenAmount - 1;

        // Remove
        let responseRemoveData: liquidityType.liquidityPoolInfoByTimeStampData = {
            txHash: [],
            txType: "",
            blockUnixTime: 0,
            baseTokenAmount: 0,
            quoteTokenAmount: 0,
            finished: false
        };
        let paramRemove = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "remove",
            beforeTimestamp: param.beforeTimestamp,
            afterTimestamp: param.afterTimestamp
        }

        const responseRemove = await getLiquidityPoolInfoByTimeStamp(paramRemove);

        if(responseRemove.error) {
            throw new Error(responseRemove.error);
        }

        if (responseRemove.data?.txHash) {
            responseRemoveData.txHash.push(...responseRemove.data.txHash);
        }
        responseRemoveData.txType = responseRemove.data?.txType || "";
        responseRemoveData.blockUnixTime = responseRemove.data?.blockUnixTime || 0;
        responseRemoveData.baseTokenAmount += responseRemove.data?.baseTokenAmount || 0;
        responseRemoveData.quoteTokenAmount += responseRemove.data?.quoteTokenAmount || 0;
        responseRemoveData.finished = responseRemove.data?.finished || false;

        paramRemove.beforeTimestamp = responseRemoveData.baseTokenAmount - 1;

        const baseTokenAmountChange = responseAddData.baseTokenAmount - responseRemoveData.baseTokenAmount;
        const quoteTokenAmountChange = responseAddData.quoteTokenAmount - responseRemoveData.quoteTokenAmount;

        const liquidityChange = baseTokenAmountChange + quoteTokenAmountChange;

        if(liquidityChange >= 0){
            return {
                data: {
                    fromTimestamp: param.afterTimestamp,
                    toTimestamp: param.beforeTimestamp,
                    baseTokenAmountChange,
                    quoteTokenAmountChange,
                    liquidityChange,
                    liquidityChangePercentage: param.threshold,
                    reason: "The liquidity has risen not dropped."
                }
            }
        }

        const paramForLiquidityInfo = {
            pairAddress: param.poolAddress
        }
        const responseLiquidityInfo = await getLiquidityPoolInfoByPairAddress(paramForLiquidityInfo);

        if(responseLiquidityInfo.error) {
            throw new Error(responseLiquidityInfo.error);
        }

        let currentLiquidityUsd: number = 0;
        if(responseLiquidityInfo.data?.liquidity?.usd) currentLiquidityUsd = responseLiquidityInfo.data?.liquidity.usd;

        const liquidityPoolCurrentInfoAddParam = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "add",
            beforeTimestamp: 0,
            afterTimestamp: param.beforeTimestamp
        }

        const currentInfoAddResponse = await getLiquidityPoolInfoByTimeStamp(liquidityPoolCurrentInfoAddParam);

        if(currentInfoAddResponse.error) {
            console.error(currentInfoAddResponse.error);
        } else {
            if(currentInfoAddResponse.data?.baseTokenAmount != null) {
                if (currentInfoAddResponse.data.baseTokenAmount !== 0) {
                    currentLiquidityUsd = currentLiquidityUsd - currentInfoAddResponse.data.baseTokenAmount;
                }
            }
        }

        const liquidityPoolCurrentInfoRemoveParam = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "remove",
            beforeTimestamp: 0,
            afterTimestamp: param.beforeTimestamp
        }

        const currentInfoRemoveResponse = await getLiquidityPoolInfoByTimeStamp(liquidityPoolCurrentInfoRemoveParam);

        if(currentInfoRemoveResponse.error) {
            console.error(currentInfoRemoveResponse.error);
        } else{
            if(currentInfoAddResponse.data?.quoteTokenAmount != null) {
                if (currentInfoAddResponse.data.quoteTokenAmount !== 0) {
                    currentLiquidityUsd = currentLiquidityUsd + currentInfoAddResponse.data.quoteTokenAmount;
                }
            }
        }

        let liquidityChangePercentage:number = 0;
        if(currentLiquidityUsd) {
            liquidityChangePercentage = Math.abs((liquidityChange / (currentLiquidityUsd - liquidityChange)) * 100);
        }

        if(liquidityChangePercentage < param.threshold) {
            return {
                data: {
                    fromTimestamp: param.afterTimestamp,
                    toTimestamp: param.beforeTimestamp,
                    baseTokenAmountChange,
                    quoteTokenAmountChange,
                    liquidityChange,
                    liquidityUiAmount: currentLiquidityUsd,
                    liquidityChangePercentage: param.threshold,
                    reason: `There isn't a significant change in this ${param.poolAddress} pool within the time period ${new Date(param.afterTimestamp * 1000).toLocaleString()} and ${new Date(param.beforeTimestamp * 1000).toLocaleString()} over ${param.threshold}%`
                }
            }
        }

        return {
            data: {
                fromTimestamp: param.afterTimestamp,
                toTimestamp: param.beforeTimestamp,
                baseTokenAmountChange,
                quoteTokenAmountChange,
                liquidityChange,
                liquidityUiAmount: currentLiquidityUsd,
                liquidityChangePercentage,
                reason: `There is a significant change in this ${param.poolAddress} pool within the time period ${new Date(param.afterTimestamp * 1000).toLocaleString()} and ${new Date(param.beforeTimestamp * 1000).toLocaleString()} over ${param.threshold}%`
            }
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const detectLiquidityPoolRiseChangeByTimeStamp = async (param: liquidityType.detectLiquidityPoolChangeByTimeStampParam): Promise<liquidityType.detectLiquidityPoolChangeByTimeStampResponse> => {
    try {
        // Add
        let responseAddData: liquidityType.liquidityPoolInfoByTimeStampData = {
            txHash: [],
            txType: "",
            blockUnixTime: 0,
            baseTokenAmount: 0,
            quoteTokenAmount: 0,
            finished: false
        };
        let paramAdd = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "add",
            beforeTimestamp: param.beforeTimestamp,
            afterTimestamp: param.afterTimestamp
        }

        const responseAdd = await getLiquidityPoolInfoByTimeStamp(paramAdd);

        if(responseAdd.error) {
            throw new Error(responseAdd.error);
        }

        if (responseAdd.data?.txHash) {
            responseAddData.txHash.push(...responseAdd.data.txHash);
        }
        responseAddData.txType = responseAdd.data?.txType || "";
        responseAddData.blockUnixTime = responseAdd.data?.blockUnixTime || 0;
        responseAddData.baseTokenAmount += responseAdd.data?.baseTokenAmount || 0;
        responseAddData.quoteTokenAmount += responseAdd.data?.quoteTokenAmount || 0;
        responseAddData.finished = responseAdd.data?.finished || false;
        
        paramAdd.beforeTimestamp = responseAddData.baseTokenAmount - 1;

        // Remove
        let responseRemoveData: liquidityType.liquidityPoolInfoByTimeStampData = {
            txHash: [],
            txType: "",
            blockUnixTime: 0,
            baseTokenAmount: 0,
            quoteTokenAmount: 0,
            finished: false
        };
        let paramRemove = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "remove",
            beforeTimestamp: param.beforeTimestamp,
            afterTimestamp: param.afterTimestamp
        }

        const responseRemove = await getLiquidityPoolInfoByTimeStamp(paramRemove);

        if(responseRemove.error) {
            throw new Error(responseRemove.error);
        }

        if (responseRemove.data?.txHash) {
            responseRemoveData.txHash.push(...responseRemove.data.txHash);
        }
        responseRemoveData.txType = responseRemove.data?.txType || "";
        responseRemoveData.blockUnixTime = responseRemove.data?.blockUnixTime || 0;
        responseRemoveData.baseTokenAmount += responseRemove.data?.baseTokenAmount || 0;
        responseRemoveData.quoteTokenAmount += responseRemove.data?.quoteTokenAmount || 0;
        responseRemoveData.finished = responseRemove.data?.finished || false;

        paramRemove.beforeTimestamp = responseRemoveData.baseTokenAmount - 1;

        const baseTokenAmountChange = responseAddData.baseTokenAmount - responseRemoveData.baseTokenAmount;
        const quoteTokenAmountChange = responseAddData.quoteTokenAmount - responseRemoveData.quoteTokenAmount;

        const liquidityChange = baseTokenAmountChange + quoteTokenAmountChange;

        if(liquidityChange < 0){
            return {
                data: {
                    fromTimestamp: param.afterTimestamp,
                    toTimestamp: param.beforeTimestamp,
                    baseTokenAmountChange,
                    quoteTokenAmountChange,
                    liquidityChange,
                    liquidityChangePercentage: param.threshold,
                    reason: `The ${param.poolAddress} pool has dropped not risen within the time period ${new Date(param.afterTimestamp * 1000).toLocaleString()} and ${new Date(param.beforeTimestamp * 1000).toLocaleString()}`
                }
            }
        }

        const paramForLiquidityInfo = {
            pairAddress: param.poolAddress
        }
        const responseLiquidityInfo = await getLiquidityPoolInfoByPairAddress(paramForLiquidityInfo);

        if(responseLiquidityInfo.error) {
            throw new Error(responseLiquidityInfo.error);
        }

        let currentLiquidityUsd: number = 0;
        if(responseLiquidityInfo.data?.liquidity?.usd) currentLiquidityUsd = responseLiquidityInfo.data?.liquidity.usd;

        const liquidityPoolCurrentInfoAddParam = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "add",
            beforeTimestamp: 0,
            afterTimestamp: param.beforeTimestamp
        }

        const currentInfoAddResponse = await getLiquidityPoolInfoByTimeStamp(liquidityPoolCurrentInfoAddParam);

        if(currentInfoAddResponse.error) {
            console.error(currentInfoAddResponse.error);
        } else {
            if(currentInfoAddResponse.data?.baseTokenAmount != null) {
                if (currentInfoAddResponse.data.baseTokenAmount !== 0) {
                    currentLiquidityUsd = currentLiquidityUsd - currentInfoAddResponse.data.baseTokenAmount;
                }
            }
        }

        const liquidityPoolCurrentInfoRemoveParam = {
            poolAddress: param.poolAddress,
            offset: param.offset,
            limit: param.limit,
            txType: "remove",
            beforeTimestamp: 0,
            afterTimestamp: param.beforeTimestamp
        }

        const currentInfoRemoveResponse = await getLiquidityPoolInfoByTimeStamp(liquidityPoolCurrentInfoRemoveParam);

        if(currentInfoRemoveResponse.error) {
            console.error(currentInfoRemoveResponse.error);
        } else{
            if(currentInfoAddResponse.data?.quoteTokenAmount != null) {
                if (currentInfoAddResponse.data.quoteTokenAmount !== 0) {
                    currentLiquidityUsd = currentLiquidityUsd + currentInfoAddResponse.data.quoteTokenAmount;
                }
            }
        }


        let liquidityChangePercentage:number = 0;
        if(currentLiquidityUsd) {
            liquidityChangePercentage = Math.abs((liquidityChange / (currentLiquidityUsd - liquidityChange)) * 100);
        }

        if(liquidityChangePercentage < param.threshold) {
            return {
                data: {
                    fromTimestamp: param.afterTimestamp,
                    toTimestamp: param.beforeTimestamp,
                    baseTokenAmountChange,
                    quoteTokenAmountChange,
                    liquidityChange,
                    liquidityUiAmount: currentLiquidityUsd,
                    liquidityChangePercentage: param.threshold,
                    reason: `There isn't a significant change in this ${param.poolAddress} pool within the time period ${param.afterTimestamp} and ${param.beforeTimestamp} over ${param.threshold}%`
                }
            }
        }

        return {
            data: {
                fromTimestamp: param.afterTimestamp,
                toTimestamp: param.beforeTimestamp,
                baseTokenAmountChange,
                quoteTokenAmountChange,
                liquidityChange,
                liquidityUiAmount: currentLiquidityUsd,
                liquidityChangePercentage,
                reason: `There is a significant change in this ${param.poolAddress} pool within the time period ${param.afterTimestamp} and ${param.beforeTimestamp} over ${param.threshold}%`
            }
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}
    