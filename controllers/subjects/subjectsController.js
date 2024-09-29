import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import subjects from "../../modules/subjects.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const addSubject = async (req, res) => {
  try {
    const { subjectName, courseFieldId, iconId } = req.body;
    let data = await subjects.findOne({ subjectName, courseFieldId });
    if (!data) {
      data = new subjects({
        subjectName,
        courseFieldId,
        iconName: iconId,
      });
      await data.save();
      await data.populate({
        path: "courseFieldId",
        populate: { path: "courseId iconName" },
      });
      return successResponseObject({ req, res, data, code: 200 });
    } else if (data.isDelete) {
      let existData = await subjects.findOneAndUpdate(
        { subjectName, courseFieldId },
        { $set: { isDelete: false } },
        { new: true }
      );
      return successResponseObject({ req, res, existData, code: 200 });
    } else {
      return errorResponseObject({
        req,
        res,
        error: `${subjectName} is already Exist`,
        code: 403,
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const getSubjectByCourseFieldsAdmin = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await subjects
      .find({ courseFieldId, isDelete: false, isActive: true })
      .populate("iconName", "fileUrl name -_id")
      .populate({
        path: "courseFieldId",
        match: {
          isDelete: false,
        },
        populate: {
          path: "courseId",
          match: {
            isDelete: false,
          },
        },
      })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not foun",
        code: 404,
      });
    } else {
      return successResponseObject({ req, res, data, code: 200 });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
export const getSubjectByCourseFields = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await subjects
      .find({ courseFieldId, isDelete: false, isActive: true })
      .populate("iconName", "fileUrl name -_id")
      .populate({
        path: "courseFieldId",
        match: {
          isActive: true,
          isDelete: false,
        },
        populate: {
          path: "courseId",
          match: {
            isActive: true,
            isDelete: false,
          },
        },
      })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not foun",
        code: 404,
      });
    } else {
      return successResponseObject({ req, res, data, code: 200 });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const data = await subjects
      .find({ isDelete: false })
      .populate("iconName", "fileUrl name -_id")
      .populate({
        path: "courseFieldId",
        populate: {
          path: "courseId",
        },
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await subjects.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        count: countQuery,
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { subjectId, subjectName, iconId, courseFieldId, isActive } =
      req.body;
    const data = await subjects.findOne({ _id: subjectId });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      let updatesubject = await subjects
        .findOneAndUpdate(
          { _id: subjectId },
          {
            $set: {
              subjectName,
              iconName: iconId,
              courseFieldId,
              isActive,
            },
          },
          { new: true }
        )
        .populate({ path: "iconName", select: ["name", "fileUrl"] })
        .populate({ path: "courseFieldId", populate: { path: "courseId" } })
        .populate("iconName");
      return successResponseObject({
        req,
        res,
        data: updatesubject,
        code: 200,
        msg: "Data updated...",
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const data = await subjects.findOne({ _id: subjectId });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      let updatesubject = await subjects
        .findOneAndUpdate(
          { _id: subjectId },
          { $set: { isDelete: true, isActive: false } },
          { new: true }
        )
        .populate({ path: "iconName", select: ["name", "fileUrl"] });
      return successResponseObject({
        req,
        res,
        data: [],
        code: 200,
        msg: "Data deleted successfully",
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**Search data to use in website as teacher or students */
export const searchData = async (req, res) => {
  try {
    const { text } = req.body;
    const data = await subjects
      .find({
        subjectName: { $regex: text, $options: "i" },
        isActive: true,
        isDelete: false,
      })
      .populate({
        path: "courseFieldId",
        select: "name",
        populate: {
          path: "courseId",
          select: "name",
        },
      });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      return successResponseObject({ req, res, data, code: 200 });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const subjectWithTeacher = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await subjects.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "filesmodals",
          let: { iconName: "$iconName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$iconName"],
                },
              },
            },
            {
              $project: {
                fileUrl: 1,
              },
            },
          ],
          as: "iconName",
        },
      },
      {
        $unwind: {
          path: "$iconName",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "enrolledteachers",
          let: { subjectId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$subjectId", "$$subjectId"],
                },
                courseField: new ObjectId(courseFieldId),
              },
            },
          ],
          as: "enrolledteachers",
        },
      },
      {
        $unwind: "$enrolledteachers",
      },
      {
        $lookup: {
          from: "teachers",
          let: { teacherId: "$enrolledteachers.teacherId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$teacherId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                fullname: 1,
                gender: 1,
                dob: 1,
                mobile: 1,
                joiningDate: 1,
                qualification: 1,
                experience: 1,
                isActive: 1,
                isDelete: 1,
                designation: 1,
                image: 1,
              },
            },
          ],
          as: "teacher",
        },
      },
      {
        $unwind: "$teacher",
      },
      {
        $lookup: {
          from: "videos",
          let: { teacherId: "$teacher._id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$teacherId", "$$teacherId"] },
                isActive: true,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                title: 1,
              },
            },
          ],
          as: "videos",
        },
      },
      {
        $project: {
          _id: 1,
          subjectName: 1,
          courseFieldId: 1,
          iconName: 1,
          isDelete: 1,
          isActive: 1,
          teacher: 1,
          playlist: { $arrayElemAt: ["$videos.title", 0] },
        },
      },
    ]);
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    } else {
      return successResponseObject({ req, res, data, code: 200 });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
