import * as qnalistController from "../../controllers/qnalists/qnalistsController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
import express from "express";
const router = express();

router.post(
  "/create",
  validate.qnalist,
  auths.admin("create"),
  qnalistController.createQnalist
);

/**
 * @description This is for student
 */
router.post(
  "/getbyvideoid",
  validate.videoId,
  auths.admin("read"),
  qnalistController.getByVideoId
);

export default router;
