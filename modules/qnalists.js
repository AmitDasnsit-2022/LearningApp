import mongoose from "mongoose";

const qnalists = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 2,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
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

export default mongoose.model("qnalists", qnalists);
