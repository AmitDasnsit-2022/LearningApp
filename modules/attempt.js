import mongoose from "mongoose";

const attempt = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "studentsModule",
    },
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "qna",
    },
    qnalistId: {
      type: mongoose.Types.ObjectId,
      ref: "qnalists",
    },
    studentAnswer: {
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

export default mongoose.model("attempt", attempt);
