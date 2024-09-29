import express from "express";
const router = express();
import * as planController from "../../controllers/plans/plansController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";

router.post(
  "/add",
  validate.planValidate,
  auths.admin("create"),
  planController.addPlan
);

router.post(
  "/update",
  validate.planId,
  auths.admin("edit"),
  planController.updatePlan
);

router.post("/getall", auths.admin("read"), planController.getAll);

router.post(
  "/delete",
  validate.planId,
  auths.admin("delete"),
  planController.deletePlan
);

router.post(
  "/getone",
  validate.planId,
  auths.admin("read"),
  planController.getOne
);

// Student
router.post(
  "/getByCourseFieldId",
  validate.mongodbId,
  auths.auth,
  planController.getBycourseFieldId
);

export default router;
