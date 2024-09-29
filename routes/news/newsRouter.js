import express from 'express';
import * as newsController from '../../controllers/news/newsController.js';
import * as validate from '../../helpers/validates.js';
import * as auths from '../../middlewares/auth.js';

const router = express();

router.post('/add', auths.admin('create'), validate.newsValidate, newsController.addNews)
router.post('/getall', auths.admin('read'), newsController.getNews)
router.post('/delete', auths.admin('delete'), newsController.newsDelete)
router.post('/update',auths.admin('edit'),newsController.updateNews)

//This route is to get all news for students
router.post('/studentnews', auths.auth, validate.mongodbId, newsController.studentNews)
router.post('/byid', auths.auth, newsController.newsById)

export default router;