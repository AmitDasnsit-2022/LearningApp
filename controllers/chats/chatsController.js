import chats from "../../modules/chats.js";
import rooms from "../../modules/rooms.js";

export const addRoom = async (data) => {
  try {
    const existRoom = await rooms.findOne({
      livestreamId: data.livestreamId,
      coursefieldId: data.coursefieldId,
    });
    if (existRoom) {
      return existRoom;
    } else {
      const roomdata = await rooms.create({
        livestreamId: data.livestreamId,
        coursefieldId: data.coursefieldId,
        roomId: data.roomId,
      });
      return roomdata;
    }
  } catch (error) {
    return error.message;
  }
};

export const addChat = async (data) => {
  try {
    const chatdata = await chats.create({
      livestreamId: data.livestreamId,
      studentId: data.studentId,
      coursefieldId: data.coursefieldId,
      subjectId: data.subjectId,
      message: data.message,
      teacherId: data.teacherId,
      fileurl: data.fileurl,
    });
    const getchat = await chats
      .findOne({ _id: chatdata._id })
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] });
    return getchat;
  } catch (error) {
    return error.message;
  }
};

export const chatHistory = async (data) => {
  try {
    let limit = parseInt(data.limit) || 100;
    let skip = parseInt(data.skip);
    const getchathistory = await chats
      .find({
        livestreamId: data.livestreamId,
        coursefieldId: data.coursefieldId,
      })
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] })
      .skip(skip)
      .limit(limit);
    return getchathistory;
  } catch (error) {
    return error.message;
  }
};
