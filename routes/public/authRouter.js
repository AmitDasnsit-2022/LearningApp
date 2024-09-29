import express from "express";
import * as authController from "../../controllers/auth/authController.js";
import * as validations from "../../helpers/validates.js";
import * as adminController from "../../controllers/auth/adminAuthController.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

/**
 * @author Admin
 */
router.post(
  "/login",
  validations.adminLoginValidate,
  adminController.adminLogin
);
router.post(
  "/register",
  validations.adminRegisterValidate,
  adminController.adminRegister
);

router.post(
  "/forgot/password",
  validations.password,
  auths.admin,
  adminController.forgotPassword
);

/**
 * @author Users Or Students
 */
router.post(
  "/send/otp",
  validations.validateLogin,
  authController.sentOtpController
);
router.post("/verify/otp", validations.validateLogin, authController.verifyOtp);


export default router;
