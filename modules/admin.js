import mongoose from "mongoose";

const admin = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    macAddress: {
      type: String,
    },
    otp: {
      type: String,
      required: false,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: "roles",
      required: true,
    },
    permission: [
      {
        type: mongoose.Types.ObjectId,
        ref: "permission",
        required: true,
      },
    ],
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

export default mongoose.model("admin", admin);
