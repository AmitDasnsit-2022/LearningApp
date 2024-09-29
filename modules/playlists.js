import mongoose from "mongoose";

const playlist = new mongoose.Schema(
  {
    playlistName: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    teacherDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
      default: null,
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
    },
    playlistType: {
      type: String,
      enum: ["live", "recorded", "quickSolution", "doubt"],
      default: "recorded",
    },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
    },
    videosDetails: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos",
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

export default mongoose.model("playlist", playlist);
