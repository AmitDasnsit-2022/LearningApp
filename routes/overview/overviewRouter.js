import * as overviewController from '../../controllers/overview/overviewController.js'
import express from 'express';
import * as validate from '../../helpers/validates.js';
import * as auths from '../../middlewares/auth.js';
const router = express();

/**
 * @description This is for Admin Dashboard
 */
router.post('/addnew', auths.admin('create'), validate.overviewValidate, overviewController.addNewOverview);
router.post('/update', auths.admin('edit'), validate.mongodbId, overviewController.updateOverview);
router.post('/getbyid', auths.admin('read'), validate.overviewIdValidate, overviewController.getOverviewById);
router.post('/getall', auths.admin('read'), overviewController.getAllOverviews);
router.post('/delete', auths.admin('delete'), validate.overviewIdValidate, overviewController.deleteOverview);
router.post('/admin/getbycoursefield', auths.admin('read'), validate.mongodbId, overviewController.getByAdminCourse);

/**
 * @description This is for users
 * 
 */
router.post('/getbycoursefield', auths.auth, validate.mongodbId, overviewController.getbycourseFieldId);

export default router;