import mongoose from "mongoose";

const filesModal = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
    },
    folderName: {
      type: String,
      enum: [
        "icons",
        "banners",
        "videos",
        "lecturers",
        "syllabus",
        "teachers_profile",
        "thumbnails",
        "testqna",
      ],
      default: "icons",
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

export default mongoose.model("filesModal", filesModal);
