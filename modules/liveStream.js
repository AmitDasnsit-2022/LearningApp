import mongoose from "mongoose";

const liveStream = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
      required: true,
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
      required: true,
    },
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "playlist",
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
    },
    timeSchedule: {
      type: Date,
      required: true,
    },
    pdffile: {
      type: String,
    },
    isStart: {
      type: Boolean,
      default: true,
    },
    serverEndpoint: {
      type: String,
      required: true,
    },
    streamKey: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("liveStream", liveStream);
