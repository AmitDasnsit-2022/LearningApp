import mongoose from "mongoose";

const attemptexamlists = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "studentsModule",
    },
    courseFieldId: {
      type: mongoose.Types.ObjectId,
      ref: "courseFields",
      required: true,
    },
    testListId: {
      type: mongoose.Types.ObjectId,
      ref: "testList",
    },
    timeDuration: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
    },
    obtainMarks: {
      type: Number,
    },
    rank: {
      type: Number,
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

export default mongoose.model("attemptexamlists", attemptexamlists);
