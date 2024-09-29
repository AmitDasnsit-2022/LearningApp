import {
  createStreamForLive,
  errorResponse,
  generateUUID,
  myEvents,
  sendMultiNotification,
  smallFileOns3,
  successResponse,
  uploadFiles,
} from "../../helpers/index.js";
import liveStream from "../../modules/liveStream.js";
import chokidar from "chokidar";
import fs from "fs";
import videosModule from "../../modules/videos.js";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import subscription from "../../modules/subscription.js";
import mongoose from "mongoose";
import momentTZ from "moment-timezone";
import moment from "moment";
const ObjectId = mongoose.Types.ObjectId;
import subscriptionModel from "../../modules/subscription.js";
import teachers from "../../modules/teachers.js";
import playlists from "../../modules/playlists.js";
import { getAllStudentFcmtokenByCoursefieldId } from "../subscription/subscriptionController.js";
import notifications from "../../modules/notifications.js";
import eventEmitter from "../../helpers/eventEmiters.js";

export const createLiveStream = async (req, res) => {
  try {
    const {
      title,
      teacherId,
      courseFieldId,
      subjectId,
      timeSchedule,
      playlistId,
    } = req.body;
    let filesEndPoind = [];
    let fileUrl;
    if (req.files && req.files.pdfdata) {
      if (Array.isArray(req.files.pdfdata) == false) {
        req.files["pdfdata"] = [req.files.pdfdata];
      }
      for await (const num of req.files.pdfdata) {
        fileUrl = await uploadFiles(num, "syllabus");
        filesEndPoind.push({
          fileUrl: fileUrl,
          filename: num.name,
        });
      }
    }

    const teacherdata = await teachers.findOne({ _id: teacherId });
    const playlsitdata = await playlists.findOne({ _id: playlistId });
    let streamData = new liveStream({
      title,
      teacherId: teacherId,
      subject: subjectId,
      timeSchedule: moment(timeSchedule),
      serverEndpoint: process.env.steam_end_point,
      streamKey: `${teacherId + Date.now()}?key=${generateUUID()}`,
      courseFieldId: courseFieldId,
      playlistId: playlistId,
      pdffile: fileUrl,
    });

    let videodata = new videosModule({
      isActive: false,
      title: title,
      subject: subjectId,
      videoIndex: 1,
      thumbnail: teacherdata.image,
      teacherId: teacherId,
      typeVideo: playlsitdata.playlistType,
      pdfdata: filesEndPoind,
    });

    streamData["videoId"] = videodata._id;
    await streamData.save();
    await streamData.populate({ path: "courseFieldId subject" });
    await playlists.findOneAndUpdate(
      { _id: playlistId },
      {
        $push: { videosDetails: videodata.id },
      }
    );
    await videodata.save();
    if (!streamData) {
      errorResponse(req, res, "Steam create account failed");
    } else {
      return successResponse(req, res, streamData, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const uploadHlsFiles = (streamName, isStart, streamData) => {
  let directory = "hls_files";
  if (isStart === false) {
    fs.readdir(`./${directory}/${streamName}`, async (err, files) => {
      for (let file of files) {
        const pathname = `./${directory}/${streamName}/${file}`;
        const filedata = fs.createReadStream(pathname);
        const foldername = `videos/${directory}/${streamName}/${file}`;

        const uploadTsFileOnS3 = await smallFileOns3(filedata, foldername);

        if (uploadTsFileOnS3) {
          fs.unlink(pathname, (err) => console.log({ err }));
          if (uploadTsFileOnS3.includes("m3u8")) {
            const addLiveVideoUrl = await videosModule.findOneAndUpdate(
              {
                isActive: false,
                _id: streamData.videoId,
                typeVideo: "live",
                videoUrl: null,
              },
              {
                $set: {
                  videoUrl: uploadTsFileOnS3,
                  isActive: true,
                  thumbnail: streamData.teacherId.teacherBgImage,
                },
              },
              { new: true }
            );
            console.log({ addLiveVideoUrl });
          }
        }
      }
    });
  }
};

export const updateVideoUrlOfLive = async (streamName, isStart, streamData) => {
  let directory = "hls_files";
  const pathname = `/${directory}/${streamName}/output.m3u8`;
  if (isStart === false) {
    const addLiveVideoUrl = await videosModule.findOneAndUpdate(
      {
        isActive: false,
        _id: streamData.videoId,
        typeVideo: "live",
        videoUrl: null,
      },
      {
        $set: {
          videoUrl: pathname,
          isActive: true,
          thumbnail: streamData.teacherId.teacherBgImage,
          pdfdata: [
            {
              fileUrl: streamData.pdffile,
              filename: streamData.title + "Live Stream File.",
            },
          ],
        },
      },
      { new: true }
    );
    console.log({ addLiveVideoUrl });
    return true;
  }
};

export const streamVerify = async (req, res) => {
  try {
    console.log(req.body);
    const { name, key } = req.body;
    let screatekey = `${name}?key=${key}`;
    const teacherId = name.slice(0, 24);
    const streamdata = await liveStream
      .findOne({
        streamKey: screatekey,
        isActive: true,
      })
      .populate({ path: "teacherId", select: ["-loginDetails"] })
      .populate("subject");
    if (!streamdata) {
      res.status(403).send();
    } else if (streamdata.isStart === false) {
      res.status(200).send();
      await updateVideoUrlOfLive(name, streamdata.isStart, streamdata);
      await liveStream.findOneAndUpdate(
        {
          streamKey: screatekey,
          isActive: true,
        },
        { $set: { isActive: false } },
        { new: true }
      );
      eventEmitter.emit("createNotification", {
        courseFieldId: streamdata.courseFieldId,
        notificationType: "Your live stream start your purchases Course.",
        title: "Live Stream end 🔚",
        description: "Your live stream start your purchases Course.",
      });
      return;
    } else if (streamdata.isStart) {
      const startTime = new Date(streamdata.timeSchedule);
      const currentTime = new Date();
      if (currentTime < startTime) {
        return res.status(401).send("Livestream not started yet");
      }
      res.status(200).send();
      myEvents.emit("convertRtmpTom3u8", streamdata, name);
      eventEmitter.emit("createNotification", {
        courseFieldId: streamdata.courseFieldId,
        notificationType: "Your live stream start your purchases Course.",
        title: "Live Stream Start👍",
        description: "Your live stream start your purchases Course.",
      });
      await liveStream.findOneAndUpdate(
        {
          streamKey: screatekey,
          isActive: true,
        },
        { $set: { isStart: false } },
        { new: true }
      );
      let studentdata = await getAllStudentFcmtokenByCoursefieldId(streamdata);
      const time = setTimeout(
        () =>
          sendMultiNotification(
            studentdata,
            "Live Stream",
            "Your Live Stream Started",
            streamdata
          ),
        60000
      );
      clearTimeout(time);
    } else {
      res.status(403).send();
    }
  } catch (error) {
    console.log({ error });
    res.status(403).send();
  }
};

export const onPlay = async (req, res) => {
  try {
    const userId = req.user.userId;
    const liveStreamId = req.body.liveStreamId;
    const streamdata = await liveStream.findOne({ _id: liveStreamId });
    if (!streamdata) {
      return errorResponse(req, res, "Stream not found", 404);
    }
    const subscribedStudent = await subscriptionModel.findOne({
      studentId: userId,
      courseFieldId: streamdata.courseFieldId,
      isDelete: false,
      isActive: true,
    });
    if (!subscribedStudent) {
      return errorResponse(req, res, "Please subscribed for the course", 404);
    }
    const isActive = streamdata.isActive;
    const streamkey = streamdata.streamKey;
    const parts = streamkey.split("?");
    const streamName = parts[0];
    // Create a readable stream for the M3U8 file
    if (isActive) {
      const currentDate = new Date();
      const startTime = new Date(streamdata.timeSchedule);
      const diffInMilliseconds = currentDate - startTime; // Calculate the time difference
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

      // Check if the livestream is started within 2 hours before from now
      if (diffInHours <= 5 && diffInHours >= 0) {
        const fileExist = fs.existsSync(
          `./public/hls_files/${streamName}/output.m3u8`
        );
        if (fileExist) {
          const filepath = `/hls_files/${streamName}/output.m3u8`;
          return successResponse(req, res, filepath, 200);
        } else {
          return errorResponse(req, res, "Data not found", 404);
        }
      }
    }
    return errorResponse(req, res, "Livestream over or not available", 404);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Play live stream by teacher.
 * @param {*} req liveStreamId
 * @param {*} res
 * @returns
 */
export const playLiveStream = async (req, res) => {
  try {
    const liveStreamId = req.body.liveStreamId;
    const streamdata = await liveStream.findOne({ _id: liveStreamId });
    if (!streamdata) {
      return errorResponse(req, res, "Stream not found", 404);
    }

    const isActive = streamdata.isActive;
    const streamkey = streamdata.streamKey;
    const parts = streamkey.split("?");
    const streamName = parts[0];
    // Create a readable stream for the M3U8 file
    if (isActive) {
      const currentDate = new Date();
      const startTime = new Date(streamdata.timeSchedule);
      const diffInMilliseconds = currentDate - startTime; // Calculate the time difference
      const diffInHours = diffInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

      // Check if the livestream is started within 2 hours before from now
      if (diffInHours <= 5 && diffInHours >= 0) {
        const fileExist = fs.existsSync(
          `./public/hls_files/${streamName}/output.m3u8`
        );
        if (fileExist) {
          const filepath = `/hls_files/${streamName}/output.m3u8`;
          return successResponse(req, res, filepath, 200);
        } else {
          return errorResponse(req, res, "Data not found", 404);
        }
      }
    }
    return errorResponse(req, res, "Livestream over or not available", 404);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description Get all livestreams for students*/
export const getLiveStream = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    function subtractHours(date, hours) {
      date.setHours(date.getHours() - hours);

      return date;
    }
    const result1 = subtractHours(new Date(), 3);
    const currentDate = new Date();
    const { userId } = req.user;
    const data = await subscription.aggregate([
      {
        $match: {
          studentId: new ObjectId(userId),
          courseFieldId: new ObjectId(courseFieldId),
        },
      },
      {
        $lookup: {
          from: "livestreams",
          let: { courseFieldId: "$courseFieldId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$courseFieldId", "$$courseFieldId"] }, // Compare courseFieldId with an external value
                    {
                      $and: [
                        {
                          $gt: ["$timeSchedule", result1],
                        },
                        {
                          $lt: ["$timeSchedule", currentDate],
                        },
                      ],
                    },
                  ],
                },
                isActive: true,
              },
            },
          ],
          as: "liveStreamsData",
        },
      },
      {
        $unwind: "$liveStreamsData",
      },
      {
        $lookup: {
          from: "teachers",
          localField: "liveStreamsData.teacherId",
          foreignField: "_id",
          as: "liveStreamsData.teacherId",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "liveStreamsData.subject",
          foreignField: "_id",
          as: "liveStreamsData.subject",
        },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "liveStreamsData.courseFieldId",
          foreignField: "_id",
          as: "liveStreamsData.courseFieldId",
        },
      },
      {
        $unwind: "$liveStreamsData.courseFieldId",
      },
      {
        $lookup: {
          from: "languages",
          localField: "liveStreamsData.courseFieldId.language",
          foreignField: "_id",
          as: "liveStreamsData.courseFieldId.language",
        },
      },
      {
        $project: {
          _id: 0,
          studentId: 0,
          courseFieldId: 0,
          planDuration: 0,
          planId: 0,
          isActive: 0,
          isDelete: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          liveStreamsData: {
            serverEndpoint: 0,
            streamKey: 0,
            teacherId: {
              email: 0,
              mobile: 0,
              resume: 0,
              address: 0,
              subjects: 0,
              teachExams: 0,
              loginDetails: 0,
            },
          },
        },
      },
    ]);
    if (!data.length) {
      return successResponse(req, res, [], 200);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const byTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const data = await liveStream
      .find({
        teacherId: teacherId,
        isActive: true,
        isDelete: false,
      })
      .select(["-serverEndpoint", "-streamKey"])
      .populate({
        path: "teacherId",
        select: [
          "-email",
          "-mobile",
          "-resume",
          "-address",
          "-subjects",
          "-teachExams",
        ],
      })
      .populate("videoId")
      .populate("subject")
      .populate({
        path: "courseFieldId",
        modal: "courseFields",
      });
    if (!data) {
      return successResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getAll = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    let filter = {
      isDelete: false,
    };
    if (req.body.teacherId != undefined) {
      filter.teacherId = req.body.teacherId;
    }
    const data = await liveStream
      .find({ $and: [filter] })
      .select(["-serverEndpoint", "-streamKey"])
      .populate("subject")
      .populate("courseFieldId")
      .populate({
        path: "teacherId",
        select: [
          "-email",
          "-mobile",
          "-resume",
          "-address",
          "-subjects",
          "-teachExams",
        ],
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await liveStream.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Stream Not found", 404);
    }
    return successResponse(req, res, data, 200, "", "", countQuery);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description Get livestream by id for students */
export const getbylivestreamId = async (req, res) => {
  try {
    let filter = {
      isDelete: false,
      _id: req.body.liveStreamId,
    };
    const data = await liveStream
      .findOne(filter)
      .select(["-serverEndpoint", "-streamKey"])
      .populate("subject")
      .populate("courseFieldId")
      .populate({
        path: "teacherId",
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
      return errorResponse(req, res, "Stream Not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description Get livestream by id for admin */
export const getbyid = async (req, res) => {
  try {
    let filter = {
      isDelete: false,
      _id: req.body.liveStreamId,
    };
    if (req.user.role.roleName.toLocaleLowerCase() === "teacher") {
      filter.teacherId = req.user.userId;
      filter.isActive = true;
    }
    const data = await liveStream
      .findOne(filter)
      .populate("subject")
      .populate("courseFieldId")
      .populate({
        path: "teacherId",
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
      return errorResponse(req, res, "Stream Not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// For getting upcoming live stream data

export const upcomingLiveStream = async (req, res) => {
  try {
    const currentDate = new Date();
    const { subjectId } = req.body;
    let filter = {
      timeSchedule: { $gte: currentDate },
      isActive: true,
      isDelete: false,
    };
    if (subjectId != undefined) {
      filter.subject = subjectId;
    }
    const data = await liveStream
      .find(filter)
      .select(["-serverEndpoint", "-streamKey"])
      .populate("courseFieldId")
      .populate("subject")
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
      });
    if (!data.length) {
      return successResponse(req, res, [], 200);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description API to get livestreams scheduled for future. */
export const teacherupcomingLiveStream = async (req, res) => {
  try {
    const teacherId = req.user.userId || req.body.userId;
    const currentDate = moment().utc();

    const data = await liveStream
      .find({
        teacherId: teacherId,
        timeSchedule: {
          $gt: moment(currentDate).add(1, "day").startOf("day").toDate(),
        },
        isActive: true,
        isDelete: false,
      })
      .select(["-serverEndpoint", "-streamKey"])
      .populate("courseFieldId")
      .populate("subject")
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
      });
    if (!data.length) {
      return successResponse(req, res, null, 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description API to get livestreams that are already completed. */
export const teacherpastLiveStream = async (req, res) => {
  try {
    const teacherId = req.user.userId || req.body.userId;
    console.log("teacherId", req.user.userId);
    const currentDate = moment().utc();

    const data = await liveStream
      .find({
        teacherId: teacherId,
        timeSchedule: { $lt: moment(currentDate).startOf("day").toDate() },
        isDelete: false,
      })
      .select(["-serverEndpoint", "-streamKey"])
      .populate("courseFieldId")
      .populate("subject")
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
      });
    if (!data.length) {
      return successResponse(req, res, null, 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description API to get livestreams of current date.  */
export const teacherCurrentLiveStream = async (req, res) => {
  try {
    const teacherId = req.user.userId || req.body.userId;
    console.log("teacherId", req.user.userId);

    // Get the current date and time in UTC
    const currentDate = moment().utc();
    console.log("current", currentDate);

    const data = await liveStream
      .find({
        teacherId: teacherId,
        timeSchedule: {
          $gte: moment(currentDate).startOf("day").toDate(), // Livestreams for the today
          $lt: moment(currentDate).endOf("day").toDate(), // Livestreams until the end of today
        },
        isActive: true,
        isDelete: false,
      })
      .select(["-serverEndpoint", "-streamKey"])
      .populate("courseFieldId")
      .populate("subject")
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
      });

    if (!data.length) {
      return successResponse(req, res, null, 404);
    }

    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**@description Live stream by subjectid */
export const liveStreamBySubject = async (req, res) => {
  try {
    function subtractHours(date, hours) {
      date.setHours(date.getHours() - hours);

      return date;
    }
    const result1 = subtractHours(new Date(), 3);
    const subjectId = req.body.subjectId;
    const data = await liveStream
      .find({
        timeSchedule: {
          $gt: result1, // Check if timeSchedule is greater than result1
          $lt: new Date(), // Check if timeSchedule is less than the current date
        },
        subject: subjectId,
        isActive: true,
        isDelete: false,
      })
      .select(["-serverEndpoint", "-streamKey"])
      .populate("courseFieldId")
      .populate("subject")
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
      });
    if (!data.length) {
      return successResponse(req, res, null, 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Update livestream
 */
export const updateLiveStream = async (req, res) => {
  try {
    const liveStreamId = req.body.liveStreamId;
    const { title, teacherId, timeSchedule, isActive } = req.body;
    const data = await liveStream.findOneAndUpdate(
      { _id: liveStreamId },
      {
        $set: {
          title: title,
          teacherId: teacherId,
          timeSchedule: timeSchedule,
          isActive: isActive,
        },
      },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, `Data not found`, 404);
    } else {
      return successResponse(req, res, data, 200, "Data Updated...");
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
