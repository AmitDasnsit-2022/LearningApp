import express from "express";
import * as bookmarkController from "../../controllers/bookmark/bookmarkController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";

const router = express();

/**
 * @description API routes for students
 **/
router.post("/getall", auths.auth,validate.mongodbId ,bookmarkController.getBookmarked);
router.post(
  "/add",
  auths.auth,
  validate.mongodbId,
  bookmarkController.addBookmark
);
router.post(
  "/delete",
  auths.auth,
  bookmarkController.removeBookmark
);
router.post("/checkbookmarked", auths.auth, bookmarkController.checkIsBookmark);

export default router;
