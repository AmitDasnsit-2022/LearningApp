import express from "express";
import * as auths from "../../middlewares/auth.js";
import * as notificationController from "../../controllers/notification/notificationsController.js";
var router = express.Router();

router.post("/getAll", auths.auth, notificationController.getAllNotifications);
router.post(
  "/readAll",
  auths.auth,
  notificationController.readAllNotifications
);
router.post("/delete", auths.auth, notificationController.deleteNotifications);

router.post(
  "/notificationByAdmin",
  auths.admin("read"),
  notificationController.getAllNotificationsByAdmin
);

router.post(
  "/readByAdmin",
  auths.admin("read"),
  notificationController.readAllNotifications
);
router.post(
  "/deleteByAdmin",
  auths.admin("delete"),
  notificationController.deleteNotifications
);

router.post(
  "/getByTeacher",
  auths.admin("read"),
  auths.roles("teacher"),
  notificationController.getAllNotificationsByTeacher
);

router.post(
  "/readByTeacher",
  auths.admin("read"),
  auths.roles("teacher"),
  notificationController.readAllNotifications
);
export default router;
