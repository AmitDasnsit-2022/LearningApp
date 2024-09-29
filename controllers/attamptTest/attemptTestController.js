// Controller to add a new attemptTest entry to the database
import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import attemptTest from "../../modules/attemptTest.js";
import testList from "../../modules/testList.js";
import attemptexamlists from "../../modules/attemptExamList.js";
import subscription from "../../modules/subscription.js";
import mongoose from "mongoose";
import attemptExamList from "../../modules/attemptExamList.js";
import moment from "moment";
const ObjectId = mongoose.Types.ObjectId;

/**
 * Add a new attemptTest entry to the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - studentId: The ID of the student attempting the test.
 *                - questionId: The ID of the question attempted by the student.
 *                - subjectId: The ID of the subject to which the question belongs.
 *                - studentAnswer: The ID of the student's answer for the question.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The newly created attemptTest entry.
 */
export const addnew = async (req, res) => {
  try {
    const { studentId, questionId, subjectId, studentAnswer } = req.body;
    // Check if the attemptTest entry already exists in the database
    let data = await attemptTest.findOne({ subjectId, studentId, questionId });
    if (!data) {
      // If not, create a new attemptTest entry and save it to the database
      data = new attemptTest({
        studentId,
        questionId,
        subjectId,
        studentAnswer: studentAnswer,
      });
      await data.save();
      return successResponse(req, res, data, 200);
    } else if (data.isDelete) {
      let data = await attemptTest.findOneAndUpdate(
        { subjectId, studentId, questionId },
        { $set: { isDelete: false } },
        { new: true }
      );
      return successResponse(req, res, data, 200, "Add Successful...");
    }
    {
      // If the attemptTest entry already exists, return an error response
      return errorResponse(req, res, "Data already exists", 403);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Add multiple attemptTest entries in bulk to the database.
 *
 * @param {*} req The request object containing an array of attemptTest entries to be added.
 *                Each entry should contain the following fields:
 *                - testListId: The ID of the test list associated with the attempts.
 *                - subjectId: The ID of the subject for which the test is conducted.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} An array of newly created attemptTest entries.
 */
export const addInBulk = async (req, res) => {
  try {
    const { testListId, subjectId } = req.body[0];
    const { userId } = req.user;
    req.body.forEach(async (data, i) => {
      await attemptTest.findOneAndReplace(
        {
          subjectId: data.subjectId,
          questionId: data.questionId,
          testListId: data.testListId,
          studentId: userId,
        },
        {
          studentId: userId,
          questionId: data.questionId,
          testListId: data.testListId,
          subjectId: data.subjectId,
          studentAnswer: data.studentAnswer ? data.studentAnswer : null,
        },
        {
          upsert: true,
        }
      );
    });
    const totalMarksOfQna = await testList.aggregate([
      {
        $match: {
          _id: new ObjectId(testListId),
          subjectId: new ObjectId(subjectId),
        },
      },
      {
        $lookup: {
          from: "testsqnas", // name of the foreign collection
          let: { testQnaIds: "$testQnaIds" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$testQnaIds"] },
              },
            },
          ],
          as: "testQnaIds",
        },
      },
      {
        $addFields: {
          totalMarks: {
            $sum: "$testQnaIds.marks",
          },
        },
      },
      { $project: { testQnaIds: 0 } },
    ]);
    let score = await attemptTest
      .find({
        subjectId: subjectId,
        testListId: testListId,
        studentId: userId,
        isActive: true,
        isDelete: false,
        testType: "test",
        studentAnswer: { $ne: null },
      })
      .populate({
        path: "questionId",
        select: ["correctAnswer", "marks"],
      })
      .select(["studentAnswer"]);
    if (!score.length) {
      return errorResponse(req, res, "Data not inserted...", 400);
    }

    let totalMarks = 0;
    let correctAnswerCount = 0;
    if (totalMarksOfQna.length) {
      totalMarks = totalMarksOfQna[0].totalMarks;
    }
    score.forEach((item) => {
      // totalMarks += item.questionId.marks;
      if (item.studentAnswer === item.questionId.correctAnswer) {
        correctAnswerCount += item.questionId.marks;
      }
    });

    return successResponse(
      req,
      res,
      { totalMarks: totalMarks, obtainMarks: correctAnswerCount },
      200,
      "Your total Score"
    );
    // return successResponse(req, res, totalMarksOfQna, 200, "Your total Score");
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description This function is for getting the last attempt test but it's pending right now.
 *
 * @param {*} req The request object containing the following fields:
 *                - subjectId: The ID of the subject to filter the attemptTest entries.
 *                - testListId: The ID of the test list to filter the attemptTest entries.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The attemptTest entry representing the last attempt of the student for the given subject and test list.
 */
export const getLastAttemptTestOfStudent = async (req, res) => {
  try {
    const { subjectId, testListId } = req.body;
    const userId = req.user.userId || req.body.userId;
    const data = await attemptTest
      .findOne({
        studentId: userId,
        subjectId: subjectId,
        testListId: testListId,
        isDelete: false,
      })
      .sort({ createdAt: 1 })
      .populate({
        path: "testListId",
        populate: {
          path: "testQnaIds",
        },
      });

    // TODO: Implement further logic to calculate and return the score for the attemptTest.

    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Add more controllers here, if you have additional ones.
// Don't forget to include detailed comments for each function explaining their purpose, parameters, and return values.
// For example:

/**
 * Update an existing attemptTest entry in the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - attemptTestId: The ID of the attemptTest entry to be updated.
 *                - studentId: The ID of the student attempting the test.
 *                - questionId: The ID of the question attempted by the student.
 *                - subjectId: The ID of the subject to which the question belongs.
 *                - studentAnswer: The ID of the student's answer for the question.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The updated attemptTest entry.
 */
export const update = async (req, res) => {
  try {
    const {
      attemptTestId,
      studentId,
      questionId,
      subjectId,
      studentAnswer,
      isActive,
    } = req.body;
    let data = await attemptTest.findOneAndUpdate(
      { _id: attemptTestId },
      {
        $set: {
          studentId,
          questionId,
          subjectId,
          studentAnswer: studentAnswer,
          isActive,
        },
      },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200, "Data updated successfully");
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all attemptTest entries from the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of attemptTest entries.
 */
export const getall = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    let data = await attemptTest
      .find({ isDelete: false })
      .populate({
        path: "subjectId",
      })
      .populate({
        path: "studentId",
        select: ["-enrolledCourses"],
      })
      .populate({
        path: "questionId",
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await attemptTest.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get the score of a student for a specific subject and test list.
 *
 * @param {*} req The request object containing the following fields:
 *                - subjectId: The ID of the subject for which the score is to be calculated.
 *                - testListId: The ID of the test list for which the score is to be calculated.
 * @param {*} res The response object for sending JSON data.
 * @returns {Object} An object containing the totalMarks and marksObtained for the given subject and test list.
 */
export const getStudentScore = async (req, res) => {
  try {
    const { subjectId, testListId } = req.body;
    let data = await attemptTest
      .find({
        subjectId: subjectId,
        testListId: testListId,
        isActive: true,
        isDelete: false,
      })
      .populate({
        path: "questionId",
        select: ["correctAnswer", "marks"],
      })
      .select(["studentAnswer"]);
    let totalMarks = 0;
    let correctAnswerCount = 0;
    data.forEach((item) => {
      totalMarks += item.questionId.marks;
      if (item.studentAnswer === item.questionId.correctAnswer) {
        correctAnswerCount += item.questionId.marks;
      }
    });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(
        req,
        res,
        { totalMarks, marksObtained: correctAnswerCount },
        200
      );
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all attemptTest entries for a specific student from the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - studentId: The ID of the student for whom the attemptTest entries are to be retrieved.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of attemptTest entries for the given student.
 */
export const getByStudentId = async (req, res) => {
  try {
    const { studentId } = req.body;
    let data = await attemptTest
      .find({ studentId: studentId, isDelete: false })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all attemptTest entries for a specific subject and student from the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - userId: The ID of the student for whom the attemptTest entries are to be retrieved.
 *                           (Can be extracted from req.user if available or req.body).
 *                - subjectId: The ID of the subject for which the attemptTest entries are to be retrieved.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of attemptTest entries for the given subject and student.
 */
export const getBySubjectid = async (req, res) => {
  try {
    const { userId } = req.user || req.body;
    const { subjectId } = req.body;
    let data = await attemptTest
      .find({ subjectId: subjectId, studentId: userId, isDelete: false })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get a specific attemptTest entry by its ID from the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - attemptTestId: The ID of the attemptTest entry to be retrieved.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The attemptTest entry with the given ID.
 */
export const getbyId = async (req, res) => {
  try {
    const { attemptTestId } = req.body;
    const data = await attemptTest.findOne({
      _id: attemptTestId,
      isDelete: false,
    });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description This is for add test data
 * @access Students
 * @router /api/attempttest/testaddinbulk
 */
export const addExam = async (req, res) => {
  try {
    const { testListId, courseFieldId, timeDuration } = req.body[0];
    const { userId } = req.user;

    const subscriptiondata = await subscription.findOne({
      studentId: userId,
      courseFieldId: courseFieldId,
      isActive: true,
      isDelete: false,
    });
    if (!subscriptiondata) {
      errorResponse(req, res, "Unpaid Sub course", 402);
    } else {
      const checkExistData = await attemptexamlists.findOne({
        courseFieldId: courseFieldId,
        testListId: testListId,
        studentId: userId,
      });
      const newdata = req.body.map((data, i) => {
        return {
          studentId: data.studentId,
          questionId: data.questionId,
          testListId: data.testListId,
          subjectId: data.subjectId,
          studentAnswer: data.studentAnswer,
          testType: "exam",
        };
      });
      if (!checkExistData) {
        const testdata = await attemptTest.insertMany(newdata);

        if (!testdata.length) {
          return errorResponse(req, res, "Exam not create", 400);
        } else {
          const totalMarksOfQna = await testList.aggregate([
            {
              $match: {
                _id: new ObjectId(testListId),
              },
            },
            {
              $lookup: {
                from: "testsqnas", // name of the foreign collection
                let: { testQnaIds: "$testQnaIds" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$testQnaIds"] },
                    },
                  },
                ],
                as: "testQnaIds",
              },
            },
            {
              $addFields: {
                totalMarks: {
                  $sum: "$testQnaIds.marks",
                },
              },
            },
            { $project: { testQnaIds: 0 } },
          ]);
          let score = await attemptTest
            .find({
              testListId: testListId,
              studentId: userId,
              isDelete: false,
              testType: "exam",
              studentAnswer: { $ne: null },
            })
            .populate({
              path: "questionId",
              select: ["correctAnswer", "marks"],
            })
            .select(["studentAnswer"]);

          if (!score.length) {
            return errorResponse(req, res, "Data not inserted...", 400);
          }

          let totalMarks = 0;
          let correctAnswerCount = 0;
          if (totalMarksOfQna.length) {
            totalMarks = totalMarksOfQna[0].totalMarks;
          }
          score.forEach((item) => {
            // totalMarks += item.questionId.marks;
            if (item.studentAnswer === item.questionId.correctAnswer) {
              correctAnswerCount += item.questionId.marks;
            }
          });
          const attemptExamData = await attemptexamlists.create({
            studentId: userId,
            courseFieldId: courseFieldId,
            testListId: testListId,
            timeDuration: timeDuration,
            totalMarks: totalMarks,
            obtainMarks: correctAnswerCount,
          });
          return successResponse(
            req,
            res,
            attemptExamData,
            200,
            "Your total Score"
          );
        }
      } else {
        return errorResponse(req, res, "Test already exist", 403);
      }
    }
    // return successResponse(req, res, totalMarksOfQna, 200, "Your total Score");
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const scoreBycourseField = async (req, res) => {
  try {
    const { courseFieldId, testListId } = req.body;
    // console.log({ courseFieldId, userId });
    // Use the aggregation framework to calculate the rank
    const data = await attemptexamlists.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          testListId: new ObjectId(testListId),
        },
      },
      {
        $sort: { obtainMarks: -1, timeDuration: -1 }, // Sort students by total and duration in descending order
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
        $lookup: {
          from: "studentsmodules",
          localField: "studentId",
          foreignField: "_id",
          as: "studentId",
        },
      },
      {
        $addFields: {
          courseFieldId: {
            $arrayElemAt: ["$courseFieldId", 0],
          },
          studentId: { $arrayElemAt: ["$studentId._id", 0] },
          studentName: { $arrayElemAt: ["$studentId.fullname", 0] },
          studentProfile: { $arrayElemAt: ["$studentId.profile_img", 0] },
        },
      },
    ]);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const attemptedexamlist = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const { userId } = req.user;
    const data = await attemptexamlists.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          studentId: new ObjectId(userId),
        },
      },
      {
        $sort: { obtainMarks: -1, timeDuration: -1 }, // Sort students by total and duration in descending order
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
        $lookup: {
          from: "studentsmodules",
          localField: "studentId",
          foreignField: "_id",
          as: "studentId",
        },
      },
      {
        $addFields: {
          courseFieldId: {
            $arrayElemAt: ["$courseFieldId", 0],
          },
          studentId: { $arrayElemAt: ["$studentId._id", 0] },
          studentName: { $arrayElemAt: ["$studentId.fullname", 0] },
          studentProfile: { $arrayElemAt: ["$studentId.profile_img", 0] },
        },
      },
    ]);

    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Calculating All over rank of students API
 */
export const overAllRank = async (req, res) => {
  try {
    const { courseFieldId, duration } = req.body;
    let startDate, endDate;

    if (duration === "week") {
      startDate = moment().startOf("week").toDate();
      endDate = moment().endOf("week").toDate();
    } else if (duration === "month") {
      startDate = moment().startOf("month").toDate();
      endDate = moment().endOf("month").toDate();
    }
    const data = await attemptExamList.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          createdAt: { $gte: startDate, $lte: endDate },
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
        $lookup: {
          from: "studentsmodules",
          localField: "studentId",
          foreignField: "_id",
          as: "studentId",
        },
      },
      {
        $addFields: {
          courseFieldId: { $arrayElemAt: ["$courseFieldId", 0] },
          studentId: { $arrayElemAt: ["$studentId._id", 0] },
          studentName: { $arrayElemAt: ["$studentId.fullname", 0] },
          studentProfile: { $arrayElemAt: ["$studentId.profile_img", 0] },
        },
      },
      {
        $group: {
          _id: "$studentId",
          studentId: { $first: "$studentId" },
          studentData: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          studentDataLength: { $size: "$studentData" }, // Calculate the length of the "studentData" array
        },
      },
      {
        $sort: { studentDataLength: -1 }, // Sort by the length in descending order
      },
      {
        $unwind: "$studentData",
      },
      {
        $group: {
          _id: "$_id",
          studentData: { $push: "$studentData" },
          averageRank: {
            $avg: "$studentData.rank",
          },
          studentDataLength: { $first: "$studentDataLength" }, // Store the length
        },
      },
      {
        $project: {
          averageRank: 1,
          studentId: {
            $arrayElemAt: ["$studentData.studentId", 0],
          },
          studentName: {
            $arrayElemAt: ["$studentData.studentName", 0],
          },
          studentProfile: {
            $arrayElemAt: ["$studentData.studentProfile", 0],
          },
          courseFieldId: {
            $arrayElemAt: ["$studentData.courseFieldId", 0],
          },
        },
      },
      {
        $sort: { averageRank: 1 },
      },
    ]);
    data.forEach((item, index) => {
      item.averageRank = index + 1;
      item.studentId;
    });

    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const studentDataChart = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const { userId } = req.user;
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const startDate = new Date(`${year} 01 01`);
    const endDate = new Date(`${year} ${1 + month} ${1 + day}`);
    const data = await attemptExamList.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" }, // Extract the month from the createdAt field
          _id: 1,
          studentId: 1,
          courseFieldId: 1,
          testListId: 1,
          timeDuration: 1,
          totalMarks: 1,
          obtainMarks: 1,
          isActive: 1,
          isDelete: 1,
          createdAt: 1,
          updatedAt: 1,
          rank: 1,
        },
      },
      {
        $group: {
          _id: {
            month: "$month",
          },
          studentExam: { $push: "$$ROOT" },
        },
      },
      {
        $addFields: {
          studentDataLength: { $size: "$studentExam" },
        },
      },
      {
        $project: {
          currentStudentdata: {
            $filter: {
              input: "$studentExam",
              as: "student",
              cond: {
                $eq: ["$$student.studentId", new ObjectId(userId)],
              },
            },
          },
          studentDataLength: 1,
        },
      },
      {
        $addFields: {
          averageRank: {
            $avg: "$currentStudentdata.rank",
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          month: "$_id.month",
          studentDataLength: 1,
          averageRank: 1,
        },
      },
      {
        $sort: { averageRank: 1 },
      },
    ]);
    data.forEach((item, index) => {
      item.averageRank = index + 1;
    });
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Attempted exam for a particular test or exam id
 */

export const rankbytestlistId = async (req, res) => {
  try {
    const { testListId } = req.body;
    const examData = await attemptExamList
      .find({
        testListId: testListId,
        isActive: true,
        isDelete: false,
        rank: { $exists: true },
      })
      .populate({ path: "studentId", select: ["fullname", "profile_img"] })
      .populate("courseFieldId")
      .sort({ rank: 1 });
    if (!examData) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponseObject({ req, res, data: examData, code: 200 });
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
