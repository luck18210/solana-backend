import {
    baseConfig,
    birdeyeConfig,
    heliusConfig,
    tokenConfig
} from '@/config';
import { heliusServer, dexScreenerAPIServer, birdeyeAPIServer } from '@/service/axios';
import { tokenType } from '@/types';

//Price
export const getTokenHistoricalPrice = async (param: tokenType.getTokenHistoricalPriceParam): Promise<tokenType.getTokenHistoricalPriceResponse> => {
    try {
        const response = await birdeyeAPIServer.get(`/defi/history_price`, {
            params: {
                address: param.mint,
                address_type: param.address_type,
                type: param.type,
                time_from: param.from,
                time_to: param.to
            },
            headers: {
                'X-API-KEY': birdeyeConfig.BIRDEYE_API_KEY,
                'accept': 'application/json',
                'x-chain': 'solana'
            }
        });

        if(!response.data){
            throw new Error("Something went wrong");
        }

        let prices: tokenType.getTokenHistoricalPriceData[] = [];

        response.data.data.items.forEach((item: {unixTime: number, value: number}) => {
            prices.push({
                price: item.value,
                timestamp: item.unixTime
            });
        });

        return {
            data: prices
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }       
    }
}

export const detectSharpTokenPriceMovement = async (param: tokenType.detectSharpTokenPriceMovementParam): Promise<tokenType.detectSharpTokenPriceMovementResponse> => {
    try {
        const oneMonthAgoTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
        const currentTimestamp = Math.floor(new Date().getTime() / 1000);

        const info = {
            mint: param.mint,
            address_type: param.address_type || "token",
            type: param.type || "3m",
            from: param.from || oneMonthAgoTimestamp,
            to: param.to || currentTimestamp
        }

        const response = await getTokenHistoricalPrice(info);

        if(response.error){
            throw new Error(response.error);
        }

        const data = response.data as tokenType.getTokenHistoricalPriceData[];

        const priceMovementData: tokenType.detectSharpTokenPriceMovementData[] = [];
        const period = param.period * 60 * 60 || 3600;
        
        for(let i = 0; i < data.length; i++){
            for(let j = i + 1; j < data.length && data[j].timestamp - data[i].timestamp <= period; j++){
                const priceMovementVariety = Math.abs(data[j].price - data[i].price) * 100 / data[i].price;
                if(priceMovementVariety >= param.threshold){
                    priceMovementData.push({
                        variety: priceMovementVariety,
                        priceVariety: [data[i].price, data[j].price],
                        timestampPeriod: [data[i].timestamp, data[i].timestamp + period]
                    });
                }
            }
        }

        let riskState:string = "";
        if (priceMovementData.some(movement => movement.variety >= 15)) {
            riskState = `<p>🔴 Not Safe <br /> ⚠️ Unusual activity detected—sudden price spikes or drops that don't match typical market behavior. Possible manipulation.</p>`;
        } else {
            riskState = `<p>🟢 Safe <br /> Token supply is well-distributed—no major concentration among top wallets</p>`;
        }

        const detectSharpTokenPriceMovementData: tokenType.detectSharpTokenPriceMovementDataType = {
            detectSharpTokenPriceMovementData: priceMovementData,
            riskState: riskState
        }

        return {
            data: detectSharpTokenPriceMovementData
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}   

export const getTokenPriceByUnixTime = async (param: tokenType.getTokenPriceByUnixTimeParam): Promise<tokenType.getTokenPriceByUnixTimeResponse> => {
    try {
        const response = await birdeyeAPIServer.get(`/defi/historical_price_unix`, {
            params: {
                address: param.mint,
                unixtime: param.timestamp
            },
            headers: {
                'X-API-KEY': birdeyeConfig.BIRDEYE_API_KEY,
                'accept': 'application/json',
                'x-chain': 'solana'
            }
        });

        if(!response.data){
            throw new Error("Something went wrong");
        }

        return {
            data: response.data.data.value
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const getTokenPriceByTimestamp = async (param: tokenType.getTokenPriceByTimestampParam): Promise<tokenType.getTokenPriceByTimestampResponse> => {
    try {
        const paramForHistoryPrice = {
            mint: param.mint,
            address_type: "token",
            type: "15m",
            from: param.timestamp,
            to: param.timestamp + 1000
        }

        const response = await getTokenHistoricalPrice(paramForHistoryPrice);

        if(response.error){
            throw new Error(response.error);
        }

        if (!response.data) {
            throw new Error("No price data available");
        }

        return {
            data: response.data[0].price
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const getTokenPrice = async (tokenMint: string): Promise<number> => {
    try {
        const res = await fetch(`${tokenConfig.raydiumApiUrl}/mint/price?mints=${tokenMint}`);
        const data = await res.json();
        return data.data[tokenMint];
    } catch (error) {
        console.error(error);
    }
    return 0;
}

//Token Info
export const getTokenAccounts = async (param: tokenType.gettokenParam): Promise<tokenType.getTokenAccountsResponse> => {
    try {
        const response = await heliusServer.post(`/?api-key=${heliusConfig.HELIUS_API_KEY}`, {
            jsonrpc: "2.0",
            method: "getTokenAccounts",
            id: "helius-test",
            params: {
                page: param.page,
                limit: param.limit,
                owner: param.wallet,
                displayOptions: {
                    showZeroBalance: false,
                },
            },
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        });
        
        if(!response?.data?.result?.token_accounts) {
            throw new Error("Error: getting token accounts from Helius");
        }

        const data = response.data.result.token_accounts as tokenType.tokenInfo[];

        return {
            data: data
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const getTokenTopHolders = async (param: tokenType.getTopHolderParam): Promise<tokenType.getTokenTopHoldersResponse> => {
    try {
        const tokenLargestAccountsDatas = await getTokenLargetAccounts({
            mint: param.mint,
            totalMem: param.totalMem
        });

        if(tokenLargestAccountsDatas.error){
            throw new Error(tokenLargestAccountsDatas.error);
        }

        const supplyResponse = await getTokenTotalSupply({
            mint: param.mint
        })

        if(supplyResponse.error){
            throw new Error(supplyResponse.error);
        }

        const totalSupply: number = supplyResponse.data?.uiAmount || 0;

        const amountThresholds: number = totalSupply * param.percentage / 100;
        let tokenTopHolders: tokenType.topHolderInfo[] = [];

        if(tokenLargestAccountsDatas.data){
            tokenLargestAccountsDatas.data.forEach(tokenLargestAccountsData => {
                if(tokenLargestAccountsData.uiAmount >= amountThresholds){
                    const percentage = tokenLargestAccountsData.uiAmount / totalSupply * 100;
                    tokenTopHolders.push({...tokenLargestAccountsData, percentage});
                }
            });
        }
        
        let riskState:string = "";
        if (tokenTopHolders.some(holder => holder.percentage >= 15)) {           
            const walletsOver15 = tokenTopHolders.filter(holder => holder.percentage >= 15);
            const totalPercentage = walletsOver15.reduce((sum, holder) => sum + holder.percentage, 0);

            riskState = `<p>🔴 Not Safe <br /> ⚠️ Token is highly concentrated. The top ${walletsOver15.length} wallet(s) control over ${totalPercentage.toFixed(2)}% of the supply, increasing the risk of a sudden dump.</p>`;
        } else {
            riskState = `<p>🟢 Safe <br /> Token supply is well-distributed—no major concentration among top wallets</p>`;
        }

        const tokenTopHolderInfo: tokenType.tokenTopHolderInfo = {
            topHolderInfo: tokenTopHolders,
            riskState: riskState
        }

        return {
            data: tokenTopHolderInfo
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const tokenAnalysis = async (tokenAddress: string): Promise<tokenType.getTokenInformsResponse> => {
    try {
        const tokenResponse = await dexScreenerAPIServer.get(`/latest/dex/search/?q=${tokenAddress}`);

        return {
            data: tokenResponse.data
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
};

export const getTokenDecimals = async (tokenMint: string): Promise<number> => {
    try {
        const res = await fetch(`${tokenConfig.raydiumApiUrl}/mint/ids?mints=${tokenMint}`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            return data.data[0].decimals; // ✅ Correctly extracting decimals
        }
    } catch (error) {
        // console.error(`Error fetching token decimals for ${tokenMint}:`, error);
    }
    return 0; // Return 0 if failed
};

export const getTokenLargetAccounts = async (param: tokenType.getTokenLargetAccountsParam) : Promise<tokenType.getTokenLargetAccountResponse> => {
    try {
        const holdersResponse = await heliusServer.post(`/?api-key=${heliusConfig.HELIUS_API_KEY}`, {
            jsonrpc: "2.0",
            method: "getTokenLargestAccounts",
            id: 1,
            params: [
                param.mint
            ]
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if(holdersResponse.data?.error){
            throw new Error(holdersResponse.data?.error.message)
        }

        const tokenHolders: tokenType.tokenLargetAccountData[] = holdersResponse.data?.result?.value.slice(0, param.totalMem);
        
        return {
            data: tokenHolders,
        }
        
    } catch (error) {
        return{
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const getTokenTotalSupply = async (param: tokenType.getTokenTotalSupplyParam): Promise<tokenType.getTokenTotalSupplyResponse> => {
    try {
        const tokenSupply = await heliusServer.post(`/?api-key=${heliusConfig.HELIUS_API_KEY}`, {
            jsonrpc: "2.0",
            method: "getTokenSupply",
            id: "helius-test",
            params: [param.mint],
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        });
    
        if(!tokenSupply.data?.result?.value){
            throw new Error(`Total supply cant be found with for ${param.mint}`)
        }
    
        return{
            data: tokenSupply?.data?.result?.value
        }
    } catch (error) {
        return{
            error: error instanceof Error ? error.message : "Unkown Error"
        }        
    }
}

export const getTokenOverviewData = async (param: tokenType.getTokenOverviewDataParam): Promise<tokenType.getTokenOverviewDataResponse> => {
    try {
        const response = await birdeyeAPIServer.get(`/defi/token_overview?address=${param.mint}`,
            {
                headers: {
                    'X-API-KEY': birdeyeConfig.BIRDEYE_API_KEY,
                    'accept': 'application/json',
                    'x-chain': 'solana'
                }
            }
        );

        if(!response.data){
            throw new Error("Something went wrong");
        }

        // Fetch metadata from Grass.io
        let grassMetadata;
        try {
            const grassResponse = await fetch('https://static.getgrass.io/grass/metadata.json');
            if (!grassResponse.ok) {
                throw new Error('Failed to fetch Grass metadata');
            }
            grassMetadata = await grassResponse.json();
        } catch (grassError) {
            console.warn('Failed to fetch Grass metadata:', grassError);
            grassMetadata = null;
        }

        const tokenOverviewData: tokenType.getTokenOverviewData = {
            mint: response.data.data.address,
            decimals: response.data.data.decimals,
            symbol: response.data.data.symbol,
            name: response.data.data.name,
            logoURL: grassMetadata?.image,
            liquidity: response.data.data.liquidity,
            totalSupply: response.data.data.totalSupply,
            price: response.data.data.price,
            fdv: response.data.data.fdv,
            marketCap: response.data.data.marketCap,
            holders: response.data.data.holders,
            price_change_30m: response.data.data.history30mPrice,
            price_change_1h: response.data.data.history1hPrice,
            price_change_2h: response.data.data.history2hPrice,
            price_change_4h: response.data.data.history4hPrice,
            price_change_6h: response.data.data.history6hPrice,
            price_change_8h: response.data.data.history8hPrice,
            price_change_12h: response.data.data.history12hPrice,
            price_change_24h: response.data.data.history24hPrice,
        }

        return {
            data: tokenOverviewData
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}