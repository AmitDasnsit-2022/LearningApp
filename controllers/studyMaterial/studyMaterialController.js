import {
  errorResponse,
  errorResponseObject,
  successResponseObject,
  uploadFiles,
} from "../../helpers/index.js";
import enrolledTeacher from "../../modules/enrolledTeacher.js";
import studyMaterial from "../../modules/studyMaterial.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { checkIsBookmark } from "../bookmark/bookmarkController.js";

/**
 * Add a new study material entry to the database.
 *
 * @param {*} req The request object containing the details of the new study material to be added.
 * @param {*} res The response object for sending JSON data.
 */
export const addnew = async (req, res) => {
  try {
    const { title, description, subjectId, courseFieldId, playlistId } =
      req.body;
    let filedata = null;
    if (req.files) {
      const { fileUrl } = req.files;
      filedata = await uploadFiles(fileUrl, "studymaterials");
    }
    let data = new studyMaterial({
      title,
      description,
      fileUrl: filedata,
      subjectId,
      courseFieldId,
      playlistId,
    });
    await data.save();
    return successResponseObject({
      req,
      res,
      data,
      code: 200,
      msg: "Data Added Successfully...",
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Update an existing study material entry in the database.
 *
 * @param {*} req The request object containing the study material ID and updated details.
 * @param {*} res The response object for sending JSON data.
 */
export const updateData = async (req, res) => {
  try {
    const {
      studyMaterialId,
      title,
      description,
      subjectId,
      courseFieldId,
      isActive,
      playlistId,
    } = req.body;
    let filedata;
    if (req.files) {
      const { fileUrl } = req.files;
      filedata = await uploadFiles(fileUrl, "studymaterial");
    }
    let data = await studyMaterial
      .findOneAndUpdate(
        { _id: studyMaterialId },
        {
          $set: {
            title,
            description,
            fileUrl: filedata,
            subjectId,
            courseFieldId,
            isActive,
            playlistId,
          },
        },
        { new: true }
      )
      .populate("courseFieldId")
      .populate("subjectId");
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({
      req,
      res,
      error: error.message,
      code: 500,
    });
  }
};

/**
 * Get a study material entry by its ID.
 *
 * @param {*} req The request object containing the study material ID.
 * @param {*} res The response object for sending JSON data.
 */
export const getbyId = async (req, res) => {
  try {
    const { studyMaterialId } = req.body;
    let data = await studyMaterial
      .findOne({ _id: studyMaterialId, isDelete: false })
      .populate({
        path: "subjectId",
        select: ["subjectName"],
        match: {
          isDelete: false,
          isActive: true,
        },
      });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Get study materials by subject ID for admin
 *
 * @param {*} req The request object containing the subject ID.
 * @param {*} res The response object for sending JSON data.
 */
export const getbysubjectid = async (req, res) => {
  try {
    const { subjectId } = req.body;
    let data = await studyMaterial
      .find({ subjectId: subjectId, isDelete: false })
      .populate({
        path: "subjectId",
        match: {
          isDelete: false,
          isActive: true,
        },
      })
      .sort("createdAt");
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
/**
 * Get study materials by subject ID for students.
 *
 * @param {*} req The request object containing the subject ID.
 * @param {*} res The response object for sending JSON data.
 */
export const studymaterialBySubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const { userId } = req.user;
    let data = await studyMaterial.aggregate([
      {
        $match: {
          subjectId: new ObjectId(subjectId),
          isDelete: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "bookmarks",
          let: { studymaterialId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    studentId: new ObjectId(userId),
                    $expr: {
                      $eq: ["$studymaterialId", "$$studymaterialId"],
                    },
                    isActive: true,
                    isDelete: false,
                  },
                ],
              },
            },
          ],
          as: "bookmarks",
        },
      },
      {
        $addFields: {
          isBookmark: {
            $cond: {
              if: { $gt: [{ $size: "$bookmarks" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $lookup: {
          from: "subjects",
          pipeline: [
            {
              $match: {
                _id: new ObjectId(subjectId),
                isActive: true,
                isDelete: false,
              },
            },
          ],
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
/**
 * Get study materials by studyMaterial ID.
 *
 * @param {*} req The request object containing the subject ID.
 * @param {*} res The response object for sending JSON data.
 */
export const studyMaterialById = async (req, res) => {
  try {
    const { studyMaterialId } = req.body;
    let data = await studyMaterial.findOne({
      _id: studyMaterialId,
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

    const bookmarkeddata = await checkIsBookmark(req, res);
    const isBookmarked = bookmarkeddata !== null ? true : false;
    const file = data.fileUrl;
    return successResponseObject({
      req,
      res,
      data: { file, isBookmarked },
      code: 200,
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Get study materials by course field ID.
 *
 * @param {*} req The request object containing the course field ID.
 * @param {*} res The response object for sending JSON data.
 */
export const getByCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    let data = await studyMaterial
      .find({ courseFieldId: courseFieldId, isDelete: false, isActive: true })
      .populate({
        path: "courseFieldId",
        select: ["name"],
        match: {
          isDelete: false,
          isActive: true,
        },
      })
      .populate({
        path: "subjectId",
        select: ["subjectName"],
        match: {
          isDelete: false,
          isActive: true,
        },
      })
      .select(["title", "description", "fileUrl", "createdAt"])
      .sort("createdAt");
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Get all study materials that are not marked as deleted.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getall = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    let data = await studyMaterial
      .find({ isDelete: false })
      .populate({
        path: "courseFieldId",
        select: ["courseFieldId"],
        match: {
          isDelete: false,
          isActive: true,
        },
      })
      .sort("createdAt")
      .skip(skip)
      .limit(limit);
    const countQuery = await studyMaterial.countDocuments({ isDelete: false });
    if (!data.length) {
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
      count: countQuery,
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Delete a study material entry by marking it as deleted.
 *
 * @param {*} req The request object containing the study material ID.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteData = async (req, res) => {
  try {
    const { studyMaterialId } = req.body;
    let data = await studyMaterial.findOneAndUpdate(
      { _id: studyMaterialId },
      { $set: { isDelete: true } },
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
      data: [],
      code: 200,
      msg: "Data Deleted successfully",
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const getByTeachereId = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await enrolledTeacher.aggregate([
      { $match: { teacherId: new ObjectId(teacherId) } },
      {
        $lookup: {
          from: "studymaterials",
          localField: "courseField",
          foreignField: "courseFieldId",
          as: "studyMaterials",
        },
      },
    ]);
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Study material Not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Get Study material by playlist or chapter Id
 */
export const getByPlaylistId = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const { playlistId } = req.body;
    const { userId } = req.user;
    const data = await studyMaterial
      .aggregate([
        {
          $match: {
            isActive: true,
            isDelete: false,
            playlistId: new ObjectId(playlistId),
          },
        },
        {
          $lookup: {
            from: "subjects",
            localField: "subjectId",
            foreignField: "_id",
            as: "subjectId",
          },
        },
        {
          $unwind: "$subjectId",
        },
        {
          $lookup: {
            from: "coursefields",
            localField: "courseFieldId",
            foreignField: "_id",
            as: "courseFieldId",
          },
        },
        {
          $unwind: "$courseFieldId",
        },
        {
          $lookup: {
            from: "bookmarks",
            let: { studymaterialId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    {
                      studentId: new ObjectId(userId),
                      $expr: {
                        $eq: ["$studymaterialId", "$$studymaterialId"],
                      },
                      isActive: true,
                      isDelete: false,
                    },
                  ],
                },
              },
            ],
            as: "bookmarks",
          },
        },
        {
          $addFields: {
            isBookmark: {
              $cond: {
                if: { $gt: [{ $size: "$bookmarks" }, 0] },
                then: true,
                else: false,
              },
            },
          },
        },
      ])
      .skip(skip)
      .limit(limit);
    const count = await studyMaterial.countDocuments({
      isDelete: false,
      isActive: true,
      playlistId: new ObjectId(playlistId),
    });
    return successResponseObject({ req, res, data, code: 200, count: count });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Get Study material by playlist Id for admin
 */
export const byPlaylistId = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const data = await studyMaterial.aggregate([
      {
        $match: {
          isDelete: false,
          playlistId: new ObjectId(playlistId),
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subjectId",
        },
      },
      {
        $unwind: "$subjectId",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "courseFieldId",
          foreignField: "_id",
          as: "courseFieldId",
        },
      },
      {
        $unwind: "$courseFieldId",
      },
    ]);
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
