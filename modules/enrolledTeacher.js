import mongoose from "mongoose";

const enrolledTeacher = new mongoose.Schema(
  {
    subjectId: {
      type: mongoose.Types.ObjectId,
      ref: "subjects",
    },
    teacherId: {
      type: mongoose.Types.ObjectId,
      ref: "teachers",
    },
    courseField: {
      type: mongoose.Types.ObjectId,
      ref: "courseFields",
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

export default mongoose.model("enrolledTeacher", enrolledTeacher);
