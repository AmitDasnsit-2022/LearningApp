import {
  errorResponse,
  getVideoDuration,
  successResponse,
  uploadFiles,
} from "../../helpers/index.js";
import videosModal from "../../modules/videos.js";
import fs from "fs";
import AWS from "aws-sdk";
import enrolledTeacher from "../../modules/enrolledTeacher.js";
import { checkIsBookmark } from "../bookmark/bookmarkController.js";
import playlistsModal from "../../modules/playlists.js";
import mongoose from "mongoose";
import studyMaterial from "../../modules/studyMaterial.js";
import videoLogsModel from "../../modules/videoLogs.js";
const ObjectId = mongoose.Types.ObjectId;

AWS.config.update({
  region: process.env.region,
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
});

/**
 * Upload videos along with their thumbnails and other details to the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The newly added video's data.
 */
export const uploadVideos = async (req, res) => {
  try {
    if (!req.files) {
      return errorResponse(req, res, "Please select files", 400); // Respond with error message if no files found
    }
    const { thumbnail, videoUrl, pdffiles } = req.files;
    const {
      title,
      subjectId,
      videoIndex,
      timeDuration,
      teacherId,
      typeVideo,
      playlistId,
      filename,
    } = req.body;

    if (videoUrl == undefined) {
      return errorResponse(req, res, "video Is required", 400); // Respond with error message if thumbnail or video is missing
    }

    const videoS3Url = await uploadFiles(videoUrl, "videos");
    let pdffileData;
    if (pdffiles && !pdffiles.length) {
      let filedata = await uploadFiles(pdffiles, "studymaterials");
      pdffileData = [{ fileUrl: filedata, filename: filename || title }];
    } else if (pdffiles && pdffiles.length) {
      pdffileData = await Promise.all(
        pdffiles.map(async (pdffile) => {
          const pdffileUrl = await uploadFiles(pdffile, "studymaterials");
          return {
            fileUrl: pdffileUrl,
            filename: filename || pdffile.name,
          };
        })
      );
    }
    let data = new videosModal({
      title: title,
      videoUrl: videoS3Url,
      subject: subjectId,
      timeDuration: timeDuration,
      videoIndex,
      pdfdata: pdffileData,
      typeVideo: typeVideo,
      teacherId: teacherId,
    });
    await data.save();
    await data.populate({
      path: "subject",
      populate: { path: "courseFieldId" },
    });
    await playlistsModal.findOneAndUpdate(
      { _id: playlistId },
      {
        $push: {
          videosDetails: data._id,
        },
      }
    );
    return successResponse(req, res, data, 200, "Data added Successfully"); // Respond with success message and data
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Get all videos from the database with subject details.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of videos with subject details.
 */
export const getAllVideos = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const { subjectId } = req.body;
    let query = {
      isDelete: false,
    };
    if (subjectId) {
      query.subject = new ObjectId(subjectId);
    }
    const data = await videosModal.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: "$subject",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "subject.courseFieldId",
          foreignField: "_id",
          as: "subject.courseFieldId",
        },
      },
      {
        $unwind: "$subject.courseFieldId",
      },
      {
        $lookup: {
          from: "courses",
          localField: "subject.courseFieldId.courseId",
          foreignField: "_id",
          as: "subject.courseFieldId.courseId",
        },
      },
      {
        $unwind: "$subject.courseFieldId.courseId",
      },
      {
        $lookup: {
          from: "playlists",
          localField: "_id",
          foreignField: "videosDetails",
          as: "playlistData",
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacherData",
        },
      },
      {
        $addFields: {
          playlistId: { $arrayElemAt: ["$playlistData._id", 0] },
        },
      },
      {
        $project: {
          _id: 1, // Exclude videoUrl field
          thumbnail: 1, // Exclude timeDuration field
          videoIndex: 1,
          title: 1,
          subject: 1,
          typeVideo: 1,
          watchedTime: 1,
          pdfdata: 1,
          isActive: 1,
          isDelete: 1,
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
          playlistId: 1,
          teacherBgImage: { $arrayElemAt: ["$teacherData.teacherBgImage", 0] },
          teacherImage: { $arrayElemAt: ["$teacherData.image", 0] },
          teacherId: { $arrayElemAt: ["$teacherData._id", 0] },
          teacherName: { $arrayElemAt: ["$teacherData.fullname", 0] },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    const countQuery = await videosModal.countDocuments(query);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404); // Respond with error message if no data found
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery); // Respond with success message and data
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Get videos by subject ID from the database with subject details.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of videos with subject details for the specified subject ID.
 */
export const getVideosBySubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await videosModal
      .find({ subject: subjectId, isDelete: false })
      .select(["-videoUrl", "-timeDuration"])
      .populate({
        path: "subject",
        populate: {
          path: "courseFieldId",
          populate: {
            path: "courseId",
          },
        },
      })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404); // Respond with error message if no data found
    } else {
      return successResponse(req, res, data, 200); // Respond with success message and data
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Update video details in the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {updateData} The updated video's data.
 */
export const updateVideo = async (req, res) => {
  try {
    const {
      title,
      subjectId,
      videoId,
      videoIndex,
      isActive,
      timeDuration,
      teacherId,
      filename,
    } = req.body;
    let data = await videosModal.findOne({ _id: videoId });
    let thumbnail, thumbnailS3Url, videoUrl, pdffileData;
    //  videoS3Url, videoUrl;
    if (!data) {
      return errorResponse(req, res, "Data not found", 404); // Respond with error message if video not found
    } else {
      if (req.files) {
        let parseData = req.files;
        thumbnail = parseData.thumbnail;
        // videoUrl = parseData.videoUrl;
        if (req.files.videoUrl) {
          // bufferData = videoUrl.data; // Buffer
          videoUrl = await uploadFiles(
            req.files.videoUrl,
            "videos",
            data.videoUrl
          );
        }
        if (thumbnail != undefined) {
          thumbnailS3Url = await uploadFiles(
            thumbnail,
            "videos",
            data.thumbnail
          );
        }
        let { pdffiles } = req.files;
        if (pdffiles && !pdffiles.length) {
          let filedata = await uploadFiles(pdffiles, "studymaterials");
          pdffileData = [
            { fileUrl: filedata, filename: filename || pdffiles.name },
          ];
        } else if (pdffiles && pdffiles.length) {
          pdffileData = await Promise.all(
            pdffiles.map(async (pdffile) => {
              const pdffileUrl = await uploadFiles(pdffile, "studymaterials");
              return {
                fileUrl: pdffileUrl,
                filename: filename || pdffile.name,
              };
            })
          );
        }
      }
      const updateData = await videosModal
        .findOneAndUpdate(
          { _id: videoId },
          {
            $set: {
              title,
              subjectId,
              timeDuration,
              videoUrl: videoUrl,
              thumbnail: thumbnailS3Url,
              filename: filename,
              pdfdata: pdffileData,
              videoIndex,
              isActive,
              teacherId,
            },
          },
          { new: true }
        )
        .select(["-timeDuration"])
        .populate({
          path: "subject",
          populate: {
            path: "courseFieldId",
            populate: {
              path: "courseId",
            },
          },
        });
      return successResponse(req, res, updateData, 200, "Data Updated..."); // Respond with success message and updated data
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Delete video details in the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {DeleteData} The Deleted video's data.
 */
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.body;
    let data = await videosModal.findOne({ _id: videoId });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404); // Respond with error message if video not found
    } else {
      const updateData = await videosModal.findOneAndUpdate(
        { _id: videoId },
        { $set: { isActive: false, isDelete: true } },
        { new: true }
      );
      return successResponse(req, res, [], 200, "Data Deleted..."); // Respond with success message and Delete data
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Stream video from the database with the specified video ID.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending video stream.
 */
export const playVideo = async (req, res) => {
  try {
    const { videoId, watchedTime } = req.body;
    const { userId } = req.user;
    let studentId = userId;
    const videoSubject = await videosModal.aggregate([
      {
        $match: {
          _id: new ObjectId(videoId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $addFields: {
          subject: {
            $arrayElemAt: ["$subject", 0],
          },
        },
      },
    ]);

    let videologData = await videoLogsModel.findOne({
      $and: [{ studentId: studentId }, { videoId: videoId }],
    });

    if (!videologData) {
      videologData = new videoLogsModel({
        subjectId: videoSubject.subject,
        videoId: videoId,
        studentId: userId,
        watchedTime: watchedTime,
      });
      await videologData.save();
    } else {
      videologData = await videoLogsModel.findOneAndUpdate(
        { videoId: videoId, studentId: userId },
        { $set: { watchedTime: watchedTime } },
        { new: true }
      );
    }
    const videoData = await videosModal.aggregate([
      {
        $match: {
          _id: new ObjectId(videoId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "qnalists",
          localField: "_id",
          foreignField: "videoId",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$videoId", "$$videoId"] },
                isActive: true,
                isDelete: false,
              },
            },
          ],
          as: "qnalistsId",
        },
      },
      {
        $lookup: {
          from: "attempts",
          let: { qnalistsId: "$qnalistsId._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$qnalistId", "$$qnalistsId"],
                },
                studentId: new ObjectId(userId),
              },
            },
          ],
          as: "attempttests",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "videologs",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$videoId", "$$videoId"],
                },
                studentId: new ObjectId(userId),
              },
            },
          ],
          as: "watchedTime",
        },
      },
      {
        $lookup: {
          from: "bookmarks",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    studentId: new ObjectId(userId),
                    videoId: new ObjectId(videoId),
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
          isAttemptTest: {
            $cond: {
              if: { $gt: [{ $size: "$attempttests" }, 0] },
              then: true,
              else: false,
            },
          },
          qnalistsId: {
            $arrayElemAt: ["$qnalistsId", 0],
          },
          subject: {
            $arrayElemAt: ["$subject", 0],
          },
          watchedTime: { $arrayElemAt: ["$watchedTime.watchedTime", 0] },
          isBookmark: {
            $cond: {
              if: { $gt: [{ $size: "$bookmarks" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);
    if (videoData) {
      return successResponse(req, res, videoData, 200);
    } else {
      return errorResponse(req, res, "Data Not found", 404); // Respond with error message if video not found
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500); // Handle any errors that occur during the process
  }
};

/**
 * Get video details by video ID from the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The video's data.
 */
export const videoById = async (req, res) => {
  try {
    const { videoId, watchedTime } = req.body;

    const data = await videosModal.aggregate([
      {
        $match: {
          _id: new ObjectId(videoId),
          isDelete: false,
        },
      },
      {
        $set: {
          watchedTime: watchedTime,
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $lookup: {
          from: "qnalists",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$videoId", "$$videoId"] },
                isActive: true,
                isDelete: false,
              },
            },
            {
              $sort: { _id: -1 },
            },
          ],
          as: "qnalistsId",
        },
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherId",
          foreignField: "_id",
          as: "teacherData",
        },
      },
      {
        $addFields: {
          subject: { $arrayElemAt: ["$subject", 0] },
          teacherData: { $arrayElemAt: ["$teacherData", 0] },
          qnalistsId: { $ifNull: [{ $arrayElemAt: ["$qnalistsId", 0] }, null] },
        },
      },
      {
        $project: {
          teacherData: {
            joiningDate: 0,
            mobile: 0,
            address: 0,
            additionalInfo: 0,
            socialPortfolio: 0,
            resume: 0,
            loginDetails: 0,
            teacherBgImage: 0,
            subjects: 0,
            teachExams: 0,
            tspp: 0,
            dob: 0,
            isVerify: 0,
            isDelete: 0,
          },
        },
      },
    ]);

    if (!data || data.length === 0 || data[0] === null) {
      return errorResponse(req, res, "Data not found", 200);
    }

    const videoData = data[0];

    const isBookmark = await checkIsBookmark(req, res);
    videoData.isBookmarked = isBookmark !== null ? true : false;

    return successResponse(req, res, videoData, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getbyteacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await videosModal
      .find({
        teacherId: teacherId,
        isActive: true,
        isDelete: false,
      })
      .populate({
        path: "teacherId",
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
      .select(["-videoUrl"]);
    if (!data.length) {
      return errorResponse(req, res, "No Data Found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
