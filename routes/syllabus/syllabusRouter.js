import express from 'express';
import * as auths from '../../middlewares/auth.js';
import * as validate from '../../helpers/validates.js';
import * as syllabus from '../../controllers/syllabus/syllabusController.js';
var router = express.Router();

/**@description Admin Dashboard Apis */
router.post('/add', auths.admin('create'), validate.syllabusValid, syllabus.addSyllabus);
router.post('/update', auths.admin('edit'), validate.syllabusUpdateValid, syllabus.updateSyllabus);
router.post('/delete', auths.admin('delete'), validate.syllabusDeleteValid, syllabus.deleteSyllabus);
router.post('/getSyllabus', auths.admin('read'), syllabus.getAllSyllabus);

/**@description Students Apis */
router.post('/student/syllabus', auths.auth, syllabus.studentSyllabus);

/**@access Webiste users */
router.post('/getbyid', auths.auth, syllabus.getById)


export default router;