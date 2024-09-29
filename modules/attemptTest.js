import mongoose from "mongoose";

const attemptTest = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "studentsModule",
    },
    questionId: {
      type: mongoose.Types.ObjectId,
      ref: "testsQna",
    },
    testListId: {
      type: mongoose.Types.ObjectId,
      ref: "testList",
    },
    subjectId: {
      type: mongoose.Types.ObjectId,
      ref: "subjects",
    },
    studentAnswer: {
      type: String,
      default: null,
    },
    testType: {
      type: String,
      enum: ["test", "exam"],
      default: "test",
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

export default mongoose.model("attempttest", attemptTest);
