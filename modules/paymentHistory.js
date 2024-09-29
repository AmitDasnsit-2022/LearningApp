import mongoose, { Schema } from "mongoose";

const paymentHistory = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentsModule",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    courseFieldId: {
      type: mongoose.Types.ObjectId,
      ref: "courseFields",
      required: true,
    },
    planDuration: {
      type: mongoose.Types.ObjectId,
      ref: "planduration",
      required: true,
    },
    planId: {
      type: mongoose.Types.ObjectId,
      ref: "plans",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "failed"],
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentSignature: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
    },
    tex: {
      type: Number,
      default: 18,
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

export default mongoose.model("paymentHistory", paymentHistory);
