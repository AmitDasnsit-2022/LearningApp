import express from "express";
import * as videos from "../../controllers/videos/videosController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

/**@access Admin */
router.post(
  "/add",
  auths.admin("create"),
  validate.videosValidate,
  videos.uploadVideos
);
router.post("/getallvideos", auths.admin("read"), videos.getAllVideos);
router.post(
  "/bySubjectId",
  auths.admin("read"),
  validate.subjectId,
  videos.getVideosBySubject
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.videosSubjectIdValidate,
  videos.updateVideo
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.videosSubjectIdValidate,
  videos.deleteVideo
);
router.post(
  "/getbyid",
  auths.admin("read"),
  validate.videoId,
  videos.playVideo
);
router.post(
  "/getbyteacher",
  auths.admin("read"),
  validate.enrollTeacherId,
  videos.getbyteacher
);

/**
 * @access Users Or Students
 */
router.post("/playvideo", auths.auth, validate.videoId, videos.playVideo);
router.post(
  "/videoById",
  validate.videoWatchedTime,
  auths.auth,
  videos.videoById
);

export default router;
