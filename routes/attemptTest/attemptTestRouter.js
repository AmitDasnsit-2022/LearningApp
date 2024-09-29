import * as attemptTestController from "../../controllers/attamptTest/attemptTestController.js";
import express from "express";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";
const router = express();

router.post("/update", auths.admin("edit"), attemptTestController.update);
router.post("/getall", auths.admin("read"), attemptTestController.getall);
router.post("/getbyid", auths.admin("read"), attemptTestController.getbyId);
router.post(
  "/getbystudentid",
  auths.admin("read"),
  attemptTestController.getByStudentId
);
router.post(
  "/getbysubjectid",
  auths.admin("read"),
  attemptTestController.getBySubjectid
);

/**@description Practice Test*/
router.post(
  "/addone",
  auths.auth,
  validate.attemptTestValidate,
  attemptTestController.addnew
);
router.post(
  "/addinbulk",
  auths.auth,
  validate.attemptPracticeInBulkValidate,
  attemptTestController.addInBulk
);
router.post(
  "/getscore",
  auths.auth,
  validate.subjectId,
  attemptTestController.getStudentScore
);
router.post(
  "/getprevioustest",
  auths.auth,
  validate.previousTestValidate,
  attemptTestController.getLastAttemptTestOfStudent
);

/**
 * @description Create Real test data
 */
router.post(
  "/examaddinbulk",
  auths.auth,
  validate.attemptTestInBulkValidate,
  attemptTestController.addExam
);

/**
 * @description Get students data for leader board
 */
router.post(
  "/scorebyexam",
  auths.auth,
  validate.testlistIdAndCourseFieldId,
  attemptTestController.scoreBycourseField
);

router.post(
  "/attemptedexamlist",
  auths.auth,
  validate.mongodbId,
  attemptTestController.attemptedexamlist
);

router.post(
  "/overallrank",
  auths.auth,
  validate.mongodbId,
  attemptTestController.overAllRank
);

router.post(
  "/studentchart",
  auths.auth,
  validate.mongodbId,
  attemptTestController.studentDataChart
);

router.post(
  "/rankbytestlist",
  auths.auth,
  validate.testlistId,
  attemptTestController.rankbytestlistId
);

export default router;
