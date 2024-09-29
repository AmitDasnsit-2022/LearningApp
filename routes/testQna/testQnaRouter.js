import * as testQnaController from "../../controllers/testQna/testQnaController.js";
import express from "express";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

router.post(
  "/addnew",
  auths.admin("create"),
  validate.tesQnaInBulkValidate,
  testQnaController.addNew
);
router.post(
  "/byplaylistid",
  auths.admin("read"),
  validate.playlistId,
  testQnaController.getbyplaylistId
);
router.post(
  "/addinbulk",
  auths.admin("create"),
  validate.tesQnaInBulkValidate,
  testQnaController.addInBulk
);
router.post("/getall", auths.admin("read"), testQnaController.getall);
router.post(
  "/getbyid",
  auths.admin("read"),
  validate.testQnaId,
  testQnaController.getbyid
);
router.post(
  "/getbysubjectid",
  auths.admin("read"),
  validate.subjectId,
  testQnaController.getbysubjectid
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.testQnaId,
  testQnaController.update
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.testQnaId,
  testQnaController.qnadelete
);

/**
 * @description Students
 */
router.post(
  "/byquestionsid",
  auths.auth,
  validate.qnaids,
  testQnaController.getbyids
);

export default router;
