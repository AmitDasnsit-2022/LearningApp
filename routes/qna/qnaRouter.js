import express from "express";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
import * as qnaController from "../../controllers/qna/qnaController.js";
const router = express();

router.post("/create", auths.admin("create"), qnaController.createQna);
router.post(
  "/qnabyqnalistid",
  validate.qnalistIdValidate,
  auths.auth,
  qnaController.qnaByQnalistId
);
router.post("/qnalistanswer", auths.auth, qnaController.qnaListAnswer);

export default router;
