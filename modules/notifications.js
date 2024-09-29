import mongoose from "mongoose";

const notifications = new mongoose.Schema(
  {
    notificationType: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentsModule",
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
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

export default mongoose.model("notifications", notifications);
