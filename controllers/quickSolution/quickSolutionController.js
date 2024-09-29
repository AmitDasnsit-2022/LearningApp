import videosModal from "../../modules/videos.js";
import {
  errorResponse,
  getVideoDuration,
  successResponse,
  successResponseObject,
  uploadFiles,
} from "../../helpers/index.js";
import playlistModal from "../../modules/playlists.js";
import enrolledTeachers from "../../modules/enrolledTeacher.js";
import AWS from "aws-sdk";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

/**
 * @description Upload quick solution videos for admin
 */
export const addquickSolution = async (req, res) => {
  try {
    if (!req.files) {
      return errorResponse(req, res, "Please select files", 400); // Respond with error message if no files found
    }
    const { thumbnail, videoUrl } = req.files;
    const { title, subjectId, videoIndex, teacherId } = req.body;

    if (thumbnail == undefined || videoUrl == undefined) {
      return errorResponse(req, res, "Thumbnail and video Is required", 400); // Respond with error message if thumbnail or video is missing
    }
    let data = await videosModal
      .findOne({
        $and: [{ title }, { subject: subjectId }],
      })
      .select(["-videoUrl", "-timeDuration"])
      .populate({
        path: "subject",
        populate: {
          path: "courseFieldId",
          populate: {
            path: "courseId",
          },
        },
      });
    if (!data) {
      const thumbnailS3Url = await uploadFiles(thumbnail, "thumbnails");
      const videoS3Url = await uploadFiles(videoUrl, "videos");
      data = new videosModal({
        thumbnail: thumbnailS3Url,
        title: title,
        videoUrl: videoS3Url,
        subject: subjectId,
        videoIndex,
        teacherId: teacherId,
        typeVideo: "quickSolution",
      });
      await data.save();
      return successResponse(req, res, data, 200, "Data added Successfully"); // Respond with success message and data
    } else {
      return errorResponse(req, res, "Data aleardy exist", 409); // Respond with error message if video already exists
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * @description Create quick solution playlist for admin
 */
export const solutionPlaylist = async (req, res) => {
  try {
    const {
      playlistName,
      description,
      courseFieldId,
      languageId,
      subjectId,
      videosIds,
    } = req.body;
    const teacher = await enrolledTeachers.findOne({
      courseField: courseFieldId,
    });
    if (!teacher) {
      return errorResponse(
        req,
        res,
        "Teacher not found in this course field",
        404
      );
    }
    let data = await playlistModal.findOne({
      $and: [
        { playlistName },
        { teacherDetails: teacher.teacherId },
        { courseFieldId },
        { subjectId },
      ],
    });
    if (!data) {
      data = new playlistModal({
        playlistName,
        description,
        teacherDetails: teacher.teacherId,
        courseFieldId,
        languageId,
        subjectId,
        videosDetails: videosIds,
        playlistType: "quickSolution",
      });
      await data.save();
      return successResponse(req, res, data, 200);
    } else if (data.isDelete) {
      let existData = await playlistModal.findOneAndUpdate(
        {
          $and: [
            { playlistName },
            { teacherDetails: teacher.teacherId },
            { courseFieldId },
            { subjectId },
          ],
        },
        { $set: { isDelete: false } },
        { new: true }
      );
      return successResponse(req, res, existData, 200);
    } else {
      return errorResponse(req, res, "Data already Exist", 409);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Controller for updating an existing playlist by ID.
 *
 * @param {*} req The request object containing the playlist details and playlistId.
 * @param {*} res The response object for sending JSON data.
 */
export const updatePlaylist = async (req, res) => {
  try {
    const {
      playlistId,
      playlistName,
      description,
      courseFieldId,
      languageId,
      subjectId,
      videosIds,
      isActive,
    } = req.body;
    let teacher = await enrolledTeachers.findOne({
      courseField: courseFieldId,
    });
    teacher = teacher != null ? teacher.teacherId : undefined;
    const data = await playlistModal.findOneAndUpdate(
      { _id: playlistId },
      {
        $set: {
          playlistName,
          description,
          teacherDetails: teacher,
          courseFieldId,
          languageId,
          subjectId,
          videosDetails: videosIds,
          isActive,
        },
      },
      { new: true }
    );
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

/**
 * @description Get quick solution playlist by courseField Id for students
 */
export const getByCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await playlistModal
      .find({
        courseFieldId: courseFieldId,
        isDelete: false,
        isActive: true,
        playlistType: "quickSolution",
      })
      .populate({
        path: "videosDetails",
        select: ["-videoUrl"],
      })
      .populate({
        path: "teacherDetails",
        select: [
          "-email",
          "-mobile",
          "-resume",
          "-address",
          "-subjects",
          "-teachExams",
          "-socialPortfolio",
        ],
      })
      .populate({ path: "courseFieldId" })
      .populate({ path: "subjectId" })
      .populate({ path: "languageId" });
    if (!data.length) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Get quick solution playlist by subject Id for students
 */
export const getBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await playlistModal
      .find({
        subjectId: subjectId,
        isDelete: false,
        isActive: true,
        playlistType: "quickSolution",
      })
      .populate({
        path: "videosDetails",
      })
      .populate({
        path: "teacherDetails",
        select: [
          "-email",
          "-mobile",
          "-resume",
          "-address",
          "-subjects",
          "-teachExams",
          "-socialPortfolio",
        ],
      })
      .populate({ path: "subjectId" })
      .populate({ path: "languageId" });
    const datas = await playlistModal.aggregate([
      {
        $match: {
          subjectId: new ObjectId(subjectId),
          isDelete: false,
          isActive: true,
          playlistType: "quickSolution",
        },
      },
      {
        $lookup: {
          from: "videos",
          let: { videosId: "$videosDetails" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$videosId"] },
              },
            },
            {
              $lookup: {
                from: "bookmarks",
                localField: "_id",
                foreignField: "videoId",
                as: "bookmark",
              },
            },
            {
              $addFields: {
                isBookmarked: {
                  $cond: {
                    if: { $gt: [{ $size: "$bookmark" }, 0] },
                    then: true,
                    else: false,
                  },
                },
              },
            },
            {
              $lookup: {
                from: "teachers",
                // localField: "teacherId",
                // foreignField: "_id",
                let: { teacherId: "$teacherId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$teacherId"],
                      },
                    },
                  },
                  {
                    $project: {
                      fullname: 1,
                      image: 1,
                      teacherBgImage: 1,
                    },
                  },
                ],
                as: "teacherId",
              },
            },
            {
              $unwind: "$teacherId",
            },
            {
              $project: {
                bookmark: 0,
              },
            },
          ],
          as: "videosDetails",
        },
      },
      {
        $lookup: {
          from: "teachers",
          let: { teacherId: "$teacherDetails" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$teacherId"] },
              },
            },
            {
              $project: {
                email: 0,
                mobile: 0,
                resume: 0,
                address: 0,
                subjects: 0,
                teachExams: 0,
                socialPortfolio: 0,
              },
            },
          ],
          as: "teacherDetails",
        },
      },
      {
        $addFields: {
          teacherDetails: {
            $arrayElemAt: ["$teacherDetails", 0],
          },
        },
      },
      {
        $lookup: {
          from: "languages",
          localField: "languageId",
          foreignField: "_id",
          as: "languageId",
        },
      },
      {
        $addFields: {
          languageId: {
            $arrayElemAt: ["$languageId", 0],
          },
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
        $addFields: {
          subjectId: {
            $arrayElemAt: ["$subjectId", 0],
          },
        },
      },
      {
        $project: {
          videosDetails: {
            bookmark: 0,
          },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, datas, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Get quick solution playlist by subject Id for students
 */
export const getQuickPlaylist = async (req, res) => {
  try {
    const { subjectId, playlistType } = req.body;
    const data = await playlistModal
      .find({
        subjectId: subjectId,
        isDelete: false,
        isActive: true,
        playlistType: playlistType ? playlistType : "quickSolution",
      })
      .select(["_id", "playlistName"]);
    if (!data.length) {
      return successResponseObject({
        req,
        res,
        msg: "Data not found",
        code: 200,
        data: [],
      });
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Get quick solution videos by playlist Id for students
 */
export const getvideoByPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const data = await playlistModal
      .find({
        _id: playlistId,
        isDelete: false,
        isActive: true,
        playlistType: "quickSolution",
      })
      .select(["_id", "playlistName"])
      .populate({
        path: "videosDetails",
        populate: { path: "subject" },
        match: {
          isActive: true,
          isDelete: false,
        },
      });
    if (!data.length) {
      return errorResponse(req, res, "Data Not Found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};
