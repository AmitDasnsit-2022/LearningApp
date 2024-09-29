import express from 'express';
import * as uploadFiles from '../../controllers/files/filesController.js';
import * as validate from '../../helpers/validates.js';
import * as auths from '../../middlewares/auth.js';
const router = express();


router.post('/add/multiple', auths.admin('create'), validate.allfileValidate, uploadFiles.addFileMultiples);
router.post('/add/singlefile', auths.admin('create'), validate.allfileValidate, uploadFiles.uploadSingleFile);
router.post('/update', auths.admin('edit'), validate.fileValidate, uploadFiles.updateFile);
router.post('/getbyfolder', auths.admin('read'), uploadFiles.getByFolder);
router.post('/delete', auths.admin('delete'), uploadFiles.deleteFile);
router.post('/getfiles', auths.admin('read'), uploadFiles.getfiles);
router.post('/getallFolder', auths.admin('read'), uploadFiles.getAllFolderName);

/**@access Students */
router.post('/allbanners', auths.auth, uploadFiles.allBanners);
router.post('/bannerbycoursefield', auths.auth, validate.mongodbId, uploadFiles.bannerbycourseField);

export default router;