import {
  errorResponse,
  successResponse,
  successResponseObject,
  errorResponseObject,
} from "../../helpers/index.js";
import enrolledTeacher from "../../modules/enrolledTeacher.js";
import adminModel from "../../modules/admin.js";
import mongoose from "mongoose";
import teacherModel from "../../modules/teachers.js";
import chats from "../../modules/chats.js";
import doubt from "../../modules/doubt.js";
import liveStream from "../../modules/liveStream.js";
import notifications from "../../modules/notifications.js";
import playlists from "../../modules/playlists.js";
import videos from "../../modules/videos.js";
const ObjectId = mongoose.Types.ObjectId;

/**
 * Add a new academic entry to the database if the teacher is not already enrolled for the subject.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The newly added academic entry.
 */
export const addNew = async (req, res) => {
  try {
    const { subjectId, teacherId, courseField } = req.body;
    // Check if the teacher is already enrolled for the subject
    let data = await enrolledTeacher
      .findOne({ courseField, teacherId, subjectId })
      .populate("subjectId")
      .populate({
        path: "teacherId",
        select: ["-loginDetails", "-address", "-socialPortfolio"],
      })
      .populate("courseField");
    if (!data) {
      // If not enrolled, create a new entry in the database
      data = new enrolledTeacher({
        subjectId,
        teacherId,
        courseField,
      });
      await data.save();
      data = await enrolledTeacher
        .findOne({ subjectId, teacherId })
        .populate("subjectId")
        .populate({
          path: "teacherId",
          select: ["-loginDetails", "-address", "-socialPortfolio"],
        })
        .populate("courseField");
      return successResponse(req, res, data, 200); // Respond with success message
    } else if (data.isDelete) {
      const updatedata = await enrolledTeacher
        .findOneAndUpdate(
          { _id: data._id },
          { isDelete: false, isActive: true }
        )
        .populate("subjectId")
        .populate({
          path: "teacherId",
          select: ["-loginDetails", "-address", "-socialPortfolio"],
        })
        .populate("courseField");
      return successResponse(req, res, updatedata, 200); // Respond with success message
    } else {
      return errorResponse(req, res, "Data is already exist", 403); // Respond with error message
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Get all academic entries that are not deleted from the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of academic entries.
 */
export const getAllEnrolledTeachers = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const { subjectId } = req.body;
    let query = {
      isDelete: false,
    };
    if (subjectId) {
      query.subjectId = subjectId;
    }
    if (req.user.role.roleName.toLocaleLowerCase() === "teacher") {
      query.teacherId = req.user.userId;
    }
    const enrolledTeachers = await enrolledTeacher
      .find(query)
      .populate("subjectId")
      .populate({
        path: "teacherId",
        select: ["-loginDetails", "-address", "-socialPortfolio"],
      })
      .populate("courseField")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await enrolledTeacher.countDocuments(query);
    if (!enrolledTeachers.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not exist",
        code: 404,
      }); // Respond with error message if no data found
    } else {
      return successResponseObject({
        req,
        res,
        data: enrolledTeachers,
        code: 200,
        count: countQuery,
      }); // Respond with success message and data
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 }); // Handle any errors that occur during the process
  }
};

/**
 * Get a single academic entry by its ID.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The academic entry with the specified ID.
 */
export const getEnrolledTeacherById = async (req, res) => {
  const { enrollId } = req.body;
  try {
    const data = await enrolledTeacher
      .findById(enrollId)
      .populate("subjectId")
      .populate({
        path: "teacherId",
        select: ["-loginDetails", "-address", "-socialPortfolio"],
      })
      .populate("courseField");
    if (!data) {
      return errorResponse(req, res, "Enrolled teacher not found", 404); // Respond with error message if not found
    }
    return successResponse(req, res, data, 200); // Respond with success message and data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Update an academic entry by its ID.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The updated academic entry.
 */
export const updateEnrolledTeacherById = async (req, res) => {
  const { subjectId, teacherId, courseField, enrollId, isActive } = req.body;
  // console.log(enrollId);
  try {
    const result = await enrolledTeacher
      .findOneAndUpdate(
        { _id: enrollId },
        {
          $set: {
            subjectId,
            teacherId,
            courseField,
            isActive,
          },
        },
        { new: true }
      )
      .populate("subjectId")
      .populate({
        path: "teacherId",
        select: ["-address", "-socialPortfolio"],
      })
      .populate("courseField");
    // console.log(result);
    const findTeacher = await teacherModel.findOne({ _id: result.teacherId });
    await adminModel.findOneAndUpdate(
      { _id: findTeacher.loginDetails },
      { $set: { isActive } },
      { new: true }
    );
    await teacherModel.findOneAndUpdate(
      { _id: result.teacherId },
      { $set: { isActive } },
      { new: true }
    );
    if (!result) {
      return errorResponse(req, res, "Enrolled teacher not found", 404); // Respond with error message if not found
    }
    const collections = [
      chats,
      doubt,
      liveStream,
      notifications,
      playlists,
      videos,
    ];
    //teacherDetails
    const query = {
      $or: [
        { teacherId: findTeacher._id },
        { teacherDetails: findTeacher._id },
        { _id: findTeacher._id },
      ],
    };
    let teacherIsDelete = { isActive: false, isDelete: true };
    let teacherIsActive = { isActive: true, isDelete: false };

    // collections.forEach(async (collectionName) => {
    //   await collectionName.updateMany(
    //     query,
    //     isActive ? teacherIsActive : teacherIsDelete
    //   );
    // });
    return successResponse(req, res, result, 200, "Data updated..."); // Respond with success message and updated data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Delete an academic entry by its ID.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The deleted academic entry.
 */
export const deleteEnrolledTeacherById = async (req, res) => {
  const { enrollId } = req.body;
  try {
    const result = await enrolledTeacher.findByIdAndUpdate(
      enrollId,
      {
        $set: {
          isDelete: true,
          isActive: false,
        },
      },
      { new: true }
    );
    if (!result) {
      return errorResponse(req, res, "Enrolled teacher not found", 404); // Respond with error message if not found
    }
    const findTeacher = await teacherModel.findOne({ _id: result.teacherId });
    await adminModel.findOneAndUpdate(
      { _id: findTeacher.loginDetails },
      { $set: { isDelete: true, isActive: false } },
      { new: true }
    );
    await teacherModel.findOneAndUpdate(
      { _id: findTeacher },
      { $set: { isDelete: true, isActive: false } },
      { new: true }
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
      $and: [
        {
          $or: [
            { teacherId: result.teacherId },
            { teacherDetails: result.teacherId },
            { _id: result.teacherId },
          ],
        },
        {
          $or: [{ subjectId: result.subjectId }, { subject: result.subjectId }],
        },
      ],
    };
    // collections.forEach(async (collectionName) => {
    //   await collectionName.updateMany(query, {
    //     isActive: false,
    //     isDelete: true,
    //     isVerify: false,
    //   });
    // });
    return successResponse(req, res, result, 200); // Respond with success message and deleted data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Get academic entries by subject ID.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of academic entries for the specified subject ID.
 */
export const getEnrolledTeachersBySubjectId = async (req, res) => {
  const { subjectId } = req.body;
  try {
    const enrolledTeachers = await enrolledTeacher
      .find({ subjectId, isDelete: false })
      .populate("subjectId")
      .populate({
        path: "teacherId",
        select: ["-loginDetails", "-address", "-socialPortfolio"],
      })
      .populate("courseField")
      .sort({ _id: -1 });
    if (!enrolledTeachers.length) {
      return errorResponse(req, res, "Enrolled teacher not found", 404); // Respond with error message if not found
    }
    return successResponse(req, res, enrolledTeachers, 200); // Respond with success message and data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Get academic entries by teacher ID.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of academic entries for the specified teacher ID.
 */
export const getByTeacherId = async (req, res) => {
  const { teacherId } = req.body;
  try {
    const enrolledTeachers = await enrolledTeacher
      .find({ teacherId, isDelete: false })
      .populate("subjectId")
      .populate({
        path: "teacherId",
        select: ["-loginDetails", "-address", "-socialPortfolio"],
      })
      .populate("courseField")
      .sort({ _id: -1 });
    if (!enrolledTeachers.length) {
      return errorResponse(req, res, "Enrolled teacher not found", 404); // Respond with error message if not found
    }
    return successResponse(req, res, enrolledTeachers, 200); // Respond with success message and data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Enrolled teachers details by courseFieldId
 */
export const getByCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await enrolledTeacher
      .find({ courseField: courseFieldId, isDelete: false, isActive: true })
      .populate("subjectId")
      .populate("courseField")
      .populate({
        path: "teacherId",
        modal: "teachers",
        select: ["-loginDetails", "-address", "-socialPortfolio"],
      });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

export const getCoursefieldByTeacher = async (req, res) => {
  const { teacherId } = req.body;
  try {
    const enrolledTeachers = await enrolledTeacher.aggregate([
      {
        $match: {
          teacherId: new ObjectId(teacherId),
          isDelete: false,
        },
      },
      {
        $group: {
          _id: "$courseField",
          teacherId: { $first: "$teacherId" },
          isActive: { $first: "$isActive" },
          isDelete: { $first: "$isDelete" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "_id",
          foreignField: "_id",
          as: "courseField",
        },
      },
      {
        $unwind: "$courseField",
      },
    ]);
    if (!enrolledTeachers.length) {
      return errorResponse(req, res, "Enrolled teacher not found", 404); // Respond with error message if not found
    }
    return successResponse(req, res, enrolledTeachers, 200); // Respond with success message and data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description get teacher course of a particular teacher
 * */
export const courseByTeacherId = async (req, res) => {
  const { teacherId } = req.body;
  try {
    const data = await enrolledTeacher.aggregate([
      {
        $match: {
          teacherId: new ObjectId(teacherId),
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "courseField",
          foreignField: "_id",
          as: "courseField",
        },
      },
      {
        $unwind: "$courseField",
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseField.courseId",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $group: {
          _id: "$courses._id",
          descriptions: { $first: "$courses.descriptions" },
          name: { $first: "$courses.name" },
          iconName: { $first: "$courses.iconName" },
          isDelete: { $first: "$courses.isDelete" },
          createdAt: { $first: "$courses.createdAt" },
          updatedAt: { $first: "$courses.updatedAt" },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Enrolled teacher not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
