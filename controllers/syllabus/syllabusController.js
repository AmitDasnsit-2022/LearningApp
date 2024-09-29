import {
  errorResponse,
  successResponse,
  successResponseObject,
  uploadFiles,
} from "../../helpers/index.js";
import courseFields from "../../modules/courseFields.js";
import students from "../../modules/students.js";
import subjects from "../../modules/subjects.js";
import syllabusModal from "../../modules/syllabus.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import AWS from "aws-sdk";
import { checkIsBookmark } from "../bookmark/bookmarkController.js";

AWS.config.update({
  region: process.env.region,
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
});
/**
 * Add a new syllabus entry to the database.
 *
 * @param {*} req The request object containing the details of the new syllabus to be added.
 * @param {*} res The response object for sending JSON data.
 */
export const addSyllabus = async (req, res) => {
  try {
    const { subjectId, courseFieldId, title, description } = req.body;
    let filedata;
    if (req.files) {
      const { fileUrl } = req.files;
      filedata = await uploadFiles(fileUrl, "syllabus");
    }
    const data = await syllabusModal
      .findOne({
        $and: [{ subjectId }, { courseFieldId }, { isDelete: false }],
      })
      .populate("subjectId")
      .populate("courseFieldId");
    if (!data) {
      const adddata = new syllabusModal({
        subjectId,
        courseFieldId,
        fileUrl: filedata,
        description,
        title,
      });
      await adddata.save();
      await adddata.populate({ path: "courseFieldId subjectId" });
      return successResponse(req, res, adddata, 200);
    } else {
      return errorResponse(req, res, "Already Exist", 403);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Update an existing syllabus entry in the database.
 *
 * @param {*} req The request object containing the syllabus ID and updated details.
 * @param {*} res The response object for sending JSON data.
 */
export const updateSyllabus = async (req, res) => {
  try {
    const { syllabusId, subjectId, description, title, isActive } = req.body;
    const data = await syllabusModal.findOne({
      _id: syllabusId,
      isDelete: false,
    });
    let filedata;
    if (req.files) {
      const { fileUrl } = req.files;
      filedata = await uploadFiles(fileUrl, "syllabus");
    }
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      const syllabusdata = await syllabusModal
        .findOneAndUpdate(
          { _id: syllabusId },
          {
            $set: {
              subjectId,
              fileUrl: filedata,
              description,
              title,
              isActive,
            },
          },
          { new: true }
        )
        .populate("subjectId")
        .populate("courseFieldId");
      return successResponse(req, res, syllabusdata, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Delete a syllabus entry by marking it as deleted.
 *
 * @param {*} req The request object containing the syllabus ID.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteSyllabus = async (req, res) => {
  try {
    const { syllabusId } = req.body;
    const syllabusdata = await syllabusModal.findOneAndUpdate(
      { _id: syllabusId },
      {
        $set: {
          isDelete: true,
          isActive: false,
        },
      },
      { new: true }
    );
    if (syllabusdata) {
      return successResponse(req, res, syllabusdata, 200);
    } else {
      return errorResponse(req, res, "Data not found", 404);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all syllabus entries that are not marked as deleted.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllSyllabus = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const { courseFieldId } = req.body;
    let query = {
      isDelete: false,
    };
    if (courseFieldId) {
      query.courseFieldId = courseFieldId;
    }
    if (req.body.subjectId) {
      query.subjectId = req.body.subjectId;
    }
    const syllabusdata = await syllabusModal
      .find(query)
      .populate("subjectId")
      .populate({
        path: "courseFieldId",
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await syllabusModal.countDocuments(query);
    if (!syllabusdata.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, syllabusdata, 200, "", "", countQuery);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get syllabus entries for a student based on their enrolled course field.
 *
 * @param {*} req The request object containing the student ID and course field ID.
 * @param {*} res The response object for sending JSON data.
 */
export const studentSyllabus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseFieldId } = req.body;
    const syllabusData = await courseFields.aggregate([
      {
        $match: {
          _id: new ObjectId(courseFieldId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "subjects",
          let: { courseFieldId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$courseFieldId", "$$courseFieldId"],
                },
                isActive: true,
                isDelete: false,
              },
            },
            {
              $lookup: {
                from: "syllabuses",
                let: { subjectId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$subjectId", "$$subjectId"] },
                          { $eq: ["$courseFieldId", "$$courseFieldId"] },
                        ],
                      },
                      isActive: true,
                      isDelete: false,
                    },
                  },
                  {
                    $lookup: {
                      from: "bookmarks",
                      let: {
                        syllabusId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                { $eq: ["$syllabusId", "$$syllabusId"] },
                                {
                                  $eq: ["$studentId", new ObjectId(userId)],
                                },
                                { isActive: true },
                                { isDelete: false },
                              ],
                            },
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
                          if: {
                            $gt: [{ $size: "$bookmarks" }, 0],
                          },
                          then: true,
                          else: false,
                        },
                      },
                    },
                  },
                  {
                    $project: {
                      bookmarks: 0,
                    },
                  },
                ],
                as: "syllabuses",
              },
            },
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
            {
              $project: {
                _id: 1,
                subjectName: 1,
                courseFieldId: 1,
                iconName: 1,
                isActive: 1,
                isDelete: 1,
                createdAt: 1,
                updatedAt: 1,
                __v: 1,
                syllabuses: 1,
                isBookmark: 1,
              },
            },
          ],
          as: "subjects",
        },
      },
    ]);

    if (syllabusData) {
      return successResponse(req, res, syllabusData, 200);
    } else {
      return errorResponse(req, res, "Data not found", 404);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getById = async (req, res) => {
  try {
    const { syllabusId } = req.body;
    const bookmarked = await checkIsBookmark(req, res);
    const isBookmarked = bookmarked !== null ? true : false;
    const syllabusData = await syllabusModal.findOne({
      _id: syllabusId,
      isActive: true,
      isDelete: false,
    });
    if (!syllabusData) {
      return errorResponse(req, res, "Data not found", 404);
    }
    const file = syllabusData.fileUrl;
    return successResponseObject({
      req,
      res,
      data: { file, isBookmarked },
      code: 200,
    });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
