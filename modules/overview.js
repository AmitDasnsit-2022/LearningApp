import mongoose from "mongoose";

const overview = new mongoose.Schema(
  {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    secondaryTitle: {
      type: String,
      default: null,
    },
    secondaryDescription: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
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

export default mongoose.model("overview", overview);
