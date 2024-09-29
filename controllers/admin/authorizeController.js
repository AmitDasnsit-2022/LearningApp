import {
  errorResponse,
  successResponse,
  sendMail,
  generateOTP,
  errorResponseObject,
  successResponseObject,
} from "../../helpers/index.js";
import adminModal from "../../modules/admin.js";
import * as courseFieldsController from "../../controllers/courseFields/courseFields.js";
import * as coursesController from "../../controllers/courses/coursesController.js";
import * as teachersController from "../../controllers/teachers/teachersController.js";
import * as studentsController from "../../controllers/students/studentsController.js";
import * as filesController from "../../controllers/files/filesController.js";
import * as subscriptionsController from "../../controllers/subscription/subscriptionController.js";
import bcrypt from "bcryptjs";
import teacherModal from "../../modules/teachers.js";
import enrolledTeacher from "../../modules/enrolledTeacher.js";
import roles from "../../modules/roles.js";

export const createUser = async (req, res) => {
  try {
    const {
      email,
      roleId,
      permissionId,
      firstName,
      lastName,
      password,
      teacherId,
    } = req.body;
    let data = await adminModal.findOne({ email });
    const roledata = await roles.findOne({ _id: roleId });
    if (roledata.roleName.toLocaleLowerCase() === "teacher" && !teacherId) {
      return errorResponseObject({
        req,
        res,
        error: "Teacher Id is required",
        code: 400,
      });
    }
    let teacherdata;
    if (teacherId) {
      teacherdata = await teacherModal.findOne({
        $and: [
          { _id: teacherId },
          { isActive: true },
          { isDelete: false },
          { loginDetails: { $exists: false } },
        ],
      });
      if (!teacherdata) {
        return errorResponseObject({
          req,
          res,
          error: "User already asigned",
          code: 400,
        });
      }
    }
    const key = await generateOTP();
    const username = `${firstName.trim().toLowerCase() + key}`;
    if (!data) {
      data = new adminModal({
        email,
        role: roleId,
        permission: permissionId,
        firstName,
        lastName,
        username: username,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);

      await data.save();
      sendMail(
        email,
        "User created succesfully",
        `Your Username is ${data.username}
        Your Password is ${password},
        Your dashboard link is ${process.env.dashboard_link}
        `
      );
      let userdata;
      if (teacherdata) {
        const teacherProfile = await teacherModal.findOneAndUpdate(
          { _id: teacherdata.id },
          { $set: { loginDetails: data._id } },
          { new: true }
        );
        const { ...rest } = data.toObject();
        userdata = { ...rest, teacherProfile: teacherProfile };
      }
      return successResponseObject({
        req,
        res,
        data: userdata,
        code: 200,
        msg: "User Created...",
      });
    } else {
      return errorResponseObject({
        req,
        res,
        error: "User already Exist",
        code: 403,
      });
    }
  } catch (error) {
    console.log(error.message);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const {
      userId,
      roleId,
      teacherId,
      permissionId,
      firstName,
      lastName,
      isActive,
    } = req.body;
    const data = await adminModal
      .findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            role: roleId,
            permission: permissionId,
            firstName,
            lastName,
            isActive,
          },
        },
        { new: true }
      )
      .populate("role")
      .populate("permission");
    if (data.role.roleName.toLocaleLowerCase() === "teacher" && !teacherId) {
      return errorResponseObject({
        req,
        res,
        error: "Teacher Id is required",
        code: 400,
      });
    }
    await enrolledTeacher.findOneAndUpdate(
      { teacherId },
      { $set: { isActive } },
      { new: true }
    );
    let teacherdata;
    if (teacherId) {
      teacherdata = await teacherModal.findOne({
        _id: teacherId,
        isDelete: false,
      });
      if (!teacherdata) {
        return errorResponseObject({
          req,
          res,
          error: "Teacher is not valid",
          code: 500,
        });
      }
    }
    let userdata;
    if (teacherdata) {
      const teacherProfile = await teacherModal.findOneAndUpdate(
        { _id: teacherdata.id },
        { $set: { loginDetails: data._id, isActive } },
        { new: true }
      );
      const { ...rest } = data.toObject();
      userdata = { ...rest, teacherProfile: teacherProfile };
      return successResponseObject({ req, res, data: userdata, code: 201 });
    }

    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      return successResponseObject({ req, res, data, code: 201 });
    }
  } catch (error) {
    console.log(error.message);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

// Get all Users
export const getAllUsers = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const userId = req.user.userId;
    const getUsers = await adminModal
      .aggregate([
        {
          $match: {
            isDelete: false,
            _id: { $ne: userId },
          },
        },
        {
          $lookup: {
            from: "teachers",
            localField: "_id",
            foreignField: "loginDetails",
            as: "teacherProfile",
          },
        },
        {
          $lookup: {
            from: "roles",
            localField: "role",
            foreignField: "_id",
            as: "role",
          },
        },
        {
          $unwind: "$role",
        },
        {
          $lookup: {
            from: "permissions",
            localField: "permission",
            foreignField: "_id",
            as: "permission",
          },
        },
        {
          $project: {
            password: 0,
          },
        },
        {
          $addFields: {
            teacherProfile: {
              $arrayElemAt: ["$teacherProfile", 0],
            },
          },
        },
      ])
      .skip(skip)
      .limit(limit);
    const countQuery = await adminModal.countDocuments({ isDelete: false });
    if (!getUsers.length) {
      return errorResponseObject({
        req,
        res,
        error: "User not found",
        code: 404,
      });
    }
    return successResponseObject({
      req,
      res,
      data: getUsers,
      code: 200,
      count: countQuery,
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

// Get doubts by Id
export const getuserById = async (req, res) => {
  const userId = req.user.userId || req.body.userId;
  try {
    const userById = await adminModal
      .findOne({ _id: userId, isDelete: false })
      .populate({ path: "role" })
      .populate({ path: "permission" })
      .select("-password");
    if (!userById) {
      return errorResponseObject({
        req,
        res,
        error: "User not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data: userById, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

// Delete a user by Id
export const deleteUserById = async (req, res) => {
  const userId = req.body.userId;
  console.log(userId);
  try {
    const result = await adminModal.findOneAndUpdate(
      { _id: userId },
      { $set: { isDelete: true, isActive: false } },
      { new: true }
    );
    const teacherEmail = await adminModal.findOne({ _id: userId });
    const findTeacherId = await teacherModal.findOne({
      email: teacherEmail.email,
    });
    const deleteTeacher = await teacherModal.findOneAndUpdate(
      { _id: findTeacherId._id },
      { $set: { isDelete: true, isActive: false, isVerify: false } },
      { new: true }
    );
    const findOneEnrollTeacher = await enrolledTeacher.findOneAndUpdate(
      { teacherId: findTeacherId._id },
      { $set: { isDelete: true, isActive: false } },
      { new: true }
    );
    if (!result) {
      return errorResponseObject({
        req,
        res,
        error: "User not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data: result, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const allData = async (req, res) => {
  try {
    const data = await Promise.all([
      courseFieldsController.totalCourseFields(req, res),
      coursesController.totalCourses(req, res),
      teachersController.getallTeachers(req, res),
      studentsController.totalStudents(req, res),
      studentsController.totalNewStudents(req, res),
      filesController.totalFiles(req, res),
      subscriptionsController.totalactiveUsers(req, res),
      // subscriptionsController.totalInactiveUsers(req, res),
      studentsController.getInactiveStudents(req, res),
      subscriptionsController.totalpurchasedCourses(req, res),
    ]);

    const [
      totalCourseFields,
      totalCourses,
      totalTeachers,
      totalStudents,
      totalNewStudents,
      totalFiles,
      totalactiveUsers,
      getInactiveStudents,
      purchasedCourses,
    ] = data;
    const responseData = {
      totalCourseFields,
      totalCourses,
      totalTeachers,
      totalStudents,
      totalNewStudents,
      totalFiles,
      totalactiveUsers,
      totalInactiveUsers: getInactiveStudents,
      purchasedCourses,
    };
    return successResponseObject({ req, res, data: responseData, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description Password Change
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const changePassword = async (req, res) => {
  const userId = req.body.userId || req.user.userId;
  let { password, oldPassword } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    if (req.body.userId) {
      await adminModal.findOneAndUpdate({ _id: userId }, { password });
    } else {
      const finduser = await adminModal.findOne({ _id: userId });
      if (!finduser) {
        return errorResponseObject({
          req,
          res,
          error: "User not exist",
          code: 400,
        });
      }
      const isMatch = await bcrypt.compare(oldPassword, finduser.password);
      if (!isMatch) {
        return errorResponseObject({
          req,
          res,
          error: "Enter valid old password",
          code: 400,
        });
      }
    }

    return successResponseObject({ req, res, msg: "Password updated..." });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};
