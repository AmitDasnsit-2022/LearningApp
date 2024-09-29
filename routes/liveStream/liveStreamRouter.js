import express from "express";
import * as liveStreamController from "../../controllers/liveSteam/liveStreamController.js";
import * as auths from "../../middlewares/auth.js";
import * as validate from "../../helpers/validates.js";
const router = express.Router();

/**@description Admin Dashboard */
router.post(
  "/create",
  auths.admin("create"),
  validate.steamCreateValidate,
  liveStreamController.createLiveStream
);

// This is for nginx rtmp server
router.post("/verify", liveStreamController.streamVerify);

router.post("/getall", auths.admin("read"), liveStreamController.getAll);
router.post(
  "/getbyid",
  validate.liveStreamPlay,
  auths.admin("read"),
  liveStreamController.getbyid
);
/**
 *  @description Api endpoint for teachers only
 */
router.post(
  "/getfuture",
  auths.admin("read"),
  auths.roles("teacher"),
  liveStreamController.teacherupcomingLiveStream
);

router.post(
  "/play",
  auths.admin("read"),
  auths.roles("teacher"),
  liveStreamController.playLiveStream
);

router.post(
  "/getpast",
  auths.admin("read"),
  auths.roles("teacher"),
  liveStreamController.teacherpastLiveStream
);

router.post(
  "/getcurrent",
  auths.admin("read"),
  auths.roles("teacher"),
  liveStreamController.teacherCurrentLiveStream
);

router.post(
  "/update",
  auths.admin("read"),
  auths.roles("teacher"),
  liveStreamController.updateLiveStream
);

/**@description User side */
router.post(
  "/byteacher",
  auths.auth,
  validate.enrollTeacherId,
  liveStreamController.byTeacher
);

router.post(
  "/onplay",
  validate.liveStreamPlay,
  auths.auth,
  liveStreamController.onPlay
);

router.post(
  "/getlivestream",
  validate.mongodbId,
  auths.auth,
  liveStreamController.getLiveStream
);
router.post(
  "/getupcoming",
  auths.auth,
  liveStreamController.upcomingLiveStream
);

router.post(
  "/bysubjectid",
  auths.auth,
  validate.subjectId,
  liveStreamController.liveStreamBySubject
);

router.post(
  "/bylivestreamid",
  auths.auth,
  validate.liveStreamPlay,
  liveStreamController.getbylivestreamId
);

export default router;
