import express from "express";
const router = express();
import * as validate from "../../helpers/validates.js";
import * as courseFieldControllers from "../../controllers/courseFields/courseFields.js";
import * as auths from "../../middlewares/auth.js";

router.post(
  "/add/new",
  auths.admin("create"),
  validate.courseFieldValidate,
  courseFieldControllers.addCourseField
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.mongodbId,
  courseFieldControllers.deleteCourseField
);
router.post(
  "/getall",
  auths.admin("read"),
  courseFieldControllers.getAllCourseField
);
router.post(
  "/getbycourseId",
  auths.admin("read"),
  validate.courseId,
  courseFieldControllers.getByCourseId
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.mongodbId,
  courseFieldControllers.updateCourseField
);

/**
 * @description Api for students or user.
 */
router.post(
  "/getAllCourseField",
  auths.auth,
  courseFieldControllers.getAllCourseFieldUser
);

router.post("/search", auths.auth, courseFieldControllers.searchData);

export default router;
