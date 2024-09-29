import mongoose from "mongoose";

const academic = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    iconName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "filesModal",
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

export default mongoose.model("academic", academic);
