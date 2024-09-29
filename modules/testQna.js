import mongoose from "mongoose";

const testsQna = new mongoose.Schema(
  {
    questionfileurl: {
      type: String,
    },
    question: {
      type: String,
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
    },
    solution: {
      type: String,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
    },
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "playlist",
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

export default mongoose.model("testsQna", testsQna);
