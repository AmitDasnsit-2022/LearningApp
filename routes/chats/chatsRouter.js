import { Server } from "socket.io";
import * as chatsController from "../../controllers/chats/chatsController.js";
import { generateUUID, smallFileOns3 } from "../../helpers/index.js";
import videoLogsModel from "../../modules/videoLogs.js";
import liveSteamModel from "../../modules/liveStream.js";
import fs from "fs";
import rooms from "../../modules/rooms.js";

/**
 * subjectId,
videoId,
studentId,
 */
export const socketServer = (socket, io) => {
  /**
   * @description Event of connected
   */
  socket.on("connected", async (data) => {
    if (!data.livestreamId && !data.coursefieldId && !data.studentId) {
      socket.emit(
        "connected",
        "livestreamId, coursefieldId is required & studentId is required"
      );
      return;
    } else {
      const newroomId = generateUUID();

      const livestreamdata = await liveSteamModel.findOne({
        _id: data.livestreamId,
      });
      const roomId = await rooms.findOne({
        livestreamId: data.livestreamId,
        coursefieldId: data.coursefieldId,
      });
      if (roomId) {
        data["roomId"] = roomId.roomId;
      } else {
        data["roomId"] = newroomId;
      }
      if (!livestreamdata) {
        socket.emit("connected", "Live stream data not found");
        return;
      } else {
        const { ...rest } = livestreamdata.toObject();
        const completeData = {
          ...rest,
          roomId: data.roomId,
          studentId: data.studentId,
        };
        socket.data = completeData;
        // console.log(completeData);
        let videologData = await videoLogsModel.findOne({
          videoId: livestreamdata.videoId,
          studentId: data.studentId,
        });

        if (!videologData) {
          videologData = new videoLogsModel({
            subjectId: livestreamdata.subject,
            videoId: livestreamdata.videoId,
            studentId: data.studentId,
          });
          await videologData.save();
        } else {
          await videoLogsModel.findOneAndUpdate(
            {
              subjectId: livestreamdata.subject,
              videoId: livestreamdata.videoId,
              studentId: data.studentId,
            },
            { $set: { isActive: true, isDelete: false } },
            { new: true }
          );
        }
        const livecounts = await videoLogsModel.count({
          subjectId: livestreamdata.subject,
          videoId: livestreamdata.videoId,
          isActive: true,
          isDelete: false,
        });
        const roomdata = await chatsController.addRoom(data);
        if (livecounts && roomdata) {
          const { ...rest } = roomdata.toObject();
          const completeData = { ...rest, livecount: livecounts };
          socket.emit("connected", completeData);
        } else {
          socket.emit("connected", roomdata);
        }
      }
    }
  });

  /**nes
   * @description Event of connect teacher
   */
  socket.on("connect_teacher", async (data) => {
    let roomId;
    if (!data.livestreamId && !data.coursefieldId) {
      socket.emit(
        "connect_teacher",
        "livestreamId, coursefieldId is required & studentId is required"
      );
      return;
    } else {
      const livestreamdata = await liveSteamModel.findOne({
        _id: data.livestreamId,
      });
      roomId = await rooms.findOne({
        livestreamId: data.livestreamId,
        coursefieldId: data.coursefieldId,
      });
      if (roomId != undefined) {
        data["roomId"] = roomId.roomId;
      } else {
        data["roomId"] = generateUUID();
        roomId = await chatsController.addRoom(data);
      }
      if (!livestreamdata) {
        socket.emit("connect_teacher", "Live stream data not found");
        return;
      } else {
        const { ...rest } = livestreamdata.toObject();
        const completeData = { ...rest, roomId: roomId.roomId };
        socket.emit("connect_teacher", completeData);
      }
    }
  });
  /**nes
   * @description Event of Join room of group
   */
  socket.on("joinRoom", async (data) => {
    console.log({ data });
    if (!data.roomId && !data.livestreamId) {
      socket.emit("joinRoom", "roomId and livestreamId is required");
      return;
    } else {
      socket.join(data.roomId);
      const livestreamdata = await liveSteamModel.findOne({
        _id: data.livestreamId,
      });
      if (!livestreamdata) {
        socket.emit("joinRoom", "roomId is required");
        return;
      }
      const livecount = await videoLogsModel.count({
        $and: [
          { subjectId: livestreamdata.subject },
          { videoId: livestreamdata.videoId },
          { isActive: true },
          { isDelete: false },
        ],
      });
      io.to(data.roomId).emit("joinRoom", { livecount });
    }
  });

  /**
   * @description Event of message in group
   */
  socket.on("message", async (data) => {
    if (
      !data.livestreamId &&
      !data.coursefieldId &&
      !data.subjectId &&
      !data.message &&
      !data.roomId
    ) {
      socket.emit(
        "message",
        "livestreamId, studentId, coursefieldId,subjectId, message is required"
      );
      return;
    } else {
      let filename;
      if (data.hasOwnProperty("file") && data.file !== "") {
        console.log(data.file);
        filename = `/doubts/${Date.now()}`;
        let buffer = Buffer.from(data.file, "base64");

        fs.writeFile("./public/" + filename, buffer, (err) => {
          if (err) throw err;
          console.log("The file has been saved!");
        });
      }
      data["fileurl"] = filename;
      const chatdata = await chatsController.addChat(data);
      io.to(data.roomId).emit("message", chatdata);
    }
  });

  /**
   * @description Event for chat history of a livestream
   */
  socket.on("chathistory", async (data) => {
    if (!data.livestreamId && !data.coursefieldId && !data.roomId) {
      socket.emit(
        "chathistory",
        "livestreamId, roomId, coursefieldId is required"
      );
      return;
    } else {
      const chatdata = await chatsController.chatHistory(data);
      io.to(data.roomId).emit("chathistory", chatdata);
    }
  });

  /**
   * @description event of disconnect to socket server.
   */
  socket.on("disconnect", async () => {
    let { data } = socket;
    const livestreamdata = await liveSteamModel.findOne({
      _id: data._id,
    });
    console.log("disconnected");
    if (livestreamdata) {
      const updatedata = await videoLogsModel.findOneAndUpdate(
        { videoId: data.videoId, studentId: data.studentId },
        { $set: { isActive: false, isDelete: true } },
        { new: true }
      );
      const livecount = await videoLogsModel.count({
        $and: [
          { subjectId: livestreamdata.subject },
          { videoId: livestreamdata.videoId },
          { isActive: true },
          { isDelete: false },
        ],
      });
      console.log("livecount", livecount);
      io.to(socket.data.roomId).emit("joinRoom", { livecount });
      socket.leave(socket.id);
    }
  });
};
