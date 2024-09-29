import * as testlistController from "../../controllers/testList/testListController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
import express from "express";
const router = express();

/**@description This is for Admin dashboard */
router.post(
  "/addnew",
  auths.admin("create"),
  validate.tesListValidate,
  testlistController.addnew
);
router.post("/update", auths.admin("edit"), testlistController.updateData);
router.post("/getall", auths.admin("read"), testlistController.getall);
router.post("/getbyid", auths.admin("read"), testlistController.getbyid);
router.post(
  "/bysubjectId",
  auths.admin("read"),
  testlistController.getbysubjectid
);
router.post("/delete", auths.admin("delete"), testlistController.deleteData);

router.post("/videotest", auths.admin("read"), testlistController.allVideoTest);

router.post("/coursevideotest", auths.admin("read"), validate.mongodbId ,testlistController.courseVideoTest);

/**@description This for Mobile devices */
router.post(
  "/getbysubjectid",
  auths.auth,
  validate.subjectId,
  testlistController.getbysubjectid
);

router.post(
  "/examlist",
  auths.auth,
  validate.mongodbId,
  testlistController.examByCourseField
);

router.post(
  "/upcomingexam",
  auths.auth,
  validate.mongodbId,
  testlistController.upcomingExams
);

router.post(
  "/testanswerlist",
  auths.auth,
  validate.previousTestValidate,
  testlistController.testListAnswer
);
router.post(
  "/examanswerlist",
  auths.auth,
  validate.testlistId,
  testlistController.examAnswerList
);

router.post(
  "/completedexamlist",
  auths.auth,
  validate.mongodbId,
  testlistController.completedtestBycourse
);

export default router;
