import mongoose, { Schema } from "mongoose";

const payments = new mongoose.Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "failed"],
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
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

export default mongoose.model("payments", payments);
