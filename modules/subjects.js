import mongoose from "mongoose";

const subjects = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
    },
    iconName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "filesModal",
    },
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

export default mongoose.model("subjects", subjects);
