// Controller to send OTP to a mobile number
import {
  encryptData,
  errorResponse,
  errorResponseObject,
  generateOTP,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import adminModal from "../../modules/admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import teacher from "../../modules/teachers.js";
import mongoose from "mongoose";
import roles from "../../modules/roles.js";
import { sendMail } from "../../helpers/mailSend.js";
const ObjectId = mongoose.Types.ObjectId;

export const adminRegister = async (req, res) => {
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
    const key = await generateOTP();
    const username = `${firstName.trim().toLowerCase() + key}`;
    let data = await adminModal.findOne({ email });
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
      return successResponse(req, res, [], 200, "Register successfull...");
    } else {
      return errorResponse(req, res, "User Already exist", 403);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { username, password, macAddress } = req.body;
    let data = await adminModal
      .findOne({ username, isActive: true })
      .populate("role")
      .populate("permission");
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "User not exit or not acitve",
        code: 400,
      });
    }
    const role = await roles.findOne({ _id: new ObjectId(data.role) });
    let teacherdata;
    let encrypted;
    if (role.roleName.toLocaleLowerCase() === "teacher") {
      const teacherData = await teacher
        .findOne({ loginDetails: data._id })
        .select(["-teachExams", "-resume"])
        .populate("subjects");
      const { _id, ...rest } = teacherData.toObject();
      teacherdata = {
        _id: _id.toString(),
        role: data.role,
        permission: data.permission,
        ...rest,
      };
    }
    if (!data) {
      return errorResponse(req, res, "User not exist", 404);
    } else {
      const isMatch = await bcrypt.compare(password, data.password);

      if (!isMatch) {
        return errorResponse(req, res, "Invalid Credentials", 400);
      }
      if (!data.macAddress) {
        await adminModal.findOneAndUpdate(
          { username, isActive: true },
          {
            $set: {
              macAddress: macAddress,
            },
          }
        );
      } else if (data.macAddress !== macAddress) {
        return errorResponse(req, res, "User machine is not registered", 400);
      }
      // const hash = createHmac('sha256', process.env.JWT_PAYLOAD_SECRET_KEY).update(JSON.stringify(data)).digest('hex');
      data.password = "";
      data.macAddress = undefined;
      if (role.roleName.toLocaleLowerCase() === "teacher") {
        encrypted = encryptData(JSON.stringify(teacherdata));
      } else {
        encrypted = encryptData(JSON.stringify(data));
      }
      // console.log("flkasjdlfjasdf", encrypted);
      const payload = {
        user: encrypted,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET_ADMIN,
        { expiresIn: "8h" },
        (err, token) => {
          const { ...rest } = data.toObject();
          const response = { ...rest, role: "", permission: "" };
          if (err) throw err;
          return successResponse(
            req,
            res,
            response,
            200,
            "Login Successfully",
            token
          );
        }
      );
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};



/**
 * @description Send otp
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    let opt = generateOTP();
    const data = await adminModal.findOne({ email });
    if (!data)
      return errorResponseObject({
        req,
        res,
        error: "Enter the registered E-mail",
        code: 400,
      });
    sendMail(
      email,
      "Email verificaiton OTP",
      `This your mail verification otp ${opt}`
    );
    return successResponseObject({
      req,
      res,
      code: 200,
      msg: "Please check your email",
    });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const data = await adminModal.findOne({ email });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Email not valid",
        code: 400,
      });
    }
    if (data.otp != otp) {
      return errorResponseObject({
        req,
        res,
        error: "OTP not valid",
        code: 400,
      });
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const updateddata = await adminModal.findOneAndUpdate(
      { _id: userId },
      { password }
    );
    return successResponseObject({
      req,
      res,
      code: 200,
      msg: "Password Updated",
    });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};
