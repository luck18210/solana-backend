import { heliusConfig, tokenConfig, transactionConfig } from '@/config';

import { heliusAPIServer } from '@/service/axios';
import { transactionType } from '@/types';
import { getTokenDecimals, getTokenPrice, getTokenPriceByTimestamp } from './token';

export const getTransactions = async (param: transactionType.getTransactionsParam): Promise<transactionType.getTransactionsResponse> => {
    try {
        if(!param.wallet) {
            throw new Error("wallet address doesn't exist");
        }

        console.log(`/v0/addresses/${param.wallet}/transactions?api-key=${heliusConfig.HELIUS_API_KEY}&type=${param.type}`);

        const response = await heliusAPIServer.get(`/v0/addresses/${param.wallet}/transactions?api-key=${heliusConfig.HELIUS_API_KEY}&type=${param.type}`);

        if(!response.data || response.data.length == 0) {
            throw new Error(`No Transaction Found For Type : ${param.type}`);
        }

        return {
            data: response.data
        }

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const detectLoopWalletTransaction = async(param: transactionType.walletLoopTransactionType): Promise<transactionType.transferAnalysisResponse> => {
    try {
        const transactions = await getTransactions(param.walletAddress);

        if(transactions?.error){
            throw new Error(transactions?.error);
        }

        const offset = param.offset * 60 * 60;

        let transferAnalysisDatas: transactionType.transferAnalysisType[] = [];
        let index = 0;
        // Get one month ago timestamp (approx. 30 days)
        const oneMonthAgoTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

        if(transactions?.data){
            for(const transaction of transactions?.data){
                if(transaction.timestamp < oneMonthAgoTimestamp) break;

                // if (!transferAnalysisDatas[index]) {
                    transferAnalysisDatas[index] = {
                        amountInUsd: 0,
                        timestamp: 0,
                        signature: ""
                    };
                // }

                transferAnalysisDatas[index].timestamp = transaction.timestamp;
                transferAnalysisDatas[index].signature = transaction.signature;

                for (const nativeTransfer of transaction.nativeTransfers ?? []) {
                    if (
                        nativeTransfer.fromUserAccount === param.walletAddress.wallet ||
                        nativeTransfer.toUserAccount === param.walletAddress.wallet
                    ) {
                        const solPrice = await getTokenPrice(tokenConfig.solMintAddress);

                        if (!solPrice) throw new Error("Sol price is invalid");
                        const solUsd = nativeTransfer.amount * solPrice / transactionConfig.LAMPORT_PER_SOL;

                        if (solUsd > param.amountLimitPerTrx) {
                            transferAnalysisDatas[index].amountInUsd += solUsd;
                        }
                    }
                }
            
                for (const tokenTransfer of transaction.tokenTransfers ?? []) {
                    if (
                        tokenTransfer.fromUserAccount === param.walletAddress.wallet ||
                        tokenTransfer.toUserAccount === param.walletAddress.wallet
                    ) {
                        const tokenPrice = await getTokenPrice(tokenTransfer.mint);
                        const tokenDecimal = await getTokenDecimals(tokenTransfer.mint);
                        if (!tokenPrice) throw new Error("Token price is invalid");
                        if (!tokenDecimal) throw new Error("Token decimals is invalid");
                        const tokenUsd = tokenTransfer.tokenAmount * tokenPrice / Math.pow(10, tokenDecimal);
                        if (tokenUsd > param.amountLimitPerTrx) {
                            transferAnalysisDatas[index].amountInUsd += tokenUsd;
                        }
                    }
                }

                if(transferAnalysisDatas[index].amountInUsd === 0){
                    transferAnalysisDatas.pop();
                } else {
                    index ++;
                }
            }
        }

        if(transferAnalysisDatas.length < 1){
            return {
                data: {
                    detectBuySellType: [],
                    riskState: `<p>🟢 Safe: </br /> Trades are spread across different wallets—no signs of suspicious patterns.</p>`
                }
            }
        }

        const mergedData = Object.values(
            transferAnalysisDatas.reduce((acc, item) => {
                if (!acc[item.timestamp]) {
                    acc[item.timestamp] = { ...item };
                } else {
                    acc[item.timestamp].amountInUsd += item.amountInUsd;
                }
                return acc;
            }, {} as Record<number, { amountInUsd: number; timestamp: number; signature: string }>)
        );
        
        const detectBuySellDatas: transactionType.detectBuySellType[] = [];
        index = 0;


        let startTimestamp = mergedData[0].timestamp;
        let endTimestamp = startTimestamp + offset;
        let tempSignatures : string[] = [];

        if(mergedData.length == 1){
            if(mergedData[0].amountInUsd >= param.amountThresholds){
                detectBuySellDatas.push({
                    totalAmount: mergedData[0].amountInUsd,
                    signaturePattern: [mergedData[0].signature],
                    timePattern: `${startTimestamp} - ${endTimestamp}`
                })
            }
        } else{
            while(endTimestamp < mergedData[mergedData.length - 1].timestamp){
    
                let timestampFirst = mergedData[index].timestamp;
    
                let sumAmount = 0;
                let oldIndex = index;
                
                while(startTimestamp < endTimestamp){
                    sumAmount += mergedData[index].amountInUsd;
                    index ++;
                    startTimestamp = mergedData[index].timestamp;
                    tempSignatures.push(mergedData[index].signature)
                }
                if(sumAmount >= param.amountThresholds){
                    detectBuySellDatas.push({
                        totalAmount: sumAmount,
                        signaturePattern: [...tempSignatures],
                        timePattern: `${timestampFirst} - ${endTimestamp}`
                    })
                }
                
                index = oldIndex + 1;
    
                startTimestamp = mergedData[index].timestamp;
                endTimestamp = startTimestamp + offset;
    
            }
        }

        if(detectBuySellDatas.length == 0){
            return {
                data: {
                    detectBuySellType: [],
                    riskState: `<p>🟢 Safe: </br /> Trades are spread across different wallets—no signs of suspicious patterns.</p>`
                }
            }
        }

        return{
            data: {
                detectBuySellType: detectBuySellDatas,
                riskState: `<p>🔴 Not Safe: </br /> This wallet keeps trading with the same small group of wallets. Could be faking volume or creating false demand.</p>`
            }
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const detectRapidBuySell = async(param: transactionType.walletLoopTransactionType): Promise<transactionType.transferAnalysisResponse> => {
    try {
        const transactions = await getTransactions(param.walletAddress);

        if(transactions?.error){
            throw new Error(transactions?.error);
        }

        const offset = param.offset * 60 * 60;

        let swapAnalysisDatas: transactionType.transferAnalysisType[] = [];
        let index = 0;
        // Get one month ago timestamp (approx. 30 days)
        const oneMonthAgoTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

        if(transactions?.data){
            for(const transaction of transactions?.data){
                if(transaction.timestamp < oneMonthAgoTimestamp) break;

                // if (!swapAnalysisDatas[index]) {
                    swapAnalysisDatas[index] = {
                        amountInUsd: 0,
                        timestamp: 0,
                        signature: ""
                    };
                // }

                swapAnalysisDatas[index].timestamp = transaction.timestamp;
                swapAnalysisDatas[index].signature = transaction.signature;

            
                for (const tokenTransfer of transaction.tokenTransfers ?? []) {
                    const tokenPrice = await getTokenPrice(tokenTransfer.mint);
                    // const tokenDecimal = await getTokenDecimals(tokenTransfer.mint)
                    if (
                        tokenPrice !== 0
                    ) {
                        const tokenUsd = tokenTransfer.tokenAmount * tokenPrice;

                        if (tokenUsd > param.amountLimitPerTrx) {
                            swapAnalysisDatas[index].amountInUsd += tokenUsd;
                        }
                        break;
                    }
                }                

                if(swapAnalysisDatas[index].amountInUsd === 0){
                    swapAnalysisDatas.pop();
                } else {
                    index ++;
                }
            }
        }

        if(swapAnalysisDatas.length < 1){
            return {
                data: {
                    detectBuySellType: [],
                    riskState: `<p>🟢 Safe: </br /> Trades are spread across different wallets—no signs of suspicious patterns.</p>`
                }
            }
        }

        const mergedData = Object.values(
            swapAnalysisDatas.reduce((acc, item) => {
                if (!acc[item.timestamp]) {
                    acc[item.timestamp] = { ...item };
                } else {
                    acc[item.timestamp].amountInUsd += item.amountInUsd;
                }
                return acc;
            }, {} as Record<number, { amountInUsd: number; timestamp: number; signature: string }>)
        );
        
        const detectBuySellDatas: transactionType.detectBuySellType[] = [];
        index = 0;

        let startTimestamp = mergedData[0].timestamp;
        let endTimestamp = startTimestamp + offset;
        let tempSignatures : string[] = [];

        if(mergedData.length == 1){
            if(mergedData[0].amountInUsd >= param.amountThresholds){
                detectBuySellDatas.push({
                    totalAmount: mergedData[0].amountInUsd,
                    signaturePattern: [mergedData[0].signature],
                    timePattern: `${startTimestamp} - ${endTimestamp}`
                })
            }
        } else{
            do{
                let timestampFirst = mergedData[index].timestamp;
                let sumAmount = 0;
                let oldIndex = index;
                tempSignatures.splice(0, tempSignatures.length);
                
                while(startTimestamp < endTimestamp && index < mergedData.length - 1){
                    sumAmount += mergedData[index].amountInUsd;
                    index ++;
                    startTimestamp = mergedData[index].timestamp;
                    tempSignatures.push(mergedData[index].signature)
                }
                if(sumAmount >= param.amountThresholds){
                    detectBuySellDatas.push({
                        totalAmount: sumAmount,
                        signaturePattern: [...tempSignatures],
                        timePattern: `${new Date(timestampFirst * 1000).toLocaleString()} - ${new Date(endTimestamp * 1000).toLocaleString(
                            'en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            }
                        )}`
                    })
                }
                
                index = oldIndex + 1;
    
                startTimestamp = mergedData[index].timestamp;
                endTimestamp = startTimestamp + offset;
    
            } while(endTimestamp < mergedData[mergedData.length - 1].timestamp)
        }

        if(detectBuySellDatas.length == 0){
            return {
                data: {
                    detectBuySellType: [],
                    riskState: `<p>🟢 Safe: </br /> Trades are spread across different wallets—no signs of suspicious patterns.</p>`
                }
            }
        }
        return{
            data: {
                detectBuySellType: detectBuySellDatas,
                riskState: `<p>🔴 Not Safe: </br /> This wallet keeps trading with the same small group of wallets. Could be faking volume or creating false demand.</p>`
            }
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}

export const detectRapidBuySameToken = async(param: transactionType.walletLoopTransactionType): Promise<transactionType.BuySameTokenAnalysisResponse> => {
    try {
        const transactions = await getTransactions(param.walletAddress);

        if(transactions?.error){
            throw new Error(transactions?.error);
        }

        const offset = param.offset * 60;

        let buySameTokenAnalysisDatas: transactionType.buySameTokenAnalysisType[] = [];
        let index = 0;
        // Get one month ago timestamp (approx. 30 days)
        const oneMonthAgoTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

        if(transactions?.data){
            for(const transaction of transactions?.data){
                if(transaction.timestamp < oneMonthAgoTimestamp) break;

                // if (!buySameTokenAnalysisDatas[index]) {
                    buySameTokenAnalysisDatas[index] = {
                        mint: "",
                        amountInUsd: 0,
                        timestamp: 0,
                        signature: ""
                    };
                // }

                buySameTokenAnalysisDatas[index].timestamp = transaction.timestamp;
                buySameTokenAnalysisDatas[index].signature = transaction.signature;
                buySameTokenAnalysisDatas[index].mint = transaction.tokenTransfers ? transaction.tokenTransfers[0].mint : "";
            
                for (const tokenTransfer of transaction.tokenTransfers ?? []) {
                    const tokenPrice = await getTokenPrice(tokenTransfer.mint);
                    if (
                        tokenPrice !== 0
                    ) {
                        const tokenUsd = tokenTransfer.tokenAmount * tokenPrice;

                        if (tokenUsd > param.amountLimitPerTrx) {
                            buySameTokenAnalysisDatas[index].amountInUsd += tokenUsd;
                        }
                        break;
                    }
                }  

                if(buySameTokenAnalysisDatas[index].amountInUsd === 0){
                    buySameTokenAnalysisDatas.pop();
                } else {
                    index ++;
                }
            }
        }

        buySameTokenAnalysisDatas.sort((a, b) => a.timestamp - b.timestamp);

        if(buySameTokenAnalysisDatas.length < 1){
            return {
                data: {
                    detectBuySameTokenType: [],
                    riskState: `<p>🟢 Safe: </br /> Token purchase was made at a normal time, with no obvious coordination.</p>`
                }
            }
        }

        const detectBuySellDatas: transactionType.detectBuySameTokenType[] = [];
        index = 0;


        let startTimestamp = buySameTokenAnalysisDatas[0].timestamp;
        let endTimestamp = startTimestamp + offset;

        if(buySameTokenAnalysisDatas.length == 1){
            if(buySameTokenAnalysisDatas[0].amountInUsd >= param.amountThresholds){
                detectBuySellDatas.push({
                    mint: buySameTokenAnalysisDatas[0].mint,
                    totalAmount: buySameTokenAnalysisDatas[0].amountInUsd,
                    signaturePattern: [buySameTokenAnalysisDatas[0].signature],
                    timePattern: `${startTimestamp} - ${endTimestamp}`
                })
            }
        } else{
            // modify this part for today
            do{
    
                let timestampFirst = buySameTokenAnalysisDatas[index].timestamp;
                let oldIndex = index;

                let tempDatasInSearchNode : transactionType.buySameTokenAnalysisType[] = [];
                
                while(startTimestamp < endTimestamp && index < buySameTokenAnalysisDatas.length - 1){
                    tempDatasInSearchNode.push(buySameTokenAnalysisDatas[index]);
                    index ++;
                    startTimestamp = buySameTokenAnalysisDatas[index].timestamp;
                    // tempSignatures.push(buySameTokenAnalysisDatas[index].signature)
                }

                const groupedByMint: Record<string, transactionType.buySameTokenAnalysisType[]> = {};

                // Step 1: Group transactions by `mint`
                tempDatasInSearchNode.forEach((data) => {
                    if (!groupedByMint[data.mint]) {
                        groupedByMint[data.mint] = [];
                    }
                    groupedByMint[data.mint].push(data);
                });

                // Step 2: Iterate through each mint's transactions
                const results: { mint: string; totalAmount: number; signaturePattern: string[] }[] = [];

                for (const mint in groupedByMint) {
                    const transactions = groupedByMint[mint];
                
                    let count = 0;
                    let startTimestamp = transactions[count].timestamp;
                    let sumAmount = 0;
                    let tempSignatures: string[] = [];
                
                    while (count < transactions.length && startTimestamp < endTimestamp) {
                        sumAmount += transactions[count].amountInUsd;
                        tempSignatures.push(transactions[count].signature);
                        
                        count++; // Move to the next transaction
                
                        if (count < transactions.length) {
                            startTimestamp = transactions[count].timestamp; // Update timestamp only if index is valid
                        }
                    }
                
                    results.push({
                        mint,
                        totalAmount: sumAmount,
                        signaturePattern: tempSignatures,
                    });
                }

                // Assuming `results` contains the grouped data
                const selectedEntry = results.reduce((best, current) => {
                    if (
                        current.signaturePattern.length > best.signaturePattern.length || 
                        (current.signaturePattern.length === best.signaturePattern.length && current.totalAmount > best.totalAmount)
                    ) {
                        return current;
                    }
                    return best;
                }, results[0]);

                if(selectedEntry.signaturePattern.length >= 2 && selectedEntry.totalAmount >= param.amountThresholds){
                    detectBuySellDatas.push({
                        ...selectedEntry,
                        timePattern: `${new Date(timestampFirst * 1000).toLocaleString()} - ${new Date(endTimestamp * 1000).toLocaleString()}`
                    })
                } 

                index = oldIndex + 1;
                startTimestamp = buySameTokenAnalysisDatas[index].timestamp;
                endTimestamp = startTimestamp + offset;

            } while(endTimestamp < buySameTokenAnalysisDatas[buySameTokenAnalysisDatas.length - 1].timestamp)
        }

        if(detectBuySellDatas.length == 0){
            return {
                data: {
                    detectBuySameTokenType: [],
                    riskState: `<p>🟢 Safe: </br /> Token purchase was made at a normal time, with no obvious coordination.</p>`
                }
            }
        }
        return{
            data: {
                detectBuySameTokenType: detectBuySellDatas,
                riskState: `<p>🔴 Not Safe: </br /> This wallet bought the token at the exact same time as many others. Could be bot activity or a coordinated setup.</p>`
            }
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown Error"
        }
    }
}