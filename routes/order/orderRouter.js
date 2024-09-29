import express from "express";
import * as orderController from "../../controllers/order/orderController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
const router = express.Router();

// For students
router.post("/create", auths.auth,validate.orderValidate, orderController.createOrder);
router.post("/getall", auths.auth, orderController.getOrders);
router.post("/getbyid", auths.auth, orderController.getorderById);


// For Admin
router.post("/admin/getall", auths.admin('read'), orderController.getOrdersAdmin);
router.post("/admin/getbyid", auths.admin('read'), orderController.orderByIdAdmin);

export default router;
