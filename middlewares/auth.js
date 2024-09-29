import jwt from "jsonwebtoken";
import {
  decryptData,
  errorResponse,
  errorResponseObject,
  successResponse,
} from "../helpers/index.js";
import students from "../modules/students.js";
import adminModal from "../modules/admin.js";
import crypto from "crypto";
import permissions from "../modules/permissions.js";
import roleModal from "../modules/roles.js";
import teachers from "../modules/teachers.js";

export const auth = (req, res, next) => {
  // Get token from header

  const token = req.header("x-auth-token");
  // Check if not token
  if (!token) {
    return errorResponse(req, res, "No token, authorization denied", 401);
  }
  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        console.log({ error });
        return errorResponse(req, res, "Token is not valid", 400);
      } else {
        let data = await students
          .findOne({ _id: decoded.user._id })
          .select("-otp");
        if (!data) {
          return errorResponseObject({
            req,
            res,
            error: "User Not exist",
            code: 401,
          });
        }
        const { _id, ...rest } = data.toObject();
        const response = { userId: _id.toString(), ...rest };
        req.user = response;
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware", err);
    return errorResponse(req, res, "Server Error", 500);
  }
};
export const teacherMiddleware = async (data) => {
  try {
    const teacherdata = await teachers
      .findOne({ _id: data._id })
      .select([
        "-address",
        "-socialPortfolio",
        "-subjects",
        "-teachExams",
        "-resume",
        "-additionalInfo",
      ]);
    const { _id, ...rest } = teacherdata.toObject();
    const response = {
      userId: _id.toString(),
      role: data.role,
      permission: data.permission,
      ...rest,
    };
    return response;
  } catch (error) {
    console.log({ error });
    return error.message;
  }
};

export const admin = (permission) => (req, res, next) => {
  // Get token from header
  const token = req.header("x-admin-token");
  // Check if not token
  if (!token) {
    return errorResponse(req, res, "No token, authorization denied", 401);
  }
  // Verify token
  try {
    jwt.verify(token, process.env.JWT_SECRET_ADMIN, async (error, decoded) => {
      if (error) {
        return errorResponse(req, res, "Token is not valid", 401);
      } else {
        let decodeData = await decryptData(decoded.user);
        // let decodeData = decryptData(decoded.user);
        if (!decodeData) {
          return errorResponse(req, res, "You are not exist", 404);
        }
        const getrole = await permissions.findOne({
          permissionName: permission,
        });
        if (getrole && decodeData) {
          if (decodeData.role.roleName.toLocaleLowerCase() === "teacher") {
            req.user = await teacherMiddleware(decodeData);
            next();
          } else {
            let data = await adminModal
              .findOne({ _id: decodeData._id })
              .select("-password")
              .populate("role");
            let verifyPermission = data.permission.includes(
              getrole._id.toString()
            );
            // successResponse(req, res, data, 200);
            if (verifyPermission) {
              const { _id, ...rest } = data.toObject();
              const response = { userId: _id.toString(), ...rest };
              req.user = response;
              next();
            } else {
              return errorResponse(req, res, "You are Unauthorized", 401);
            }
          }
        } else {
          return errorResponse(req, res, "You are Unauthorized", 401);
        }
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware", err);
    return errorResponse(req, res, "Server Error", 500);
  }
};

export const roles = (role) => async (req, res, next) => {
  try {
    const getrole = await roleModal.findOne({
      roleName: role,
      isActive: true,
      isDelete: false,
    });
    if (req.user.role._id.toString() === getrole._id.toString()) {
      next();
    } else {
      return errorResponse(req, res, "You are Unauthorized..", 401); // User does not have the required role
    }
  } catch (error) {
    console.error("something wrong with auth middleware");
    return errorResponse(req, res, error.message, 500);
  }
};
