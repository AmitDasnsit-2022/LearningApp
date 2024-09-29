import express from "express";
import * as planDurationController from "../../controllers/planDuration/planDuration.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

router.post(
  "/add",
  validate.planDuration,
  auths.admin("create"),
  planDurationController.addPlanDuration
);

router.post(
  "/getall",
  auths.admin("read"),
  planDurationController.getAllDuration
);

// Student
router.post("/getallDuration", auths.auth, planDurationController.getAllForStudent);

export default router;
