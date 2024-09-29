import express from 'express';
import * as courses from '../../controllers/courses/coursesController.js';
import * as validate from '../../helpers/validates.js';
import * as auths from '../../middlewares/auth.js';
const router = express();

//Admin APIS
router.post('/add/newCourse', auths.admin('create'), validate.courseValidate, courses.addCourse);
router.post('/getall', auths.admin('read'), courses.getAllCourseAdmin);
router.post('/update', auths.admin('edit'), validate.courseId, courses.updateCourse)
router.post('/delete', auths.admin('delete'), validate.courseId, courses.deleteCourse)

//users Apis
router.post('/get/allcourse', courses.getAllCourse);


export default router;