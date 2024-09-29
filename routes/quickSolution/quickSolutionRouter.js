import express from "express";
import * as quicksolutionController from "../../controllers/quickSolution/quickSolutionController.js"
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express();

/**@access Admin */
router.post(
    "/add",
    auths.admin("create"),
    validate.videosValidate,
    quicksolutionController.addquickSolution
);

router.post(
    "/addplaylist",
    auths.admin("create"),
    validate.playlistValidate,
    quicksolutionController.solutionPlaylist
);
router.post(
    '/update',
    auths.admin('edit'),
    validate.playlistUpdateValidate,
    quicksolutionController.updatePlaylist
);
/**
 * @access Users Or Students
 */
router.post(
  "/get",
  auths.auth,
  validate.mongodbId,
  quicksolutionController.getByCourseField
);

router.post(
  "/getbysubject",
  auths.auth,
  validate.subjectId,
  quicksolutionController.getBySubjectId
);


router.post(
  "/getplaylist",
  auths.auth,
  validate.subjectId,
  quicksolutionController.getQuickPlaylist
);

router.post(
  "/getvideos",
  auths.auth,
  validate.playlistUpdateValidate,
  quicksolutionController.getvideoByPlaylist
);
export default router;
