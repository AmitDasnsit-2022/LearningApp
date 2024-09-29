import bookmarkModel from "../../modules/bookmark.js";
import { errorResponse, successResponse } from "../../helpers/index.js";

/**
 * @description API to bookmark files for students
 */
export const addBookmark = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { videoId, syllabusId, studymaterialId, courseFieldId } = req.body;
    let query = {
      studentId,
    };
    if (videoId) {
      query.videoId = videoId;
    } else if (studymaterialId) {
      query.studymaterialId = studymaterialId;
    } else if (syllabusId) {
      query.syllabusId = syllabusId;
    }
    const existingBookmark = await bookmarkModel.findOne(query);
    if (!existingBookmark) {
      let newBookmark = new bookmarkModel({
        studentId: studentId,
        syllabusId,
        videoId,
        studymaterialId,
        courseFieldId,
      });
      newBookmark = await newBookmark.save();
      return successResponse(
        req,
        res,
        newBookmark,
        200,
        "Bookmark added successfully"
      );
    } else {
      return errorResponse(req, res, "Already exist", 200);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};

/**
 * @description API to get all bookmarked files for students
 */
export const getBookmarked = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { courseFieldId } = req.body;
    const video = await bookmarkModel
      .find({
        studentId: studentId,
        isDelete: false,
        isActive: true,
        courseFieldId: courseFieldId,
        videoId: { $exists: true },
      })
      .populate({
        path: "videoId",
        model: "videos",
        populate: [
          {
            path: "subject",
            model: "subjects",
            populate: [
              {
                path: "courseFieldId",
                model: "courseFields",
                populate: {
                  path: "language",
                  model: "languages",
                },
              },
            ],
          },
          {
            path: "teacherId",
            model: "teachers",
            select: ["fullname", "_id", "teacherBgImage", "image"],
          },
        ],
      });
    const syllabus = await bookmarkModel
      .find({
        studentId: studentId,
        isDelete: false,
        isActive: true,
        courseFieldId: courseFieldId,
        syllabusId: { $exists: true },
      })
      .populate({
        path: "syllabusId",
        populate: {
          path: "courseFieldId",
          populate: {
            path: "language",
          },
        },
      });
    const studyMaterial = await bookmarkModel
      .find({
        studentId: studentId,
        isDelete: false,
        isActive: true,
        courseFieldId: courseFieldId,
        studymaterialId: { $exists: true },
      })
      .populate({
        path: "studymaterialId",
        populate: {
          path: "courseFieldId",
          populate: {
            path: "language",
          },
        },
        populate: {
          path: "subjectId",
        },
      });

    const result = { video, syllabus, studyMaterial };

    if (!video.length && !syllabus.length && !studyMaterial.length) {
      return errorResponse(req, res, "There is no bookmarked items", 404);
    }

    return successResponse(req, res, result, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description API to remove existing bookmarks */

export const removeBookmark = async (req, res) => {
  try {
    console.log(req.body, req.user.userId);
    const studentId = req.user.userId;
    const { bookmarkId, videoId, studymaterialId, syllabusId } = req.body;
    let query = {
      studentId,
    };
    if (bookmarkId) {
      query._id = bookmarkId;
    } else if (videoId) {
      query.videoId = videoId;
    } else if (studymaterialId) {
      query.studymaterialId = studymaterialId;
    } else if (syllabusId) {
      query.syllabusId = syllabusId;
    }
    const bookMarked = await bookmarkModel.deleteOne(query);
    if (!bookMarked) {
      return errorResponse(req, res, "There is no bookmarked items", 404);
    }
    return successResponse(req, res, [], 200, "Bookmark deleted successfully.");
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const checkIsBookmark = async (req, res) => {
  try {
    const videoId = req.body.videoId;
    const studymaterialId = req.body.studyMaterialId;
    const syllabusId = req.body.syllabusId;
    const { userId } = req.user;
    const data = await bookmarkModel.findOne({
      $and: [
        { studentId: userId },
        { videoId: videoId },
        { syllabusId: syllabusId },
        { studymaterialId: studymaterialId },
        { isActive: true },
        { isDelete: false },
      ],
    });
    return data;
  } catch (error) {
    console.log({ error });
    return error.message;
  }
};
