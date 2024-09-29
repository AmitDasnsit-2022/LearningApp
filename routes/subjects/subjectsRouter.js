import express from "express";
import * as subjects from "../../controllers/subjects/subjectsController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";
var router = express.Router();

router.post(
  "/add/new",
  auths.admin("create"),
  validate.subjectValidate,
  subjects.addSubject
);
router.post("/getallsubjects", auths.admin("read"), subjects.getAllSubjects);
router.post(
  "/update",
  auths.admin("edit"),
  validate.updateSubjcet,
  subjects.updateSubject
);
router.post("/delete", auths.admin("delete"), subjects.deleteSubject);
router.post(
  "/admin/getbycoursefield",
  auths.admin("read"),
  validate.mongodbId,
  subjects.getSubjectByCourseFieldsAdmin
);

router.post(
  "/getbycoursefield",
  auths.auth,
  validate.mongodbId,
  subjects.getSubjectByCourseFields
);
router.post("/search", subjects.searchData);

router.post(
  "/subjectwithteacher",
  auths.auth,
  validate.mongodbId,
  subjects.subjectWithTeacher
);

// upload.single('file'),

export default router;
