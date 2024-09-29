import { errorResponse, successResponse } from "../../helpers/index.js";
import courses from "../../modules/courses.js";
import language from "../../modules/language.js";
import academic from "../../modules/academic.js";
import courseFields from "../../modules/courseFields.js";

/**
 * Add a new course.
 *
 * @param {*} req The request object containing the following fields:
 *                - name: The name of the course to be added.
 *                - descriptions: The descriptions of the course.
 *                - iconId: The ID of the icon associated with the course.
 * @param {*} res The response object for sending JSON data.
 */
export const addCourse = async (req, res) => {
  try {
    const { name, descriptions, iconId } = req.body;
    let course = await courses.findOne({ name });
    if (!course) {
      course = new courses({
        name,
        descriptions,
        iconName: iconId,
      });
      await course.save();
      await course.populate("iconName");
      return successResponse(req, res, course, 200, "Data Add successful");
    } else if (course.isDelete) {
      let existData = await courses.findOneAndUpdate(
        { name },
        { $set: { isDelete: false, isActive: true } },
        { new: true }
      );
      return successResponse(req, res, existData, 200, "Data Add successful");
    } else {
      return errorResponse(req, res, `${name} is already Exist`, 400);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all courses along with additional information like course fields, language, and academic data.
 *
 * @param {*} req The request object containing the following optional fields:
 *                - skip: The number of documents to skip in the result (default is 1).
 *                - limit: The maximum number of documents to return in the result (default is 100).
 * @param {*} res The response object for sending JSON data.
 */
export const getAllCourse = async (req, res) => {
  try {
    // Query to get all courses along with course fields and their corresponding icons
    let selectYourGoal = await courses.aggregate([
      {
        $match: { $and: [{ isActive: true }, { isDelete: false }] },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "_id",
          foreignField: "courseId",
          pipeline: [
            {
              $match: { $and: [{ isActive: true }, { isDelete: false }] },
            },
          ],
          as: "courseFields",
        },
      },
      {
        $unwind: "$courseFields",
      },
      // $lookup to get icons for courseFields
      {
        $lookup: {
          from: "filesmodals",
          let: { iconName: "$courseFields.iconName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$iconName"],
                },
              },
            },
            {
              $project: {
                fileUrl: 1,
              },
            },
          ],
          as: "courseFields.iconName",
        },
      },
      {
        $unwind: {
          path: "$courseFields.iconName",
          preserveNullAndEmptyArrays: true,
        },
      },
      // $lookup to get icon for the course
      {
        $lookup: {
          from: "filesmodals",
          let: { iconName: "$iconName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$iconName"],
                },
              },
            },
            {
              $project: {
                fileUrl: 1,
              },
            },
          ],
          as: "iconName",
        },
      },
      {
        $unwind: {
          path: "$iconName",
          preserveNullAndEmptyArrays: true,
        },
      },
      // $group to group the results by courseId and accumulate courseFields
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          iconName: { $first: "$iconName" },
          descriptions: { $first: "$descriptions" },
          isActive: { $first: "$isActive" },
          isDelete: { $first: "$isDelete" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          __v: { $first: "$__v" },
          courseFields: { $push: "$courseFields" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get additional data for chooseLanguage and selectExamAcademic
    const chooseLanguage = await language
      .find({ isDelete: false, isActive: true })
      .populate({
        path: "iconName",
        modal: "filesModal",
        select: "fileUrl",
      });
    const selectExamAcademic = await academic
      .find({ isDelete: false, isActive: true })
      .populate({
        path: "iconName",
        modal: "filesModal",
        select: "fileUrl",
      });

    if (selectYourGoal.length) {
      return successResponse(
        req,
        res,
        { selectYourGoal, chooseLanguage, selectExamAcademic },
        200
      );
    } else {
      return errorResponse(req, res, "Data not found", 400);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all active courses for admin.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllCourseAdmin = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const data = await courses
      .find({ isDelete: false })
      .populate("iconName", "fileUrl name -_id")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await courses.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 400);
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Delete a course by courseId.
 *
 * @param {*} req The request object containing the following fields:
 *                - courseId: The ID of the course to be deleted.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await courses.findOneAndUpdate(
      {
        _id: courseId,
      },
      {
        $set: {
          isActive: false,
          isDelete: true,
        },
      }
    );
    if (!course) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, "Data deleted...", 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Update a course by courseId.
 *
 * @param {*} req The request object containing the following fields:
 *                - courseId: The ID of the course to be updated.
 *                - name: The updated name of the course.
 *                - descriptions: The updated descriptions of the course.
 *                - iconId: The updated ID of the icon associated with the course.
 * @param {*} res The response object for sending JSON data.
 */
export const updateCourse = async (req, res) => {
  try {
    const { courseId, name, descriptions, iconId, isActive } = req.body;
    const data = await courses
      .findOneAndUpdate(
        { _id: courseId },
        { $set: { name, descriptions, iconName: iconId, isActive: isActive } },
        { new: true }
      )
      .populate({ path: "iconName", select: ["name", "fileUrl"] })
      .sort({ _id: -1 });
    if (!data) {
      return errorResponse(req, res, "Data not Found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description total number of courses
 */

export const totalCourses = async (req, res) => {
  try {
    const countQuery = await courses.countDocuments({ isDelete: false });
    return countQuery;
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
