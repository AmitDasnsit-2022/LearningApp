import mongoose from "mongoose";

const teachersSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "other"],
      default: "Male",
    },
    dob: {
      type: String,
    },
    email: {
      type: String,
      default: null,
    },
    mobile: {
      type: Number,
      default: null,
    },
    joiningDate: {
      type: Date,
      default: new Date(),
    },
    qualification: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    teacherBgImage: {
      type: String,
      default: null,
    },
    courseFieldId: {
      type: mongoose.Types.ObjectId,
      ref: "courseFields",
    },
    experience: {
      type: String,
      default: null,
    },
    designation: {
      type: String,
      default: null,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subjects",
      },
    ],
    teachExams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
      },
    ],
    loginDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
    address: {
      address: {
        type: String,
        default: null,
      },
      city: {
        type: String,
        default: null,
      },
      state: {
        type: String,
        default: null,
      },
      zipCode: {
        type: String,
        default: null,
      },
    },
    socialPortfolio: {
      facebook: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
      instagram: {
        type: String,
        default: null,
      },
      youtube: {
        type: String,
        default: null,
      },
    },
    additionalInfo: {
      type: String,
      default: null,
    },
    resume: {
      type: String,
      default: null,
    },
    tspp: {
      type: Boolean,
      default: false,
    },
    isVerify: {
      type: Boolean,
      default: false,
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

export default mongoose.model("teachers", teachersSchema);
