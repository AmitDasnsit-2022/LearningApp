import express from "express";
import * as adminController from "../../controllers/admin/authorizeController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";

const router = express();

router.post(
  "/add",
  auths.admin("create"),
  validate.adminValidate,
  adminController.createUser
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.adminUpdateValidate,
  adminController.updateUser
);
router.post("/getall", auths.admin("read"), adminController.getAllUsers);
router.post("/getbyid", auths.admin("read"), adminController.getuserById);
router.post("/delete", auths.admin("delete"), adminController.deleteUserById);

router.post("/totaldata", auths.admin("read"), adminController.allData);
router.post(
  "/change/password",
  validate.password,
  auths.admin("edit"),
  adminController.changePassword
);

export default router;
