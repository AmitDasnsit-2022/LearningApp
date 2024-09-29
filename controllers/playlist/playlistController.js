import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import playlistModal from "../../modules/playlists.js";
import mongoose from "mongoose";
import enrolledTeachers from "../../modules/enrolledTeacher.js";
import courseFieldModal from "../../modules/courseFields.js";
const ObjectId = mongoose.Types.ObjectId;

/**
 * Controller for adding a new playlist.
 *
 * @param {*} req The request object containing the playlist details.
 * @param {*} res The response object for sending JSON data.
 */
export const addNew = async (req, res) => {
  try {
    const {
      playlistName,
      description,
      courseFieldId,
      languageId,
      subjectId,
      playlistType,
    } = req.body;
    const teacher = await enrolledTeachers.findOne({ subjectId: subjectId });
    if (!teacher) {
      return errorResponse(req, res, "Teacher not found in this subject", 404);
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
        playlistType,
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
            { playlistType },
          ],
        },
        { $set: { isDelete: false } },
        { new: true }
      );
      return successResponse(req, res, existData, 200);
    } else {
      return errorResponse(req, res, "Data already Exist", 403);
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
      playlistType,
      languageId,
      subjectId,
      videosIds,
      isActive,
    } = req.body;
    let teacher = await enrolledTeachers.findOne({ subjectId: subjectId });
    teacher = teacher != null ? teacher.teacherId : undefined;
    const data = await playlistModal
      .findOneAndUpdate(
        { _id: playlistId },
        {
          $set: {
            playlistName,
            description,
            teacherDetails: teacher,
            courseFieldId,
            languageId,
            playlistType,
            subjectId,
            videosDetails: videosIds,
            isActive,
          },
        },
        { new: true }
      )
      .populate("courseFieldId")
      .populate("subjectId");
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
 * Controller for deleting a playlist by ID.
 *
 * @param {*} req The request object containing the playlistId.
 * @param {*} res The response object for sending JSON data.
 */
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const data = await playlistModal.findOneAndUpdate(
      { _id: playlistId },
      {
        $set: { isDelete: true },
      },
      { new: true }
    );
    if (!data) {
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
 * Controller for retrieving all playlists related to a teacher ID.
 *
 * @param {*} req The request object containing the teacherId.
 * @param {*} res The response object for sending JSON data.
 */
export const getByteacherId = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await playlistModal
      .find({ teacherDetails: teacherId, isDelete: false })
      .sort({ _id: -1 });
    if (!data.length) {
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
 * Controller for retrieving all playlists related to a teacher ID.
 *
 * @param {*} req The request object containing the teacherId.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllPlaylist = async (req, res) => {
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
    const data = await playlistModal
      .find(query)
      .populate({
        path: "teacherDetails",
        select: ["-loginDetails", "-address", "-mobile"],
      })
      .populate("courseFieldId")
      .populate("languageId")
      .populate("subjectId")
      .populate({
        path: "videosDetails",
        select: ["-videoUrl"],
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await playlistModal.countDocuments(query);
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
 * Controller for retrieving playlists related to a subject ID.
 *
 * @param {*} req The request object containing the subjectId.
 * @param {*} res The response object for sending JSON data.
 */
export const getplaylistBySubject = async (req, res) => {
  try {
    const { subjectId, playlistType } = req.body;
    const data = await playlistModal
      .find({
        isDelete: false,
        isActive: true,
        playlistType: playlistType ? playlistType : "recorded",
        subjectId: subjectId,
      })
      .populate({
        path: "videosDetails",
        model: "videos",
        populate: {
          path: "teacherId",
          model: "teachers",
          select: "fullname image teacherBgImage",
        },
        match: {
          isActive: true,
          isDelete: false,
        },
        options: {
          sort: { videoIndex: 1 }, // Sort by the 'videoIndex' field in ascending order
        },
      })
      .populate({
        path: "subjectId",
        model: "subjects",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "courseFieldId",
        model: "courseFields",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "teacherDetails",
        model: "teachers",
        select: "fullname image teacherBgImage",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "languageId",
        select: "name",
      });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 200);
    } else {
      // console.log(JSON.stringify(data));
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getPlaylistOfQuicksolution = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await playlistModal
      .find({
        $and: [
          {
            isDelete: false,
            isActive: true,
            playlistType: { $eq: "quickSolution" },
            videosDetails: { $ne: [] },
          },
          {
            subjectId: subjectId,
          },
        ],
      })
      .populate({
        path: "videosDetails",
        model: "videos",
        match: {
          isActive: true,
          isDelete: false,
        },
        options: {
          sort: { videoIndex: 1 }, // Sort by the 'videoIndex' field in ascending order
        },
      })
      .populate({
        path: "subjectId",
        model: "subjects",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "courseFieldId",
        model: "courseFields",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "teacherDetails",
        model: "teachers",
        select: "fullname",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "languageId",
        select: "name",
      })
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

export const recordedVideoBysubjectid = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await playlistModal
      .find({
        $and: [
          {
            isDelete: false,
            isActive: true,
            playlistType: "recorded",
            subjectId: new ObjectId(subjectId),
          },
        ],
      })
      .select(["playlistName", "description"])
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

export const getPlaylistbytypes = async (req, res) => {
  try {
    const { courseFieldId, playlistType, subjectId } = req.body;
    const query = {
      isDelete: false,
      isActive: true,
      playlistType: playlistType,
      courseFieldId: new ObjectId(courseFieldId),
    };
    if (subjectId) {
      query.subjectId = new ObjectId(subjectId);
    }
    const data = await playlistModal
      .find(query)
      .select(["playlistName", "description"])
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
 * Get all videos from the database with subject details.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of videos with subject details.
 */
export const getByCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await courseFieldModal.aggregate([
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
                $and: [
                  {
                    $expr: {
                      $eq: ["$courseFieldId", "$$courseFieldId"],
                    },
                    isActive: true,
                    isDelete: false,
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "videos",
                let: { subjectId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$subject", "$$subjectId"] },
                      isActive: true,
                      typeVideo: { $eq: "recorded" },
                    },
                  },
                  {
                    $sort: { videoIndex: 1 }, // Sort videos by index
                  },
                  {
                    $limit: 2, // Limit videos to 2 per subject
                  },
                  {
                    $lookup: {
                      from: "teachers",
                      localField: "teacherId",
                      foreignField: "_id",
                      as: "teacher",
                    },
                  },
                  {
                    $addFields: {
                      teacher: { $arrayElemAt: ["$teacher", 0] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      thumbnail: 1,
                      title: 1,
                      timeDuration: 1,
                      teacher: {
                        fullname: "$teacher.fullname",
                        image: "$teacher.image",
                        teacherBgImage: "$teacher.teacherBgImage",
                        designation: "$teacher.designation",
                      },
                    },
                  },
                ],
                as: "videos",
              },
            },
            {
              $project: {
                _id: 1,
                subjectName: 1,
                courseFieldId: 1,
                createdAt: 1,
                updatedAt: 1,
                isDelete: 1,
                isActive: 1,
                videos: "$videos", // Create an array of video objects
              },
            },
          ],
          as: "subjects",
        },
      },
      {
        $lookup: {
          from: "languages",
          localField: "language",
          foreignField: "_id",
          as: "language",
        },
      },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          isActive: "$isActive",
          language: { $arrayElemAt: ["$language.name", 0] },
          subjects: "$subjects",
        },
      },
    ]);
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

export const teacherLectures = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await playlistModal
      .find({
        teacherDetails: teacherId,
        isActive: true,
        isDelete: false,
        videosDetails: { $ne: [] },
      })
      .populate({
        path: "videosDetails",
        match: {
          isActive: true,
          isDelete: false,
        },
        select: ["-videoUrl"],
        populate: {
          path: "teacherId",
          model: "teachers",
          select: "fullname image teacherBgImage",
        },
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
        ],
      });
    if (!data) {
      errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Playlists of type live related to a subject ID.
 *
 * @param {*} req The request object containing the subjectId.
 * @param {*} res The response object for sending JSON data.
 */
export const livePlaylistBySubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await playlistModal
      .find({
        $and: [
          {
            isDelete: false,
            isActive: true,
            playlistType: { $eq: "live" },
            videosDetails: { $ne: [] },
          },
          {
            subjectId: subjectId,
          },
        ],
      })
      .populate({
        path: "videosDetails",
        model: "videos",
        populate: {
          path: "teacherId",
          model: "teachers",
          select: "fullname image teacherBgImage",
        },
        match: {
          isActive: true,
          isDelete: false,
        },
        options: {
          sort: { videoIndex: 1 }, // Sort by the 'videoIndex' field in ascending order
        },
      })
      .populate({
        path: "subjectId",
        model: "subjects",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "courseFieldId",
        model: "courseFields",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "teacherDetails",
        model: "teachers",
        select: "fullname",
        match: {
          isActive: true,
          isDelete: false,
        },
      })
      .populate({
        path: "languageId",
        select: "name",
      })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const recoredPlaylistBysubjectId = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await playlistModal
      .find({
        isActive: true,
        isDelete: false,
        playlistType: "recorded",
        subjectId: subjectId,
        videosDetails: { $ne: [] },
      })
      .select(["playlistName", "description"]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const videobyplaylist = async (req, res) => {
  try {
    const { playlistId, playlistType } = req.body;
    const data = await playlistModal.aggregate([
      {
        $match: {
          isActive: true,
          isDelete: false,
          playlistType: playlistType ? playlistType : "recorded",
          _id: new ObjectId(playlistId),
        },
      },
      {
        $lookup: {
          from: "videos",
          let: { videoId: "$videosDetails" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$videoId"] },
                isActive: true,
                isDelete: false,
              },
            },
            { $sort: { _id: -1 } },
          ],
          as: "videoDetails",
        },
      },
      {
        $unwind: "$videoDetails",
      },
      {
        $lookup: {
          from: "livestreams",
          let: { videoId: "$videoDetails._id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$videoId", "$$videoId"] },
              },
            },
            {
              $project: {
                timeSchedule: 1,
              },
            },
          ],
          as: "videoDetails.timeSchedule",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "videoDetails.subject",
          foreignField: "_id",
          as: "videoDetails.subject",
        },
      },
      {
        $unwind: "$videoDetails.subject",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "videoDetails.subject.courseFieldId",
          foreignField: "_id",
          as: "videoDetails.subject.courseFieldId",
        },
      },
      {
        $unwind: "$videoDetails.subject.courseFieldId",
      },
      {
        $lookup: {
          from: "teachers",
          let: { teacherId: "$videoDetails.teacherId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$teacherId"] },
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
          as: "videoDetails.teacherId",
        },
      },
      {
        $unwind: "$videoDetails.teacherId",
      },
      {
        $group: {
          _id: "$_id",
          playlistName: { $first: "$playlistName" },
          description: { $first: "$description" },
          videosDetails: { $push: "$videoDetails" },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
