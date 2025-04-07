import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { transaction } from '@/feature';
import { transactionType } from '@/types';

export const getAllTrasactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.wallet || typeof req.body.wallet !== "string") {
      throw new Error("wallet does not exist");
    }

    const param: transactionType.getTransactionsParam = {
      wallet: req.body.wallet,
      type: req.body.type || "TRANSFER"
    }

    const result = await transaction.getTransactions(param);

    if(result.error) {
      throw new Error(result.error);
    }

    res.status(200).json({
      data: result.data,
      status: 200
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
          error: error.message, // Send the error message
      });
    } else {
      res.status(500).json({
          error: 'An unknown error occurred', // Handle non-Error types
      });
    }
  }
}

export const detectLoopWalletTransaction = async (req: Request, res: Response, next: NextFunction) => {

  try {
    if (!req.body.wallet) {
        throw new Error("wallet does not exist");
    }

    if(!req.body.offset){
      throw new Error("offset doesn't exist")
    }

    if(!req.body.amountThresholds){
      throw new Error("amountThresholds doesn't exist")
    }

    if(req.body.type !== "TRANSFER"){
      throw new Error("Invalid Type, Type must be 'TRANSFER' on this API")
    }

    const param: transactionType.walletLoopTransactionType = {
      walletAddress: {
        wallet: req.body.wallet,
        type: req.body.type,
      },
      offset: Number(req.body.offset),
      amountThresholds: Number(req.body.amountThresholds),
      amountLimitPerTrx: Number(req.body.amountLimitPerTrx),
    }

    const result = await transaction.detectLoopWalletTransaction(param);

    if(result.error) {
      throw new Error(result.error);
    }

    res.status(200).json({
      data: result.data,
      status: 200
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
          error: error.message, // Send the error message
      });
    } else {
      res.status(500).json({
          error: 'An unknown error occurred', // Handle non-Error types
      });
    }
  }
}


export const detectRapidBuySell = async (req: Request, res: Response, next: NextFunction) => {

  try {
    if (!req.body.wallet) {
        throw new Error("Wallet Address does not exist");
    }

    if(!req.body.offset){
      throw new Error("Threshold Time doesn't exist")
    }

    if(!req.body.amountThresholds){
      throw new Error("Threshold Amount doesn't exist")
    }

    if(req.body.type !== "SWAP"){
      throw new Error("Invalid Type, Type must be 'SWAP' on this API")
    }

    const param: transactionType.walletLoopTransactionType = {
      walletAddress: {
        wallet: req.body.wallet,
        type: req.body.type,
      },
      offset: Number(req.body.offset),
      amountThresholds: Number(req.body.amountThresholds),
      amountLimitPerTrx: Number(req.body.amountLimitPerTrx),
    }

    const result = await transaction.detectRapidBuySell(param);

    if(result.error) {
      throw new Error(result.error);
    }

    res.status(200).json({
      data: result.data,
      status: 200
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
          error: error.message, // Send the error message
      });
    } else {
      res.status(500).json({
          error: 'An unknown error occurred', // Handle non-Error types
      });
    }
  }
}

export const detectRapidBuySameToken = async (req: Request, res: Response, next: NextFunction) => {

  try {
    if (!req.body.wallet) {
        throw new Error("Wallet Address does not exist");
    }

    if(!req.body.offset){
      throw new Error("Threshold Time doesn't exist")
    }

    if(!req.body.amountThresholds){
      throw new Error("Threshold Amount doesn't exist")
    }

    if(req.body.type !== "SWAP"){
      throw new Error("Invalid Type, Type must be 'SWAP' on this API")
    }

    const param: transactionType.walletLoopTransactionType = {
      walletAddress: {
        wallet: req.body.wallet,
        type: req.body.type,
      },
      offset: Number(req.body.offset),
      amountThresholds: Number(req.body.amountThresholds),
      amountLimitPerTrx: Number(req.body.amountLimitPerTrx),
    }

    const result = await transaction.detectRapidBuySameToken(param);

    if(result.error) {
      throw new Error(result.error);
    }

    res.status(200).json({
      data: result.data,
      status: 200
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
          error: error.message, // Send the error message
      });
    } else {
      res.status(500).json({
          error: 'An unknown error occurred', // Handle non-Error types
      });
    }
  }
}