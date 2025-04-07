import express from 'express';

import { userController } from '../controller';

const router = express.Router();

router.post("/checkWalletOrTokenAddress", userController.checkWalletOrTokenAddress);
router.post("/createUser", userController.createUser);
router.post("/getUserInfo", userController.getUserInfo);
router.post("/updateUser", userController.updateUser);
router.post("/createUserJwt", userController.createUserJwt);
router.post("/updateUserEmail", userController.updateUserEmail);
router.post("/updatePassword", userController.updatePassword);
router.post("/createPwdForGoogle", userController.createPwdForGoogle);
router.post("/createUserJwtForGoogle", userController.createUserJwtForGoogle);
router.post("/createUserByInvitation", userController.createUserByInvitation);
router.post("/updateUserByGuild", userController.updateUserByGuild);
router.post("/deleteUser", userController.deleteUser);

export default router;