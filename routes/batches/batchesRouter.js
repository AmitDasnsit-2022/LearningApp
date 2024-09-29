import * as batchesController from "../../controllers/batches/batchesController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
import express from "express";

const router = express();

router.post(
  "/addbatch",
  auths.admin("create"),
  validate.mongodbId,
  batchesController.addBatch
);

router.post(
  "/updatebatch",
  auths.admin("edit"),
  validate.batchIdValidate,
  batchesController.updateBatch
);

router.post(
  "/deletebatch",
  auths.admin("delete"),
  validate.batchIdValidate,
  batchesController.deleteBatch
);

router.post(
    "/getallbatch",
    auths.admin("read"),
    batchesController.getAllBatch
);

router.post(
    "/batchbycoursefield",
    auths.auth,
    validate.mongodbId,
    batchesController.batchbyCourseField
);

export default router;
