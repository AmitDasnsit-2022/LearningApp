import express from "express";
import * as playlists from "../../controllers/playlist/playlistController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

router.post(
  "/addnew",
  auths.admin("create"),
  validate.playlistValidate,
  playlists.addNew
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.playlistUpdateValidate,
  playlists.updatePlaylist
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.playlistUpdateValidate,
  playlists.deletePlaylist
);
router.post(
  "/getbyteacher",
  auths.admin("read"),
  validate.playlistUpdateValidate,
  playlists.getByteacherId
);
router.post("/getall", auths.admin("read"), playlists.getAllPlaylist);

router.post(
  "/recoredbysubjectid",
  validate.subjectId,
  auths.admin("read"),
  playlists.recordedVideoBysubjectid
);

router.post(
  "/playlistbytype",
  validate.mongodbId,
  auths.admin("read"),
  playlists.getPlaylistbytypes
);

router.post(
  "/videobyPlaylist",
  validate.playlistId,
  auths.admin("read"),
  playlists.videobyplaylist
);

/**@access Students */
router.post(
  "/bysubject",
  validate.subjectId,
  auths.auth,
  playlists.getplaylistBySubject
);
router.post(
  "/quicksolution",
  validate.subjectId,
  auths.auth,
  playlists.getplaylistBySubject
);
router.post(
  "/livebysubject",
  validate.subjectId,
  auths.auth,
  playlists.livePlaylistBySubject
);

/**@access Website User */
router.post(
  "/bycoursefield",
  auths.auth,
  validate.mongodbId,
  playlists.getByCourseField
);
router.post(
  "/byteacher",
  auths.auth,
  validate.enrollTeacherId,
  playlists.teacherLectures
);

router.post(
  "/recorded/bysubjectid",
  validate.subjectId,
  auths.auth,
  playlists.recoredPlaylistBysubjectId
);

router.post(
  "/videobyPlaylistId",
  validate.playlistId,
  auths.auth,
  playlists.videobyplaylist
);

export default router;
