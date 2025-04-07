import {
  NextFunction,
  Request,
  Response,
} from 'express';

import { user } from '@/feature';
import { userType } from '@/types';
import { isValidSolanaAddress } from '@/utils/help';

export const checkWalletOrTokenAddress = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------checkWalletOrTokenAddress--------------");
  try {
    if(!req.body?.address) {
        throw new Error("Address does not exist");
    }

    if(!isValidSolanaAddress(req.body.address)){
      throw new Error("Address is not a valid solana address");
    }

    const param: userType.checkWalletOrTokenAddressParam = {
      address: req.body.address,
    }

    const result = await user.checkWalletOrTokenAddress(param);

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

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------createUser--------------");
  try {
    if(req.body.emailAddr === "") throw new Error("Email address is required");

    const param: userType.createUserParam = {
      userName: req.body.userName || "",
      emailAddr: req.body.emailAddr,
      password: req.body.password || "",
    }

    const result = await user.createUser(param);  

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

export const createUserJwt = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------createUserJwt--------------");
  try {
    const param: userType.createUserParam = {
      userName: req.body.userName || "",
      emailAddr: req.body.emailAddr,
      password: req.body.password,
    }

    const result = await user.createUserJwt(param);

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

export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------getUserInfo--------------");
  try {
    if(req.body.emailAddr === "") throw new Error("Email address is required");

    const param: userType.getUserInfoParam = {
      email: req.body.email,
    } 

    const result = await user.getUserInfo(param);

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

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------updateUser--------------");
  try {
    const param: userType.updateUserParam = {
      userName: req.body.userName,
      emailAddr: req.body.emailAddr,
      score: req.body.score,
    } 

    const result = await user.updateUser(param);

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

export const updateUserEmail = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------updateUserEmail--------------");
  try {
    const param: userType.updateUserEmailParam = {
      email: req.body.email,
      newEmail: req.body.newEmail,
      password: req.body.password,
    }

    const result = await user.updateUserEmail(param);

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

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------updatePassword--------------");
  try {
    const param: userType.updatePasswordParam = {
      email: req.body.email,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    }

    const result = await user.updatePassword(param);

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

export const createPwdForGoogle = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------createPwdForGoogle--------------");
  try {
    const param: userType.createPwdForGoogleParam = {
      email: req.body.email,
      password: req.body.password,
    }

    const result = await user.createPwdForGoogle(param);

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

export const createUserJwtForGoogle = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------createUserJwtForGoogle--------------");
  try {
    if(req.body.email === "") throw new Error("Email address is required");

    const param: userType.createUserJwtForGoogleParam = {
      email: req.body.email,
      userName: req.body.userName || "",
    }

    const result = await user.createUserJwtForGoogle(param);

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

export const createUserByInvitation = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------createUserByInvitation--------------");
  try {
    const param: userType.updateUserByInvitationParam = {
      email: req.body.email,
      password: req.body.password,  
      userName: req.body.userName,
      userId: req.body.userId,
    }

    const result = await user.updateUserByInvitation(param);

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

export const updateUserByGuild = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------updateUserByGuild--------------");
  try {
    const param: userType.updateUserByGuildParam = {
      email: req.body.email,
    }

    const result = await user.updateUserByGuild(param);

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
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log("--------------deleteUser--------------");
  try {
    const param: userType.deleteUserParam = {
      email: req.body.email,
    }

    const result = await user.deleteUser(param);

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