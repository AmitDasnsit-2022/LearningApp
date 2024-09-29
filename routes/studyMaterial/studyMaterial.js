import express from "express";
import * as studyMaterialController from "../../controllers/studyMaterial/studyMaterialController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

router.post(
  "/addnew",
  auths.admin("create"),
  validate.studyMaterialValidate,
  studyMaterialController.addnew
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.studyMaterialIdValidate,
  studyMaterialController.updateData
);
router.post("/getall", auths.admin("read"), studyMaterialController.getall);
router.post(
  "/getbyid",
  auths.admin("read"),
  validate.studyMaterialIdValidate,
  studyMaterialController.getbyId
);
router.post(
  "/getbysubjectid",
  auths.admin("read"),
  validate.subjectId,
  studyMaterialController.getbysubjectid
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.studyMaterialIdValidate,
  studyMaterialController.deleteData
);
router.post(
  "/getbyplaylistId",
  auths.admin("read"),
  validate.playlistId,
  studyMaterialController.byPlaylistId
);

/**
 * @description This is for students
 * @access This is access only students users
 */
router.post(
  "/getbycoursefield",
  auths.auth,
  validate.mongodbId,
  studyMaterialController.getByCourseField
);
router.post(
  "/bysubject",
  auths.auth,
  validate.subjectId,
  studyMaterialController.studymaterialBySubject
);
router.post(
  "/byid",
  auths.auth,
  validate.studyMaterialIdValidate,
  studyMaterialController.studyMaterialById
);

router.post(
  "/getbyteacher",
  auths.admin("read"),
  validate.enrollTeacherId,
  studyMaterialController.getByTeachereId
);

router.post(
  "/byplaylistid",
  auths.auth,
  validate.playlistId,
  studyMaterialController.getByPlaylistId
);

export default router;