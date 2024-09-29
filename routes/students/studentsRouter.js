import express from "express";
import * as studentsController from "../../controllers/students/studentsController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";
var router = express.Router();

/**@access Admin */
router.post(
  "/get/all/students",
  auths.admin("read"),
  studentsController.allStudentsController
);

router.post(
  "/getall/students",
  auths.admin("read"),
  studentsController.getallStudents
);
router.post(
  "/studentInfo",
  auths.admin("read"),
  studentsController.getStudentInfo
);
/**@access Students apis */
router.post("/profile", auths.auth, studentsController.getStudentsById);
router.post("/update/profile", auths.auth, studentsController.updateProfile);
router.post(
  "/add/enroll/course",
  auths.auth,
  validate.enrolledValidation,
  studentsController.addEnrolledCourses
);
router.post(
  "/enrolledCourses",
  auths.auth,
  studentsController.getStudentEnrolledCourse
);
router.post(
  "/delete/enrolled/course",
  auths.auth,
  validate.enrolledValidation,
  studentsController.deleteEnrolledCourse
);

router.post(
  "/enrolled/coursefield",
  auths.auth,
  studentsController.enrolledCourseField
);

/**@description This is for website get enrolled course of student */
router.post(
  "/enrolled/course/website",
  auths.auth,
  studentsController.getEnrolledCourseforWebiste
);

router.post(
  "/account/delete",
  validate.validateLogin,
  auths.auth,
  studentsController.deleteAccount
);

export default router;
