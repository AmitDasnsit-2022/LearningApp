import mongoose, { Schema } from "mongoose";

const courseFields = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    iconName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "filesModal",
      default: null,
    },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "languages",
      default: null,
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

export default mongoose.model("courseFields", courseFields);
