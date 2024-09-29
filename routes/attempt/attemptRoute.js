import * as attemptController from "../../controllers/attempt/attemptController.js";
import express from "express";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";
const router = express();

router.post("/createInBulk", auths.auth, validate.qnalistId, attemptController.addInBulk);

export default router;
