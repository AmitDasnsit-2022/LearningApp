import mongoose, { Schema } from "mongoose";

const planduration = new mongoose.Schema(
  {
    duration: {
      type: Number,
      default: 3,
    },
    iconId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "filesModal",
      required: true,
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

export default mongoose.model("planduration", planduration);
