import express from 'express';
import * as paymentHistory from '../../controllers/payment history/paymentController.js'
import * as auths from '../../middlewares/auth.js';

const router = express();

router.post('/admin/getall', auths.admin('read'),paymentHistory.getpaymentHistory);
router.post('/getall', auths.auth,paymentHistory.getstudentPayment);

export default router;