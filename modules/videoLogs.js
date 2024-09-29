import mongoose from "mongoose";

const videolog = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Types.ObjectId,
      ref: "subjects",
    },
    videoId: {
      type: mongoose.Types.ObjectId,
      ref: "videos",
    },
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "studentsModule",
    },
    watchedTime: {
      type: String,
      default: null,
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

export default mongoose.model("videolog", videolog);
