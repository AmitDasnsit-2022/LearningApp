import doubtModal from "../../modules/doubt.js";
import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
  uploadFiles,
} from "../../helpers/index.js";
import notifications from "../../modules/notifications.js";
import enrolledTeacher from "../../modules/enrolledTeacher.js";

// Get all doubts
export const getAllDoubts = async (req, res) => {
  try {
    const doubts = await doubtModal.find({ isDelete: false, isActive: true });
    if (!doubts.length) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponse(req, res, doubts, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Get a single doubt by ID
export const getDoubtById = async (req, res) => {
  const { doubtId } = req.body;
  try {
    const doubt = await doubtModal
      .findOne({ _id: doubtId, isActive: true })
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] })
      .populate({ path: "courseFieldId" });
    if (!doubt) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponse(req, res, doubt, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Update a doubt by ID
export const updateDoubtById = async (req, res) => {
  const { doubtId, subjectId, studentId, courseFieldId, teacherId, message } =
    req.body;
  try {
    const result = await doubtModal.findOneAndUpdate(
      { _id: doubtId },
      {
        $set: {
          subjectId,
          studentId,
          courseFieldId,
          teacherId,
          message,
        },
      },
      {
        new: true,
      }
    );
    if (!result) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponse(req, res, result, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Delete a doubt by ID
export const deleteDoubtById = async (req, res) => {
  const { doubtId } = req.body;
  try {
    const result = await doubtModal.findOneAndUpdate(
      { _id: doubtId },
      { $set: { isDelete: true, isActive: false } },
      { new: true }
    );
    if (!result) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponse(req, res, result, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Get doubts by subject ID
export const getDoubtsBySubjectId = async (req, res) => {
  let skip = req.body.skip || 0;
  let limit = req.body.limit || 200;
  const { subjectId } = req.body;
  const studentId = req.user.userId;
  try {
    const result = await doubtModal
      .find({
        subjectId,
        studentId: studentId,
        isDelete: false,
        isActive: true,
      })
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] })
      .skip(skip)
      .limit(limit);
    const count = await doubtModal.countDocuments({
      studentId: studentId,
      isDelete: false,
      isActive: true,
      subjectId: subjectId,
    });
    if (!result.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 200,
      });
    }
    return successResponseObject({
      req,
      res,
      data: result,
      code: 200,
      count: count,
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({
      req,
      res,
      error: "Data not found",
      code: 404,
    });
  }
};

/**
 * @description Api for students to add their doubts
 **/
export const addDoubt = async (req, res) => {
  try {
    const { subjectId, courseFieldId, message } = req.body;
    const studentId = req.user.userId;
    let filedata = [];
    if (req.files && req.files.imageUrl) {
      if (Array.isArray(req.files.imageUrl)) {
        for (let file of req.files.imageUrl) {
          const uploadedFile = await uploadFiles(file, "doubts");
          filedata.push(uploadedFile);
        }
      } else {
        const uploadedFile = await uploadFiles(req.files.imageUrl, "doubts");
        filedata.push(uploadedFile);
      }
    }
    const newDoubt = new doubtModal({
      subjectId,
      studentId,
      courseFieldId,
      fileUrl: filedata,
      message,
    });
    const teacherdata = await enrolledTeacher.findOne({
      courseField: courseFieldId,
      subjectId,
    });
    await notifications.create({
      notificationType: "doubt",
      title: "New Doubt",
      description: `New Doubt Comming.`,
      teacherId: teacherdata.teacherId ? teacherdata.teacherId : null,
    });
    const data = await newDoubt.save();
    return successResponse(req, res, data, 200, "Doubt added successfully");
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};

/**
 * @description Admin Dashboard
 */

/**
 * @description Solution added by teacher
 **/
export const addSolution = async (req, res) => {
  try {
    const teacherId = req.user.userId || req.body;
    const { doubtId, solutionMsg } = req.body;
    let filedata = [];
    if (req.files && req.files.solutionUrl) {
      if (req.files.solutionUrl.length) {
        for (let file of req.files.solutionUrl) {
          let uploadedFile = await uploadFiles(file, "doubts");
          filedata.push(uploadedFile);
        }
      } else {
        let uploadedFile = await uploadFiles(req.files.solutionUrl, "doubts");
        filedata.push(uploadedFile);
      }
    }
    const solution = await doubtModal.findOneAndUpdate(
      { _id: doubtId },
      {
        $set: {
          teacherId,
          solutionMsg,
          solutionImg: filedata,
          seen: true,
          solved: true,
        },
      },
      {
        new: true,
      }
    );
    if (!solution) {
      return errorResponse(req, res, "solution not found", 200);
    }
    await notifications.create({
      notificationType: "doubt",
      title: "Your doubt Solution",
      description: `Your doubt Solution`,
      userId: solution.studentId,
    });
    return successResponse(req, res, solution, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};

/**
 * @description API's for get all doubts by admin.
 */
export const getAllDoubtsAdmin = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const doubts = await doubtModal
      .find({ isDelete: false })
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] })
      .skip(skip)
      .limit(limit);
    const countQuery = await doubtModal.countDocuments({ isDelete: false });
    if (!doubts.length) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponseObject({
      req,
      res,
      data: doubts,
      code: 200,
      count: countQuery,
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description API's for get doubts by id for admin.
 */
export const getdoubtById = async (req, res) => {
  const { doubtId } = req.body;
  try {
    const doubt = await doubtModal
      .findOne({ _id: doubtId })
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] })
      .populate({ path: "courseFieldId" })
      .populate({ path: "subjectId" });
    if (!doubt) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponse(req, res, doubt, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description API's for get doubts by subject id for admin.
 */
export const getDoubtBySubjectId = async (req, res) => {
  let skip = req.body.skip || 0;
  let limit = req.body.limit || 200;
  const { subjectId, teacherId } = req.body;
  try {
    let query = { subjectId: subjectId };
    if (teacherId) {
      const teacherEnrolledData = await enrolledTeacher.findOne({
        teacherId: teacherId,
        subjectId: subjectId,
      });
      if (!teacherEnrolledData) {
        return errorResponse(req, res, "Doubts not found", 200);
      }
      query["courseFieldId"] = teacherEnrolledData.courseField;
    }
    const result = await doubtModal
      .find(query)
      .populate({ path: "studentId", select: ["profile_img", "fullname"] })
      .populate({ path: "teacherId", select: ["fullname", "image"] })
      .skip(skip)
      .limit(limit);
    if (!result.length) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    const totalCount = await doubtModal.countDocuments({
      subjectId: subjectId,
      isDelete: false,
    });
    return successResponseObject({
      req,
      res,
      data: result,
      code: 200,
      count: totalCount,
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description API's for get all doubts for teacher.
 */
export const getdoubtbyTeacherId = async (req, res) => {
  const teacherId = req.body.teacherId || req.user.userId;
  let skip = req.body.skip || 0;
  let limit = req.body.limit || 10;
  const teacherEnrolled = await enrolledTeacher
    .find({
      teacherId: teacherId,
      isActive: true,
      isDelete: false,
    })
    .select("courseField");
  const filtereddata = teacherEnrolled.map((ids, i) => {
    return ids.courseField;
  });
  let match = {
    courseFieldId: {
      $in: filtereddata,
    },
    $or: [{ teacherId: null }, { teacherId: teacherId }],
  };
  try {
    const result = await doubtModal
      .find(match)
      .limit(limit)
      .skip(skip)
      .populate({ path: "subjectId", select: ["subjectName"] });
    const datacount = await doubtModal.find(match).count();
    if (!result.length) {
      return errorResponse(req, res, "Doubts not found", 200);
    }
    return successResponseObject({
      req,
      res,
      data: result,
      code: 200,
      count: datacount,
    });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
