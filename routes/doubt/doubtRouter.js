import express from "express";
import * as doubts from "../../controllers/doubt/doubtController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";

const router = express();

//For students
router.post("/getall", auths.auth, doubts.getAllDoubts);
router.post("/getbyid", auths.auth, validate.doubtId, doubts.getDoubtById);
router.post(
  "/getbysub",
  validate.subjectId,
  auths.auth,
  doubts.getDoubtsBySubjectId
);
router.post(
  "/delete",
  validate.addDoubtValidate,
  auths.auth,
  doubts.deleteDoubtById
);
router.post("/update", auths.auth, validate.doubtId, doubts.updateDoubtById);
router.post("/add", auths.auth, validate.addDoubtValidate, doubts.addDoubt);

// Teacher
router.post(
  "/solution",
  validate.solutionValidate,
  auths.admin("read"),
  auths.roles("teacher"),
  doubts.addSolution
);
router.post(
  "/admin/getbyteacher",
  validate.enrollTeacherId,
  auths.admin("read"),
  auths.roles("teacher"),
  doubts.getdoubtbyTeacherId
);

//For Admin
router.post("/admin/getall", auths.admin("read"), doubts.getAllDoubtsAdmin);
router.post(
  "/admin/getByid",
  validate.doubtId,
  auths.admin("read"),
  doubts.getdoubtById
);
router.post(
  "/admin/getBysub",
  validate.subjectId,
  auths.admin("read"),
  doubts.getDoubtBySubjectId
);

router.post(
  "/teacher/getBysub",
  validate.subjectId,
  auths.admin("read"),
  auths.roles("teacher"),
  doubts.getDoubtBySubjectId
);

export default router;
