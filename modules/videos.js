import mongoose from "mongoose";

const videos = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      default: null,
    },
    videoIndex: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      default: null,
    },
    subject: {
      type: mongoose.Types.ObjectId,
      ref: "subjects",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
    },
    typeVideo: {
      type: String,
      enum: ["live", "recorded", "quickSolution", "doubt"],
      required: true,
    },
    timeDuration: {
      type: String,
      default: null,
    },
    watchedTime: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    pdfdata: [
      {
        fileUrl: {
          type: String,
          default: null,
        },
        filename: {
          type: String,
          default: null,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("videos", videos);
