import express from "express";
import * as enrollTeacher from "../../controllers/teachers/enrolledTeacherController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

router.post(
  "/addnew",
  auths.admin("create"),
  validate.enrollTeacher,
  enrollTeacher.addNew
);
router.post(
  "/getall",
  auths.admin("read"),
  enrollTeacher.getAllEnrolledTeachers
);
router.post(
  "/getbyid",
  auths.admin("read"),
  validate.enrollId,
  enrollTeacher.getEnrolledTeacherById
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.enrollId,
  enrollTeacher.updateEnrolledTeacherById
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.enrollId,
  enrollTeacher.deleteEnrolledTeacherById
);
router.post(
  "/getbysubjectId",
  auths.admin("read"),
  validate.subjectId,
  enrollTeacher.getEnrolledTeachersBySubjectId
);
router.post(
  "/getbyteacherId",
  auths.admin("read"),
  validate.enrollTeacherId,
  enrollTeacher.getByTeacherId
);
router.post(
  "/getbycoursefield",
  auths.admin("read"),
  validate.mongodbId,
  enrollTeacher.getByCourseField
);
router.post(
  "/getcoursefieldbyteacher",
  auths.admin("read"),
  validate.enrollTeacherId,
  enrollTeacher.getCoursefieldByTeacher
);
router.post(
  "/coursebyteacher",
  auths.admin("read"),
  validate.enrollTeacherId,
  enrollTeacher.courseByTeacherId
);

export default router;
