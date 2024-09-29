import { query } from "express";
import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import enrolledTeacher from "../../modules/enrolledTeacher.js";
import Overview from "../../modules/overview.js";
import teacherModal from "../../modules/teachers.js";

/**
 * Controller for adding a new overview.
 *
 * @param {*} req The request object containing the overview details.
 * @param {*} res The response object for sending JSON data.
 */
export const addNewOverview = async (req, res) => {
  try {
    const {
      title,
      description,
      secondaryTitle,
      secondaryDescription,
      imageUrl,
      subjectId,
      courseFieldId,
    } = req.body;
    let data = await Overview.findOne({ courseFieldId: courseFieldId });
    if (!data) {
      data = new Overview({
        title,
        description,
        image: imageUrl,
        subjectId,
        courseFieldId,
        secondaryTitle,
        secondaryDescription,
      });
      await data.save();
      await data.populate("courseFieldId");
      return successResponse(
        req,
        res,
        data,
        200,
        "Overview added successfully"
      );
    } else if (data.isDelete) {
      let existData = await Overview.findOneAndUpdate(
        { courseFieldId: courseFieldId },
        {
          $set: {
            isDelete: false,
            isActive: true,
            title,
            description,
            image: imageUrl,
            subjectId,
            secondaryTitle,
            secondaryDescription,
          },
        },
        { new: true }
      ).populate("courseFieldId");
      return successResponse(
        req,
        res,
        existData,
        200,
        "Overview added successfully"
      );
    } else {
      return errorResponse(req, res, "Data is already exist", 403);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for updating an existing overview by ID.
 *
 * @param {*} req The request object containing the overview details and overviewId.
 * @param {*} res The response object for sending JSON data.
 */
export const updateOverview = async (req, res) => {
  try {
    const {
      overviewId,
      title,
      description,
      imageUrl,
      secondaryTitle,
      secondaryDescription,
      subjectId,
      courseFieldId,
      isActive,
    } = req.body;

    const updatedOverview = await Overview.findByIdAndUpdate(
      { _id: overviewId },
      {
        $set: {
          title,
          description,
          image: imageUrl,
          subjectId,
          courseFieldId,
          secondaryTitle,
          secondaryDescription,
          isActive,
        },
      },
      { new: true }
    )
      .populate({ path: "subjectId", populate: "courseFieldId" })
      .populate("courseFieldId");

    if (!updatedOverview) {
      return errorResponse(req, res, "Data not found", 404);
    }

    return successResponse(
      req,
      res,
      updatedOverview,
      200,
      "Overview Update successfully"
    );
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for retrieving all existing overviews that are not marked as deleted.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllOverviews = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const overviews = await Overview.find({ isDelete: false })
      .populate({ path: "courseFieldId" })
      .populate({
        path: "subjectId",
        populate: {
          path: "courseFieldId",
        },
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await Overview.countDocuments({ isDelete: false });
    if (!overviews.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, overviews, 200, "", "", countQuery);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for retrieving an overview by ID.
 *
 * @param {*} req The request object containing the overviewId.
 * @param {*} res The response object for sending JSON data.
 */
export const getOverviewById = async (req, res) => {
  try {
    const { overviewId } = req.body;

    const overview = await Overview.findById(overviewId).populate({
      path: "subjectId",
      populate: {
        path: "courseFieldId",
        populate: {
          path: "courseId",
        },
      },
    });

    if (!overview) {
      return res.status(404).json({ message: "Overview not found" });
    }

    return successResponse(req, res, overview, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for deleting an overview by ID.
 *
 * @param {*} req The request object containing the overviewId.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteOverview = async (req, res) => {
  try {
    const { overviewId } = req.body;

    const deletedOverview = await Overview.findByIdAndUpdate(
      { _id: overviewId },
      { $set: { isDelete: true } },
      { new: true }
    );

    if (!deletedOverview) {
      return res.status(404).json({ message: "Overview not found" });
    }
    return successResponse(req, res, [], 200, "Overview deleted successfully");
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for retrieving an overview and related data by subject ID.
 *
 * @param {*} req The request object containing the subjectId.
 * @param {*} res The response object for sending JSON data.
 */
export const getByAdminCourse = async (req, res) => {
  try {
    const { courseFieldId, subjectId } = req.body;
    let query = {
      courseFieldId: courseFieldId,
      isDelete: false,
    };
    if (subjectId) {
      query.subjectId = subjectId;
    }
    const data = await Overview.find(query)
      .populate("courseFieldId")
      .populate("subjectId");
    if (!data.length) {
      return res.status(404).json({ message: "Overview not found" });
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for retrieving an overview and related teacher data by courseField and subject ID.
 *
 * @param {*} req The request object containing the subjectId.
 * @param {*} res The response object for sending JSON data.
 */
export const getbycourseFieldId = async (req, res) => {
  try {
    const { courseFieldId, subjectId } = req.body;
    let query = {
      courseFieldId: courseFieldId,
      isDelete: false,
      isActive: true,
    };
    if (subjectId) {
      query.subjectId = subjectId;
    }
    const teacherdata = await enrolledTeacher
      .find({ isDelete: false, courseField: { $eq: courseFieldId } })
      .limit(5)
      .populate({
        path: "subjectId",
        model: "subjects",
        select: "subjectName",
        match: {
          isDelete: false,
          isActive: true,
        },
      })
      .populate({
        path: "teacherId",
        model: "teachers",
        select: [
          "fullname",
          "designation",
          "qualification",
          "experience",
          "image",
        ],
        match: {
          isDelete: false,
          isActive: true,
        },
      });
    let data = await Overview.findOne(query).populate({
      path: "courseFieldId",
      match: {
        isDelete: false,
        isActive: true,
      },
    });
    if (!data) {
      return errorResponse(req, res, "Overview not found", 404);
    }
    const { ...rest } = data.toObject();
    const response = { ...rest, teacherdata: teacherdata };
    data = response;
    return successResponse(req, res, data, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
