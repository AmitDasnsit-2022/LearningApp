import express from "express";
import * as subscriptionController from "../../controllers/subscription/subscriptionController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";
const router = express();

router.post(
  "/add",
  auths.auth,
  validate.subscriptionValidate,
  subscriptionController.addSubscription
);

router.post(
  "/upgrade/plan",
  auths.auth,
  validate.subscriptionValidate,
  subscriptionController.upGradePlan
);

router.post(
  "/totalrevenue",
  auths.admin('read'),
  validate.mongodbId,
  subscriptionController.totalRevenueByCourse
);

export default router;
