import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { liquidity } from '@/feature';
import { liquidityType } from '@/types';
import { isValidSolanaAddress } from '@/utils/help';

export const checkCurrentLiquidity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("--------------------------------");
    if(!req.body?.mint) {
        throw new Error("Token address does not exist");
    }

    if(!isValidSolanaAddress(req.body.mint)){
      throw new Error("Token address is not a valid solana address");
    }

    const param: liquidityType.checkCurrentLiquidityParam = {
      mint: req.body.mint,
      threshold: req.body.threshold
    }

    const result = await liquidity.checkCurrentLiquidity(param);

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

export const liquidityPoolInfoByToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
        throw new Error("mint does not exist");
    }

    const param: liquidityType.liquidityPoolInfoByTokenParam = {
      mint: req.body.mint
    }

    const result = await liquidity.getLiquidityPoolInfoByToken(param);

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

export const getLiquidityPoolInfoByPairAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.pairAddress) {
        throw new Error("pairAddress does not exist");
    }

    const param: liquidityType.liquidityPoolInfoByPairAddressParam = {
      pairAddress: req.body.pairAddress
    }

    const result = await liquidity.getLiquidityPoolInfoByPairAddress(param);

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

export const getLiquidityPoolInfoByTimeStamp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.poolAddress) {
        throw new Error("poolAddress does not exist");
    }

    // if(!req.body?.beforeTimestamp) {
    //     throw new Error("beforeTimestamp does not exist");
    // }

    if(!req.body?.afterTimestamp) {
        throw new Error("afterTimestamp does not exist");
    }

    const param: liquidityType.liquidityPoolInfoByTimeStampParam = {
      poolAddress: req.body.poolAddress,
      offset: req.body.offset || 0,
      limit: req.body.limit || 50,
      txType: req.body.txType || 'add',
      beforeTimestamp: req.body.beforeTimestamp || 0,
      afterTimestamp:req.body.afterTimestamp,
    }

    const result = await liquidity.getLiquidityPoolInfoByTimeStamp(param);

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

export const detectLiquidityPoolChangeByTimeStamp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.poolAddress) {
        throw new Error("Pool Address does not exist");
    }

    if(!req.body?.threshold) {
        throw new Error("Threshold percentage does not exist");
    }

    if(!req.body?.beforeTimestamp) {
        throw new Error("Start Time does not exist");
    }

    if(!req.body?.afterTimestamp) {
        throw new Error("End Time does not exist");
    }

    const param: liquidityType.detectLiquidityPoolChangeByTimeStampParam = {
      poolAddress: req.body.poolAddress,
      offset: req.body.offset || 0,
      limit: req.body.limit || 50,
      beforeTimestamp: req.body.beforeTimestamp,
      afterTimestamp:req.body.afterTimestamp,
      threshold: req.body.threshold
    }

    const result = await liquidity.detectLiquidityPoolChangeByTimeStamp(param);

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

export const detectLiquidityPoolRiseChangeByTimeStamp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.poolAddress) {
        throw new Error("Pool Address does not exist");
    }

    if(!req.body?.threshold) {
        throw new Error("Threshold percentage does not exist");
    }

    if(!req.body?.beforeTimestamp) {
        throw new Error("Start Time does not exist");
    }

    if(!req.body?.afterTimestamp) {
        throw new Error("End Time does not exist");
    }


    const param: liquidityType.detectLiquidityPoolChangeByTimeStampParam = {
      poolAddress: req.body.poolAddress,
      offset: req.body.offset || 0,
      limit: req.body.limit || 50,
      beforeTimestamp: req.body.beforeTimestamp,
      afterTimestamp:req.body.afterTimestamp,
      threshold: req.body.threshold
    }

    const result = await liquidity.detectLiquidityPoolRiseChangeByTimeStamp(param);

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