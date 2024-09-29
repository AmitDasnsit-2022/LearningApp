import {
  successResponseObject,
  errorResponseObject,
  uploadFiles,
} from "../../helpers/index.js";
import batchModel from "../../modules/courseBatch.js";

/**
 * @description Api for adding new batches of courses
 */
export const addBatch = async (req, res) => {
  try {
    const { courseFieldId, title, description, aboutCourse } = req.body;
    const existingBatch = await batchModel.findOne({
      courseFieldId: courseFieldId,
    });
    let filedata = null;
    if (!existingBatch) {
      if (req.files) {
        const { pdfUrl } = req.files;
        filedata = await uploadFiles(pdfUrl, "batchs");
      }
      const newBatch = new batchModel({
        courseFieldId,
        title,
        description,
        aboutCourse,
        pdffile: [{ fileUrl: filedata }],
      });
      const data = await newBatch.save();
      return successResponseObject({ req, res, data, code: 200 });
    } else if (existingBatch.isDelete) {
      if (req.files) {
        const { pdfUrl } = req.files;
        filedata = await uploadFiles(pdfUrl, "batchs");
      }
      const updateExisting = await batchModel.findOneAndUpdate(
        { courseFieldId: courseFieldId },
        {
          $set: {
            isActive: true,
            isDelete: false,
            title,
            description,
            aboutCourse,
            pdffile: [{ fileUrl: filedata }],
          },
        },
        { new: true }
      );
      return successResponseObject({
        req,
        res,
        data: updateExisting,
        code: 200,
      });
    } else {
      return errorResponseObject({
        req,
        res,
        error: "Data already exists",
        code: 403,
      });
    }
  } catch (error) {
    console.error(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description Api for get all batches of courses
 */

export const getAllBatch = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    let query = {
      isDelete: false,
    };
    if (courseFieldId) {
      query.courseFieldId = courseFieldId;
    }
    const data = await batchModel.find(query).populate("courseFieldId");
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({
      req,
      res,
      data,
      code: 200,
    });
  } catch (error) {
    console.error(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description Api for updating batches of courses
 */

export const updateBatch = async (req, res) => {
  try {
    const { title, description, isActive, batchId, aboutCourse } = req.body;
    const data = await batchModel.findOneAndUpdate(
      { _id: batchId },
      {
        $set: {
          title: title,
          description: description,
          isActive: isActive,
          aboutCourse: aboutCourse,
        },
      },
      { new: true }
    );
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({
      req,
      res,
      data,
      code: 200,
      msg: "Batch succesfully updated",
    });
  } catch (error) {
    console.error(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description Api for deleting batches of courses
 */
export const deleteBatch = async (req, res) => {
  try {
    const { batchId } = req.body;
    const data = await batchModel.findOneAndUpdate(
      { _id: batchId },
      {
        $set: {
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
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({
      req,
      res,
      data,
      code: 200,
      msg: "Batch deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description Api for get batches of courses by coursefield for students
 */

export const batchbyCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await batchModel.findOne({
      courseFieldId: courseFieldId,
      isActive: true,
      isDelete: false,
    });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({
      req,
      res,
      data,
      code: 200,
    });
  } catch (error) {
    console.error(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
