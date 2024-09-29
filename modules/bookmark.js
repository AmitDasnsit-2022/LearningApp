import mongoose from "mongoose";

const bookmark = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentsModule",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
    },
    syllabusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "syllabus",
    },
    studymaterialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studymaterial",
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
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
export default mongoose.model("bookmark", bookmark);
