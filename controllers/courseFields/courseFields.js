import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import courseFields from "../../modules/courseFields.js";

/**
 * Add a new course field.
 *
 * @param {*} req The request object containing the following fields:
 *                - name: The name of the course field to be added.
 *                - courseId: The ID of the course to which the field belongs.
 *                - languageId: The ID of the language associated with the field.
 *                - iconId: The ID of the icon associated with the field.
 * @param {*} res The response object for sending JSON data.
 */
export const addCourseField = async (req, res) => {
  try {
    let { name, courseId, languageId, iconId } = req.body;
    name.toUpperCase();
    let data = await courseFields.findOne({ $and: [{ name }, { courseId }] });
    if (!data) {
      data = new courseFields({
        name,
        courseId,
        language: languageId,
        iconName: iconId,
      });
      await data.save();
      await data.populate("iconName");
      return successResponse(req, res, data, 200, "Data Add successful");
    } else if (data.isDelete) {
      let existData = await courseFields.findOneAndUpdate(
        { $and: [{ name }, { courseId }] },
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
 * Get all active course fields.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllCourseField = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const { courseId } = req.body;
    let query = { isDelete: false };
    if (courseId) {
      query.courseId = courseId;
    }
    const countQuery = await courseFields.countDocuments(query);
    const data = await courseFields
      .find(query)
      .populate("iconName", "fileUrl name -_id")
      .populate("courseId")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        count: countQuery,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Get all active course fields for users.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllCourseFieldUser = async (req, res) => {
  try {
    const { limit, skip } = req.body;
    const data = await courseFields
      .find({ $and: [{ isDelete: false }, { isActive: true }] })
      .populate("iconName", "fileUrl name -_id")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
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
 * Get course fields by courseId.
 *
 * @param {*} req The request object containing the following fields:
 *                - courseId: The ID of the course for which the fields are to be retrieved.
 * @param {*} res The response object for sending JSON data.
 */
export const getByCourseId = async (req, res) => {
  try {
    const { courseId } = req.body;
    const data = await courseFields
      .find({ $and: [{ courseId: courseId }, { isDelete: false }] })
      .populate("iconName", "fileUrl name -_id")
      .populate("courseId")
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
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
 * Delete a course field by courseFieldId.
 *
 * @param {*} req The request object containing the following fields:
 *                - courseFieldId: The ID of the course field to be deleted.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const subcourse = await courseFields.findOneAndUpdate(
      {
        _id: courseFieldId,
      },
      {
        $set: {
          isActive: false,
          isDelete: true,
        },
      }
    );
    if (!subcourse) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, [], 200, "Data deleted...");
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Update a course field by courseFieldId.
 *
 * @param {*} req The request object containing the following fields:
 *                - courseFieldId: The ID of the course field to be updated.
 *                - name: The updated name of the course field.
 *                - courseId: The updated ID of the course to which the field belongs.
 *                - languageId: The updated ID of the language associated with the field.
 *                - iconId: The updated ID of the icon associated with the field.
 * @param {*} res The response object for sending JSON data.
 */
export const updateCourseField = async (req, res) => {
  try {
    let { courseFieldId, name, courseId, languageId, iconId, isActive } =
      req.body;
    const data = await courseFields
      .findOneAndUpdate(
        { _id: courseFieldId },
        {
          $set: {
            name,
            courseId,
            language: languageId,
            iconName: iconId,
            isActive,
          },
        },
        { new: true }
      )
      .populate({ path: "iconName", select: ["name", "fileUrl"] })
      .populate("courseId")
      .sort({ _id: -1 });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**Search data to use in website as teacher or students */
export const searchData = async (req, res) => {
  try {
    let { text } = req.body;
    const data = await courseFields
      .find({
        name: { $regex: text, $options: "i" },
        isActive: true,
        isDelete: false,
      })
      .populate({
        path: "courseId",
        select: "name",
      });
    if (!data) {
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
 * @description total number of courseFields
 */
export const totalCourseFields = async (req, res) => {
  try {
    const countQuery = await courseFields.countDocuments({ isDelete: false });
    return countQuery;
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
