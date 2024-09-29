import {
  errorResponse,
  sendMail,
  successResponse,
  uploadFiles,
  generateOTP,
  successResponseObject,
  errorResponseObject,
} from "../../helpers/index.js";
import teacherModal from "../../modules/teachers.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import subscription from "../../modules/subscription.js";
import enrolledTeacherModal from "../../modules/enrolledTeacher.js";
import adminModel from "../../modules/admin.js";
import notifications from "../../modules/notifications.js";
import enrolledTeacher from "../../modules/enrolledTeacher.js";
import chats from "../../modules/chats.js";
import doubt from "../../modules/doubt.js";
import liveStream from "../../modules/liveStream.js";
import playlists from "../../modules/playlists.js";
import videos from "../../modules/videos.js";

/**
 * Add a new teacher to the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {teacher} The newly added teacher's data.
 */
export const addTeacher = async (req, res) => {
  try {
    const {
      fullname,
      gender,
      dob,
      mobile,
      qualification,
      experience,
      email,
      subjects,
      teachExams,
      address,
      state,
      zipCode,
      facebook,
      linkedin,
      instagram,
      youtube,
      tspp,
      additionalInfo,
      designation,
    } = req.body;
    // Check if the teacher with the same name and mobile number already exists
    let teacher = await teacherModal.findOne({ $and: [{ mobile }, { email }] });

    // Check if the image is included in the request
    if (!req.files) {
      return errorResponse(req, res, "Resume is required", 400); // Respond with error message if no image found
    }

    // Retrieve the image file and upload it to a specific folder
    const { image, resume } = req.files;
    if (!resume) {
      return errorResponse(req, res, "Resume is required", 400);
    }
    let imageUrl;
    if (image && image !== undefined) {
      console.log(resume, image);
      imageUrl = await uploadFiles(image, "teachers_profile");
    }
    const resumeUrl = await uploadFiles(resume, "teachers_profile");

    if (!teacher) {
      // If the teacher doesn't exist, create a new entry in the database
      teacher = new teacherModal({
        fullname,
        gender,
        dob,
        mobile,
        qualification,
        experience,
        email,
        subjects: JSON.parse(subjects),
        teachExams: JSON.parse(teachExams),
        "address.address": address,
        "address.state": state,
        "address.zipCode": zipCode,
        "socialPortfolio.facebook": facebook,
        "socialPortfolio.linkedin": linkedin,
        "socialPortfolio.instagram": instagram,
        "socialPortfolio.youtube": youtube,
        tspp,
        additionalInfo,
        image: imageUrl,
        resume: resumeUrl,
        designation: designation,
      });

      await teacher.save();
      await notifications.create({
        notificationType: "New Teacher",
        title: "Comming new Teacher",
        description: `A new teacher, ${fullname}.`,
      });
      return successResponse(
        req,
        res,
        teacher,
        200,
        "Teacher Add successfully"
      ); // Respond with success message and data
    } else {
      return errorResponse(req, res, `${fullname} Teacher Already Exist`, 403); // Respond with error message if teacher already exists
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Get all teachers
 */
export const getAll = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 50;
    let { status } = req.body;
    let filter = {};
    let pipelineCompletedPorfile = [
      {
        $match: {
          $and: [
            { loginDetails: { $exists: true } },
            { isDelete: false },
            { isVerify: true },
            { isActive: true },
          ],
        },
      },
      {
        $lookup: {
          from: "admins",
          localField: "loginDetails",
          foreignField: "_id",
          let: { loginDetails: "$loginDetails" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$loginDetails"],
                },
              },
            },
            {
              $project: {
                email: 1,
                username: 1,
                firstName: 1,
                lastName: 1,
              },
            },
          ],
          as: "loginDetails",
        },
      },
      {
        $lookup: {
          from: "enrolledteachers", // The name of the collection to join with
          localField: "_id", // The field from the teacherModal documents
          foreignField: "teacherId", // The field from the enrolledTeacher documents
          as: "enrolledTeacherData", // The name of the new array field to add to the input documents
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "enrolledTeacherData.subjectId",
          foreignField: "_id",
          as: "subjectData",
        },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "enrolledTeacherData.courseField",
          foreignField: "_id",
          as: "courseFieldData",
        },
      },
      {
        $addFields: {
          enrolledTeacherData: {
            $map: {
              input: "$enrolledTeacherData",
              as: "etd",
              in: {
                $mergeObjects: [
                  "$$etd",
                  {
                    courseField: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$courseFieldData",
                            as: "cfd",
                            cond: { $eq: ["$$cfd._id", "$$etd.courseField"] },
                          },
                        },
                        0,
                      ],
                    },
                    subject: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$subjectData",
                            as: "sd",
                            cond: { $eq: ["$$sd._id", "$$etd.subjectId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          fullname: 1,
          gender: 1,
          dob: 1,
          email: 1,
          mobile: 1,
          joiningDate: 1,
          qualification: 1,
          image: 1,
          teacherBgImage: 1,
          experience: 1,
          designation: 1,
          subjects: { $arrayElemAt: ["$subjectData.subjectName", 0] },
          teachExams: 1,
          address: 1,
          socialPortfolio: 1,
          additionalInfo: 1,
          resume: 1,
          tspp: 1,
          isVerify: 1,
          isActive: 1,
          isDelete: 1,
          createdAt: 1,
          updatedAt: 1,
          loginDetails: { $arrayElemAt: ["$loginDetails", 0] },
          enrolledTeacherData: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    let verfiyPipeline = [
      {
        $match: {
          $and: [
            { loginDetails: { $exists: false } },
            { isDelete: false },
            { isVerify: true },
            { isActive: true },
          ],
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjectName",
        },
      },
      {
        $addFields: {
          subjectName: { $arrayElemAt: ["$subjectName.subjectName", 0] },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    let rejectedPipeline = [
      {
        $match: {
          $and: [{ isDelete: true }, { isVerify: false }, { isActive: false }],
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjectName",
        },
      },
      {
        $addFields: {
          subjectName: { $arrayElemAt: ["$subjectName.subjectName", 0] },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    let pendingPipeline = [
      {
        $match: {
          $and: [
            { loginDetails: { $exists: false } },
            { isDelete: false },
            { isActive: false },
            { isVerify: false },
          ],
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjectName",
        },
      },
      {
        $addFields: {
          subjectName: { $arrayElemAt: ["$subjectName.subjectName", 0] },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];
    let query;
    if (status && status == "active") {
      query = pipelineCompletedPorfile;
      filter = {
        ...filter,
        loginDetails: { $exists: true },
        isDelete: false,
        isVerify: true,
        isActive: true,
      };
    } else if (status && status == "pending") {
      query = pendingPipeline;
      filter = {
        ...filter,
        loginDetails: { $exists: false },
        isDelete: false,
        isVerify: false,
        isActive: false,
      };
    } else if (status && status == "verify") {
      query = verfiyPipeline;
      filter = {
        ...filter,
        loginDetails: { $exists: false },
        isDelete: false,
        isVerify: true,
        isActive: true,
      };
    } else if (status && status == "rejected") {
      query = rejectedPipeline;
      filter = {
        ...filter,
        loginDetails: { $exists: false },
        isDelete: true,
        isVerify: false,
        isActive: false,
      };
    } else {
      query = [
        {
          $match: {
            isDelete: false,
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subjects",
            foreignField: "_id",
            as: "subjectName",
          },
        },
        {
          $addFields: {
            subjectName: { $arrayElemAt: ["$subjectName.subjectName", 0] },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ];
    }
    const data = await teacherModal.aggregate(query);

    const countQuery = await teacherModal.countDocuments(filter);
    if (!data.length) {
      return successResponse(req, res, [], 200, "", "", countQuery);
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Get all acitve user for assign course
 */
export const getAciveTeacher = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 20;
    const data = await teacherModal
      .find({
        $and: [
          { loginDetails: { $exists: true } },
          { isDelete: false },
          { isVerify: true },
          { isActive: true },
        ],
      })
      .populate({
        path: "subjects",
      })
      .populate({
        path: "teachExams",
      })
      .skip(skip)
      .limit(limit);
    const countQuery = await teacherModal.countDocuments({
      isDelete: false,
      isVerify: true,
      loginDetails: { $exists: true },
    });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Get new resgistered teachers
 */
export const getNewRegisterTeacher = async (req, res) => {
  try {
    const data = await teacherModal
      .find({
        $and: [
          { loginDetails: { $exists: false } },
          { isDelete: false },
          { isVerify: false },
        ],
      })
      .populate({ path: "subjects", select: "subjectName" });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Get teacher counts
 */
export const getTeacherCount = async (req, res) => {
  try {
    const data = await teacherModal.aggregate([
      {
        $group: {
          _id: null,
          pendingTeachers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isVerify", false] },
                    { $eq: ["$isActive", false] },
                    { $eq: ["$isDelete", false] },
                    { $eq: [{ $ifNull: ["$loginDetails", null] }, null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          verifiedTeachers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isVerify", true] },
                    { $eq: ["$isActive", true] },
                    { $eq: ["$isDelete", false] },
                    { $eq: [{ $ifNull: ["$loginDetails", null] }, null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          activeTeachers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isVerify", true] },
                    { $eq: ["$isActive", true] },
                    { $eq: ["$isDelete", false] },
                    { $gt: ["$loginDetails", null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          rejectedTeachers: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isVerify", false] },
                    { $eq: ["$isDelete", true] },
                    { $eq: ["$isActive", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          allTeachers: {
            $sum: {
              $cond: [{}, 1, 0],
            },
          },
        },
      },
    ]);

    const result = {
      pendingTeachers: data.length > 0 ? data[0].pendingTeachers : 0,
      verifiedTeachers: data.length > 0 ? data[0].verifiedTeachers : 0,
      rejectedTeachers: data.length > 0 ? data[0].rejectedTeachers : 0,
      allTeachers: data.length > 0 ? data[0].allTeachers : 0,
      activeTeachers: data.length > 0 ? data[0].activeTeachers : 0,
    };

    return successResponse(req, res, result, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Get teacher profile
 */
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const data = await teacherModal
      .findOne({
        loginDetails: userId,
        isDelete: false,
        isActive: true,
      })
      .populate({
        path: "loginDetails",
        select: ["-password", "-macAddress", "-permission"],
        populate: {
          path: "role",
        },
      });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description teacherDetails verify by admin
 */
export const verifyTeacher = async (req, res) => {
  try {
    let { teacherId, isVerify } = req.body;
    const data = await teacherModal.findOneAndUpdate(
      { _id: teacherId },
      { $set: { isVerify: isVerify, isActive: true } },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      sendMail(data.email, "Account verify");
      return successResponse(req, res, data, 200, "Account verify");
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description reset password of teacher profile
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const teacherId = req.user;
    const salt = await bcrypt.genSalt(10);
    let pass = await bcrypt.hash(password, salt);
    const data = await teacherModal.findOneAndUpdate(
      { _id: teacherId },
      { $set: { isActive: true } },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, "Teacher doesnot exist", 404);
    } else {
      return successResponse(req, res, data, 200, "Password changed");
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description email and otp send request
 */
export const sendOtpEmail = async (req, res) => {
  try {
    const data = await teacherModal.findOne({
      email: req.body.email,
      isActive: true,
      isDelete: false,
    });
    if (!data) {
      return errorResponse(req, res, "Login detial is not valid", 404);
    } else {
      const otp = await generateOTP();
      await teacherModal.findOneAndUpdate(
        { email: req.body.email },
        {
          $set: { "loginDetails.otp": otp },
        }
      );
      await sendMail(data.email, "Verify Otp", `Your otp is ${otp}`);
      return successResponse(
        req,
        res,
        [],
        200,
        "OTP send on your registered email"
      );
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description teacher login by email and otp
 */
export const login = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const data = await teacherModal.findOne({ email: email, isActive: true });
    if (!data) {
      return errorResponse(req, res, "Login detial is not valid", 404);
    } else if (otp === data.loginDetails.otp) {
      let teacherdata = await teacherModal.findOneAndUpdate(
        { _id: data._id },
        { $unset: { "loginDetails.otp": otp } },
        { new: true }
      );
      const cipher = crypto.createCipher(
        "aes-256-cbc",
        process.env.JWT_PAYLOAD_SECRET_KEY
      );
      let encrypted = cipher.update(JSON.stringify(teacherdata), "utf8", "hex");
      encrypted += cipher.final("hex");
      // console.log({ hash })
      const payload = {
        user: encrypted,
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET_ADMIN,
        { expiresIn: "8h" },
        (err, token) => {
          const { ...rest } = teacherdata.toObject();
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
    } else {
      return errorResponse(req, res, "Login detial is not valid", 400);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description update teacher profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      additionalInfo,
      fullname,
      gender,
      dob,
      mobile,
      qualification,
      experience,
      email,
      address,
    } = req.body;
    let fileUrl;
    let profileImg;
    if (req.files) {
      const { teacherBgImage, image } = req.files;
      if (image) {
        profileImg = await uploadFiles(image, "teachers_profile");
      }
      if (teacherBgImage) {
        fileUrl = await uploadFiles(teacherBgImage, "teachers_profile");
      }
    }
    const parsedAddress = JSON.parse(address);
    const data = await teacherModal.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          teacherBgImage: fileUrl,
          additionalInfo: additionalInfo,
          image: profileImg,
          fullname,
          gender,
          dob,
          mobile,
          qualification,
          experience,
          email,
          address: {
            address: parsedAddress.address,
            city: parsedAddress.city,
            state: parsedAddress.state,
            zipCode: parsedAddress.zipCode,
          },
        },
      },
      { new: true }
    );
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not update",
        code: 404,
      });
    }
    return successResponseObject({
      req,
      res,
      data,
      code: 200,
      msg: "Data Updated",
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description teacherDetails by teacherID
 */
export const teacherAbout = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await teacherModal
      .findOne({ _id: teacherId })
      .select([
        "-email",
        "-mobile",
        "-resume",
        "-address",
        "-subjects",
        "-teachExams",
      ])
      .populate({
        path: "subjects",
      })
      .populate({
        path: "teachExams",
      });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Teacher details get by student
 */
export const teacherDetails = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const data = await subscription.aggregate([
      {
        $match: {
          studentId: new ObjectId(studentId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "enrolledteachers",
          localField: "courseFieldId",
          foreignField: "courseField",
          as: "enrolledTeacher",
        },
      },
      {
        $unwind: "$enrolledTeacher",
      },
      {
        $lookup: {
          from: "teachers",
          localField: "enrolledTeacher.teacherId",
          foreignField: "_id",
          as: "teacherDetails",
        },
      },
      {
        $unwind: "$teacherDetails",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "courseFieldId",
          foreignField: "_id",
          as: "coursefieldData",
        },
      },
      {
        $project: {
          _id: 0,
          studentId: 0,
          courseFieldId: 0,
          planDuration: 0,
          planId: 0,
          isActive: 0,
          isDelete: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          paymentStatus: 0,
          paymentMethod: 0,
          orderId: 0,
          totalAmount: 0,
          paymentId: 0,
          languageId: 0,
          enrolledTeacher: 0,
          teacherDetails: {
            email: 0,
            mobile: 0,
            dob: 0,
            loginDetails: 0,
          },
        },
      },
      {
        $addFields: {
          coursefieldData: {
            $arrayElemAt: ["$coursefieldData", 0],
          },
        },
      },
    ]);

    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }

    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Teacher details those are newly registered and verified
 */
export const newverifiedTeacher = async (req, res) => {
  try {
    const data = await teacherModal.find({
      $and: [
        { isDelete: false },
        { isVerify: true },
        { isActive: true },
        { loginDetails: { $exists: false } },
      ],
    });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Teacher details get by student
 */
export const allTeacherBycourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await enrolledTeacherModal.aggregate([
      {
        $match: {
          courseField: new ObjectId(courseFieldId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacherId",
        },
      },
      {
        $unwind: "$teacherId",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "courseFieldId",
          foreignField: "_id",
          as: "coursefieldData",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subjectIdData",
        },
      },
      {
        $project: {
          _id: 0,
          studentId: 0,
          courseFieldId: 0,
          planDuration: 0,
          planId: 0,
          isActive: 0,
          isDelete: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          paymentStatus: 0,
          paymentMethod: 0,
          orderId: 0,
          totalAmount: 0,
          paymentId: 0,
          languageId: 0,
          teacherId: {
            email: 0,
            mobile: 0,
            dob: 0,
            loginDetails: 0,
            address: 0,
            resume: 0,
            joiningDate: 0,
            subjects: 0,
            teachExams: 0,
          },
        },
      },
      {
        $addFields: {
          coursefieldData: {
            $arrayElemAt: ["$coursefieldData", 0],
          },
        },
      },
      {
        $addFields: {
          subjectIdData: {
            $arrayElemAt: ["$subjectIdData", 0],
          },
        },
      },
      {
        $group: {
          _id: "$teacherId._id",
          fullname: { $first: "$teacherId.fullname" },
          gender: { $first: "$teacherId.gender" },
          qualification: { $first: "$teacherId.qualification" },
          image: { $first: "$teacherId.image" },
          teacherBgImage: { $first: "$teacherId.teacherBgImage" },
          experience: { $first: "$teacherId.experience" },
          designation: { $first: "$teacherId.designation" },
          socialPortfolio: { $first: "$teacherId.socialPortfolio" },
          additionalInfo: { $first: "$teacherId.additionalInfo" },
          tspp: { $first: "$teacherId.tspp" },
          isVerify: { $first: "$teacherId.isVerify" },
          isActive: { $first: "$teacherId.isActive" },
          isDelete: { $first: "$teacherId.isDelete" },
          createdAt: { $first: "$teacherId.createdAt" },
          updatedAt: { $first: "$teacherId.updatedAt" },
          __v: { $first: "$teacherId.__v" },
          subjectId: { $first: "$subjectId" },
          courseField: { $first: "$courseField" },
          coursefieldData: { $first: "$coursefieldData" },
          subjectIdData: { $first: "$subjectIdData" },
        },
      },
    ]);

    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }

    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Total numbers of teachers
 */
export const getallTeachers = async (req, res) => {
  try {
    const totalTeachers = await teacherModal.countDocuments({
      isDelete: false,
      isVerify: true,
      loginDetails: { $exists: true },
    });
    return totalTeachers;
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description teacher information by using teacher id for admin access
 */
export const teacherInfo = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await teacherModal.aggregate([
      {
        $match: {
          _id: new ObjectId(teacherId),
          isVerify: true,
          isDelete: false,
          loginDetails: { $exists: true },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjects",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "teachExams",
          foreignField: "_id",
          as: "teachExams",
        },
      },
      {
        $project: {
          loginDetails: 0,
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    const formattedData = data[0];
    return successResponseObject({ req, res, data: formattedData, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description teacher information by using teacher id for admin access
 */
export const teacherInfoForAdmin = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await teacherModal.aggregate([
      {
        $match: {
          _id: new ObjectId(teacherId),
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjects",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "teachExams",
          foreignField: "_id",
          as: "teachExams",
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    const formattedData = data[0];
    return successResponseObject({ req, res, data: formattedData, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description teacher data for pending, verified and rejected
 */
export const getTeacherData = async (req, res) => {
  try {
    const data = await teacherModal.aggregate([
      {
        $facet: {
          pendingTeachers: [
            {
              $match: {
                isVerify: false,
                isDelete: false,
                loginDetails: { $exists: false },
              },
            },
          ],
          verifiedTeachers: [
            {
              $match: {
                isVerify: true,
                isDelete: false,
              },
            },
          ],
          rejectedTeachers: [
            {
              $match: {
                isVerify: false,
                isDelete: true,
                loginDetails: { $exists: false },
              },
            },
          ],
        },
      },
    ]);
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 }); // Handle any errors that occur during the process
  }
};

/**
 * @description Reject teacher profile API
 */
export const rejectTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await teacherModal.findOneAndUpdate(
      { _id: teacherId },
      {
        $set: {
          isVerify: false,
          isDelete: true,
          isActive: false,
        },
      },
      { new: true }
    );
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Teacher not found",
        code: 404,
      });
    }
    if (data.loginDetails) {
      await adminModel.findOneAndUpdate(
        { _id: data.loginDetails },
        { $set: { isActive: false, isDelete: true } }
      );
      const collections = [
        chats,
        doubt,
        enrolledTeacher,
        liveStream,
        notifications,
        playlists,
        videos,
      ];
      //teacherDetails
      const query = {
        $or: [
          { teacherId: teacherId },
          { teacherDetails: teacherId },
          { _id: teacherId },
        ],
      };
      // collections.forEach(async (collectionName) => {
      //   await collectionName.updateMany(query, {
      //     isActive: false,
      //     isDelete: true,
      //   });
      // });
    }
    return successResponseObject({
      req,
      res,
      code: 200,
      msg: "Teacher rejected successfully.",
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
