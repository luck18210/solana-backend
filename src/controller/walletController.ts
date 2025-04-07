import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { wallet } from '@/feature';
import { checkType } from '@/types';
import { isValidSolanaAddress } from '@/utils/help';

export const checkWalletStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.wallet){
        throw new Error("current wallet does not exist");
    }

    if(!isValidSolanaAddress(req.body.wallet)) {
      throw new Error("Invalid Wallet Address");
    }

    if(!req.body?.percentage){
        throw new Error("current percentage does not exist");
    }

    if(!req.body?.thresholds){
        throw new Error("thresholds must exist")
    }

    const param: checkType.checkWalletStatusParam = {
      percentage: req.body.percentage,
      wallet: req.body.wallet,
      thresholds: req.body.thresholds
    }

    const result = await wallet.checkWalletStatus(param);

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

export const checkNewWalletStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.wallet){
        throw new Error("current wallet does not exist");
    }

    if(!isValidSolanaAddress(req.body.wallet)) {
      throw new Error("Invalid Wallet Address");
    }

    if(!req.body?.percentage){
        throw new Error("current percentage does not exist");
    }

    if(!req.body?.thresholdsTimestampe){
        throw new Error("thresholdsTimestampe must exist")
    }

    const param: checkType.checkNewWalletStatusParam = {
      percentage: req.body.percentage,
      wallet: req.body.wallet,
      thresholdsTimestampe: req.body.thresholdsTimestampe
    }

    const result = await wallet.checkNewWalletStatus(param);

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

export const checkWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.wallet){
        throw new Error("current wallet does not exist");
    }

    if(!isValidSolanaAddress(req.body.wallet)) {
      throw new Error("Invalid Wallet Address");
    }

    if(!req.body?.percentage){
        throw new Error("current percentage does not exist");
    }   

    if(!req.body?.thresholds){
        throw new Error("thresholds must exist")
    }

    if(!req.body?.thresholdsTimestampe){
        throw new Error("thresholdsTimestampe must exist")
    }

    const param: checkType.checkWalletParam = {
      percentage: req.body.percentage,
      wallet: req.body.wallet,
      thresholds: req.body.thresholds,
      thresholdsTimestampe: req.body.thresholdsTimestampe
    } 

    const result = await wallet.checkWallet(param);

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
