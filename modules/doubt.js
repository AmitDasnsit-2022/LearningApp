import mongoose from "mongoose";

const doubt = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentsModule",
    },
    vidoeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    solved: {
      type: Boolean,
      default: false,
    },
    solutionImg: [
      {
        type: String,
        default: [],
      },
    ],
    solutionMsg: {
      type: String,
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
      default: null,
    },
    fileUrl: [
      {
        type: String,
        default: [],
      },
    ],
    message: {
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

export default mongoose.model("doubt", doubt);
