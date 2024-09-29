import mongoose, { Schema } from "mongoose";

const plans = new mongoose.Schema(
  {
    planTypes: {
      type: String,
      default: "Lite",
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    planFeatures: [
      {
        name: {
          type: String,
          default: null,
        },
      },
    ],
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
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

export default mongoose.model("plans", plans);
