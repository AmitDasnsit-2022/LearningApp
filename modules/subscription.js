import mongoose, { Schema } from "mongoose";

const subscription = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Types.ObjectId,
      ref: "studentsModule",
      required: true,
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    courseFieldId: {
      type: mongoose.Types.ObjectId,
      ref: "courseFields",
      required: true,
    },
    planDuration: {
      type: mongoose.Types.ObjectId,
      ref: "planduration",
    },
    planId: {
      type: mongoose.Types.ObjectId,
      ref: "plans",
    },
    languageId: {
      type: mongoose.Types.ObjectId,
      ref: "languages",
      required: true,
    },
    paymentId: {
      type: mongoose.Types.ObjectId,
      ref: "paymentHistory",
    },
    expireDate: {
      type: Date,
      default: null,
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

export default mongoose.model("subscription", subscription);
