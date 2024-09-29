import mongoose from "mongoose";

const testList = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    endTime: {
      type: Date,
      default: new Date(),
    },
    numberOfquestion: {
      type: Number,
      default: 0,
    },
    subjectId: {
      type: mongoose.Types.ObjectId,
      ref: "subjects",
    },
    startTime: {
      type: Date,
      default: new Date(),
    },
    courseFieldId: {
      type: mongoose.Types.ObjectId,
      ref: "courseFields",
    },
    languageId: {
      type: mongoose.Types.ObjectId,
      ref: "languages",
    },
    testListType: {
      type: String,
      enum: ["test", "exam", "videotest"],
      default: "test",
    },
    testQnaIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: "testsQna",
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

export default mongoose.model("testList", testList);
