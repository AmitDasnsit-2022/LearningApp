import mongoose from "mongoose";

const batch = new mongoose.Schema(
  {
    pdffile: [
      {
        fileUrl: {
          type: String,
          default: null,
        },
      },
    ],
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    aboutCourse: {
      type: String,
      default: null,
    },
    courseFieldId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseFields",
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

export default mongoose.model("batch", batch);
