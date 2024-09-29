import mongoose, { Schema } from "mongoose";

const lectures = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    videoThumbnail: {
      type: String,
      default: null,
    },
    timeDuration: {
      type: String,
      default: null,
    },
    courseLanguage: {
      type: Schema.Types.ObjectId,
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

export default mongoose.model("lectures", lectures);
