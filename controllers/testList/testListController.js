import testList from "../../modules/testList.js";
import {
  errorResponse,
  errorResponseObject,
  sendMultiNotification,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import testQnaModal from "../../modules/testQna.js";
import mongoose from "mongoose";
import momentTZ from "moment-timezone";
import subscription from "../../modules/subscription.js";
import attemptTestModel from "../../modules/attemptTest.js";
import moment from "moment";
import { getAllStudentFcmtokenByCoursefieldId } from "../subscription/subscriptionController.js";
import eventEmitter from "../../helpers/eventEmiters.js";
const ObjectId = mongoose.Types.ObjectId;

export const addnew = async (req, res) => {
  try {
    let {
      title,
      subjectId,
      languageId,
      testQnaIds,
      description,
      testListType,
      courseFieldId,
      endTime,
      startTime,
    } = req.body;

    const filter = {
      title,
      subjectId,
      isDelete: false,
      isActive: true,
    };
    startTime = moment(startTime);
    endTime = moment(endTime);
    if (testListType == "exam") {
      filter.courseFieldId = courseFieldId;
      filter.testListType = "exam";
      let studentdata = await getAllStudentFcmtokenByCoursefieldId(filter);
      sendMultiNotification(
        studentdata,
        "New Exam",
        "Your New exam created",
        filter
      );
    }

    let data = await testList.findOne(filter);
    if (!data) {
      data = new testList({
        title,
        endTime,
        startTime,
        numberOfquestion: testQnaIds.length,
        subjectId,
        languageId,
        testQnaIds,
        description,
        testListType,
        courseFieldId,
      });
      eventEmitter.emit("createNotification", {
        courseFieldId,
        notificationType: testListType,
        title: `Your New ${testListType}👍`,
        description:
          "Your exam is scheduled to begin soon. Please prepare yourself accordingly and ensure you're ready for the exam. Best of luck!",
      });
      await data.save();
      return successResponse(req, res, data, 200, "Data added successfully...");
    } else {
      return errorResponse(req, res, "Data already exist", 403);
    }
    // return successResponse(req, res, testQna, 200, 'Data added successfully...');
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const updateData = async (req, res) => {
  try {
    let {
      testListId,
      title,
      subjectId,
      languageId,
      testQnaIds,
      isActive,
      testListType,
      startTime,
      endTime,
      description,
    } = req.body;

    if (startTime && endTime !== undefined) {
      startTime = moment(startTime);
      endTime = moment(endTime);
    }
    let data = await testList
      .findOneAndUpdate(
        { _id: testListId },
        {
          $set: {
            title,
            startTime,
            description,
            endTime,
            numberOfquestion: testQnaIds.length,
            subjectId,
            languageId,
            testQnaIds,
            isActive,
            testListType,
          },
        },
        { new: true }
      )
      .populate("subjectId")
      .populate("languageId")
      .populate("testQnaIds")
      .populate("courseFieldId");
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(
        req,
        res,
        data,
        200,
        "Data updated successfully..."
      );
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getall = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const { subjectId } = req.body;
    let query = {
      isDelete: false,
    };
    if (subjectId) {
      query.subjectId = subjectId;
    }
    let data = await testList
      .find(query)
      .populate({
        path: "languageId",
        modal: "language",
        select: "name",
      })
      .populate({
        path: "subjectId",
        modal: "subjects",
        populate: {
          path: "courseFieldId",
          populate: {
            path: "courseId",
          },
        },
      })
      .populate({
        path: "testQnaIds",
        model: "testsQna",
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await testList.countDocuments(query);
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
    return errorResponse(req, res, error.message, 500);
  }
};

export const getbyid = async (req, res) => {
  try {
    const { testListId } = req.body;
    let data = await testList
      .findOne({ _id: testListId, isDelete: false })
      .populate({
        path: "languageId",
        modal: "language",
      })
      .populate({
        path: "subjectId",
        modal: "subjects",
      })
      .populate({
        path: "testQnaIds",
        model: "testsQna",
      });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getbysubjectid = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const { userId } = req.user;
    const data = await testList.aggregate([
      {
        $match: {
          subjectId: new ObjectId(subjectId),
          isDelete: false,
          isActive: true,
          testListType: "test",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subjectId",
        },
      },
      {
        $unwind: "$subjectId",
      },
      {
        $lookup: {
          from: "languages",
          localField: "languageId",
          foreignField: "_id",
          as: "languageId",
        },
      },
      {
        $unwind: "$languageId",
      },
      {
        $lookup: {
          from: "testsqnas",
          localField: "testQnaIds",
          foreignField: "_id",
          as: "testQnaIds",
        },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "courseFieldId",
          foreignField: "_id",
          as: "courseFieldId",
        },
      },
      {
        $addFields: {
          totalMarks: { $sum: "$testQnaIds.marks" },
        },
      },
      {
        $lookup: {
          from: "attempttests",
          let: { testListId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$testListId", "$$testListId"],
                },
                studentId: new ObjectId(userId),
              },
            },
            {
              $limit: 1,
            },
          ],
          as: "attemptTests",
        },
      },
      {
        $addFields: {
          isAttemptTest: {
            $cond: {
              if: { $gt: [{ $size: "$attemptTests" }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
    ]);

    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const deleteData = async (req, res) => {
  try {
    const { testListId } = req.body;
    let data = await testList.findOneAndUpdate(
      { _id: testListId },
      { $set: { isDelete: true } },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, [], 200, "Data deleted successfully...");
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const examByCourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const { userId } = req.user;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Set the time to the start of the day

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Set the time to the end of the day

    const data = await testList.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          isDelete: false,
          isActive: true,
          testListType: "exam",
          startTime: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "coursefields", // Use the correct collection name
          localField: "courseFieldId", // Use the appropriate field to match testlist ID
          foreignField: "_id", // Use the field in attemptexamlists that stores testlist IDs
          as: "courseFieldId",
        },
      },
      {
        $lookup: {
          from: "attemptexamlists", // Use the correct collection name
          // localField: "_id", // Use the appropriate field to match testlist ID
          // foreignField: "testListId", // Use the field in attemptexamlists that stores testlist IDs
          let: { testListId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$testListId", "$$testListId"],
                    },
                    studentId: new ObjectId(userId),
                    // rank: { $ne: null },
                  },
                ],
              },
            },
          ],
          as: "matchingAttempts",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          endTime: 1,
          startTime: 1,
          numberOfquestion: 1,
          subjectId: 1,
          courseFieldId: {
            $arrayElemAt: ["$courseFieldId", 0],
          },
          languageId: 1,
          testListType: 1,
          testQnaIds: 1,
          isExpired: {
            $cond: {
              if: {
                $and: [
                  {
                    $lt: ["$endTime", new Date()],
                  },
                ],
              },
              then: true, // If matching attempts exist, set expiretest to true
              else: false, // If no matching attempts, set expiretest to false
            },
          },
          isCompleted: {
            $cond: {
              if: {
                $gt: [{ $size: "$matchingAttempts" }, 0], // Check if there are matching attempts
              },
              then: true, // If matching attempts exist, set expiretest to true
              else: false, // If no matching attempts, set expiretest to false
            },
          },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description This API get test list of upcoming exams.
 */
export const upcomingExams = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Set the time to the end of the day
    const data = await testList.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          isDelete: false,
          isActive: true,
          testListType: "exam",
          startTime: { $gte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "coursefields", // Use the correct collection name
          localField: "courseFieldId", // Use the appropriate field to match testlist ID
          foreignField: "_id", // Use the field in attemptexamlists that stores testlist IDs
          as: "courseFieldId",
        },
      },
      {
        $lookup: {
          from: "attemptexamlists", // Use the correct collection name
          localField: "_id", // Use the appropriate field to match testlist ID
          foreignField: "testListId", // Use the field in attemptexamlists that stores testlist IDs
          as: "matchingAttempts",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          endTime: 1,
          startTime: 1,
          numberOfquestion: 1,
          subjectId: 1,
          courseFieldId: {
            $arrayElemAt: ["$courseFieldId", 0],
          },
          languageId: 1,
          testListType: 1,
          testQnaIds: 1,
          isExpired: {
            $cond: {
              if: {
                $and: [
                  {
                    $lt: ["$endTime", new Date()],
                  },
                ],
              },
              then: true, // If matching attempts exist, set expiretest to true
              else: false, // If no matching attempts, set expiretest to false
            },
          },
          isCompleted: {
            $cond: {
              if: {
                $and: [
                  {
                    $gt: [{ $size: "$matchingAttempts" }, 0], // Check if there are matching attempts
                  },
                ],
              },
              then: true, // If matching attempts exist, set expiretest to true
              else: false, // If no matching attempts, set expiretest to false
            },
          },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
/**
 *  @description : Test lists answer by subject and testlist id only for testType("test").
 */
export const testListAnswer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { testListId, subjectId } = req.body;
    const data = await attemptTestModel
      .find({
        testListId: testListId,
        studentId: userId,
        subjectId: subjectId,
        testType: "test",
        isActive: true,
        isDelete: false,
      })
      .populate("questionId");
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 *  @description : Exam Answer list of student (testType=exam).
 */
export const examAnswerList = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { testListId } = req.body;
    const data = await attemptTestModel
      .find({
        testListId: testListId,
        studentId: userId,
        testType: "exam",
        isActive: true,
        isDelete: false,
      })
      .populate("questionId");
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description : Get Test by video test
 */
export const allVideoTest = async (req, res) => {
  try {
    const data = await testList.find({
      isDelete: false,
      isActive: true,
      testListType: "videotest",
    });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description : Get test of type videotest by courseFieldId
 */

export const courseVideoTest = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await testList.find({
      courseFieldId: courseFieldId,
      isActive: true,
      isDelete: false,
      testListType: "videotest",
    });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log(error);
    errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description : completed tests or exam of a courseField
 */
export const completedtestBycourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseFieldId } = req.body;
    const data = await testList.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          testListType: "exam",
          isActive: true,
          isDelete: false,
          endTime: { $lt: new Date() },
        },
      },
      {
        $lookup: {
          from: "attemptexamlists",
          let: { testListId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$testListId", "$$testListId"],
                },
                studentId: new ObjectId(userId),
                rank: { $exists: true },
              },
            },
          ],
          as: "attemptexamlists",
        },
      },
      {
        $unwind: "$attemptexamlists",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "courseFieldId",
          foreignField: "_id",
          as: "courseFieldId",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          startTime: 1,
          attemptexamlists: 1,
        },
      },
      {
        $match: {
          attemptexamlists: { $ne: [] },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error.message, 500);
  }
};
