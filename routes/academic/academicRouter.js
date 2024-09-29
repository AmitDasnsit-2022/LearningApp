import express from "express";
const router = express();
import * as validate from "../../helpers/validates.js";
import * as academicController from "../../controllers/academic/academicController.js";
import * as auths from "../../middlewares/auth.js";

router.post(
  "/add/new",
  auths.admin("create"),
  validate.academicValidate,
  academicController.addAcademic
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.academicUPdateValidate,
  academicController.updateAcademic
);
router.post("/getall", auths.admin("read"), academicController.getall);
router.post(
  "/delete",
  validate.academicUPdateValidate,
  auths.admin("delete"),
  academicController.deleteAcademic
);

export default router;
