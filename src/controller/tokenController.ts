import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { token } from '@/feature';
import { tokenType } from '@/types';
import { isValidSolanaAddress } from '@/utils/help';

export const getTokenInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.owner) {
        throw new Error("owner does not exist");
    }

    const param: tokenType.gettokenParam = {
      wallet: req.body.owner,
      page: 1,
      limit: 100
    }

    const result = await token.getTokenAccounts(param);

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

export const getTopHoldersInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
        throw new Error("Token Address does not exist");
    }

    if(!isValidSolanaAddress(req.body.mint)) {
      throw new Error("Invalid Token Address");
    }

    if(!req.body?.percentage) {
      throw new Error("Threshold Percentage does not exist");
    }

    const param: tokenType.getTopHolderParam = {
      mint: req.body.mint,
      totalMem: req.body.totalMem ?? 20,
      percentage: req.body.percentage
    }

    const result = await token.getTokenTopHolders(param);

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

export const detectSharpTokenPriceMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("Token Address does not exist");
    }

    if(!isValidSolanaAddress(req.body.mint)) {
      throw new Error("Invalid Token Address");
    }

    if(!req.body?.threshold) {
      throw new Error("Threshold Percentage does not exist");
    }

    if(req.body.from !== 0 && req.body.to !== 0) {
      if(req.body.from > req.body.to) {
        throw new Error("Start Time must be before End Time");
      }
    }

    const param: tokenType.detectSharpTokenPriceMovementParam = {
      threshold: req.body.threshold,
      period: req.body.period,
      mint: req.body.mint,
      address_type: req.body.address_type,
      type: req.body.type,
      from: req.body.from,
      to: req.body.to
    }

    const result = await token.detectSharpTokenPriceMovement(param);

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

export const getTokenHistoricalPrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("mint does not exist");
    }

    const oneMonthAgoTimestamp = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);

    const param: tokenType.getTokenHistoricalPriceParam = {
      mint: req.body.mint,
      address_type: req.body.address_type || "token",
      type: req.body.type || "15m",
      from: req.body.from || oneMonthAgoTimestamp,
      to: req.body.to || currentTimestamp
    }

    const result = await token.getTokenHistoricalPrice(param);

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

export const getTokenPriceByTimestamp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("mint does not exist");
    }

    if(!req.body?.timestamp) {
      throw new Error("timestamp does not exist");
    }

    const param: tokenType.getTokenPriceByTimestampParam = {
      mint: req.body.mint,
      timestamp: req.body.timestamp
    }

    const result = await token.getTokenPriceByTimestamp(param); 

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

export const getTokenPriceByUnixTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("mint does not exist");
    }

    if(!req.body?.timestamp) {
      throw new Error("timestamp does not exist");
    }

    const param: tokenType.getTokenPriceByTimestampParam = {
      mint: req.body.mint,
      timestamp: req.body.timestamp
    }

    const result = await token.getTokenPriceByUnixTime(param); 

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

export const tokenAnalyse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("wallet does not exist");
    }

    const result = await token.tokenAnalysis(req.body?.mint);

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

export const getTokenLargetAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("wallet does not exist");
    }

    if(!req.body?.totalMem) {
      throw new Error("Count does not exist");
    }

    const param: tokenType.getTokenLargetAccountsParam = {
      mint: req.body.mint,
      totalMem: req.body.totalMem
    }

    const result = await token.getTokenLargetAccounts(param);

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

export const getTokenTotalSupply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.body?.mint) {
      throw new Error("wallet does not exist");
    }

    const param: tokenType.getTokenTotalSupplyParam = {
      mint: req.body.mint,
    }

    const result = await token.getTokenTotalSupply(param);

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

export const getTokenOverviewData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("--------------getTokenOverviewData--------------");
    if(!req.body?.mint) {
      throw new Error("mint does not exist");
    }

    const param: tokenType.getTokenOverviewDataParam = {
      mint: req.body.mint
    }

    const result = await token.getTokenOverviewData(param);

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