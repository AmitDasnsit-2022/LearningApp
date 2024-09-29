import mongoose from "mongoose";

const qna = new mongoose.Schema(
  {
    questionfileurl: {
      type: String,
      default: "",
    },
    question: {
      type: String,
      default: "",
    },
    a: {
      type: String,
      required: true,
    },
    b: {
      type: String,
      required: true,
    },
    c: {
      type: String,
      required: true,
    },
    d: {
      type: String,
      required: true,
    },
    solutionfileurl: {
      type: String,
      default: "",
    },
    solution: {
      type: String,
      default: null,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    qnalistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "qnalists",
    },
    marks: {
      type: Number,
      default: 1,
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

export default mongoose.model("qna", qna);
