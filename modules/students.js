import mongoose from "mongoose";

const studentsSchema = new mongoose.Schema(
  {
    mobile: {
      type: Number,
      required: true,
    },
    otp: {
      type: String,
    },
    email: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    pincode: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    courseRelated: {
      type: Boolean,
      default: true,
    },
    studyReminder: {
      type: Boolean,
      default: true,
    },
    promotions: {
      type: Boolean,
      default: true,
    },
    profile_img: {
      type: String,
      default: "",
    },
    fullname: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    academicId: {
      type: mongoose.Types.ObjectId,
      ref: "academic",
      default: null,
    },
    expireTime: {
      type: Date,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("studentsModule", studentsSchema);
