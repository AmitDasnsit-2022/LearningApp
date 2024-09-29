import mongoose, { Schema } from "mongoose";

const studymaterial = new mongoose.Schema(
  {
    title: {
      type: String,
      default: null,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subjects",
      required: true,
    },
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "playlist",
      required: true,
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
      required: true,
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

export default mongoose.model("studymaterial", studymaterial);
