import express from "express";
import * as teachers from "../../controllers/teachers/teachersController.js";
import * as validate from "../../helpers/validates.js";
import * as auths from "../../middlewares/auth.js";
import mongoose from "mongoose";

const router = express();

// Public api for register teacher from website.
router.post("/new/add", validate.teacherValidate, teachers.addTeacher);

router.post("/rejectteacher", auths.admin("read"), teachers.rejectTeacher);

router.post("/getall", auths.admin("read"), teachers.getAll);
router.post("/getAciveTeacher", auths.admin("read"), teachers.getAciveTeacher);
router.post(
  "/getallNewRegister",
  auths.admin("read"),
  teachers.getNewRegisterTeacher
);
router.post("/getteacherstate", auths.admin("read"), teachers.getTeacherCount);
/**
 * @description Api to fetch teacher information by teacher only
 */
router.post(
  "/teacherinfo",
  auths.admin("read"),
  auths.roles("teacher"),
  teachers.teacherInfo
);

/**
 * @description Api to fetch teacher information by admin only
 */
router.post(
  "/admin/teacherinfo",
  auths.admin("read"),
  teachers.teacherInfoForAdmin
);

router.post(
  "/getprofile",
  auths.admin("read"),
  auths.roles("teacher"),
  teachers.getProfile
);

//Teacher routes
router.post(
  "/profile/update",
  auths.admin("edit"),
  auths.roles("teacher"),
  teachers.updateProfile
);

router.post(
  "/aboutus",
  auths.auth,
  validate.enrollTeacherId,
  teachers.teacherAbout
);

router.post("/details", auths.auth, teachers.teacherDetails);

router.post(
  "/bycoursefield",
  auths.auth,
  validate.mongodbId,
  teachers.allTeacherBycourseField
);


/**
 * @description This for make teacher verify
 */
router.post(
  "/verify",
  auths.admin("edit"),
  validate.teacherVerify,
  teachers.verifyTeacher
);
router.post(
  "/getallNewVerified",
  auths.admin("read"),
  teachers.newverifiedTeacher
);
router.post("/getteacherdata", auths.admin("read"), teachers.getTeacherData);

/**@description use lass apis becouse this all apis make according to first discussion */
router.post("/resetPassword", auths.roles("teacher"), teachers.resetPassword);
router.post("/send/otp", validate.emailValid, teachers.sendOtpEmail);
router.post("/login", validate.teacherLogin, teachers.login);

export default router;
