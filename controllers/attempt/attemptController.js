// Controller to add a new attemptTest entry to the database
import { errorResponse, successResponse } from "../../helpers/index.js";
import mongoose from "mongoose";
import qnalists from "../../modules/qnalists.js";
import attempt from "../../modules/attempt.js";
const ObjectId = mongoose.Types.ObjectId;

/**
 * Add multiple attemptTest entries in bulk to the database.
 *
 * @param {*} req The request object containing an array of attemptTest entries to be added.
 *                Each entry should contain the following fields:
 *                - testListId: The ID of the test list associated with the attempts.
 *                - subjectId: The ID of the subject for which the test is conducted.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} An array of newly created attemptTest entries.
 * studentId,
questionId,
qnalistId,
studentAnswer,
 */
export const addInBulk = async (req, res) => {
  try {
    const { qnalistId } = req.body[0];
    const { userId } = req.user;
    req.body.forEach(async (data, i) => {
      await attempt.findOneAndReplace(
        {
          questionId: data.questionId,
          qnalistId: data.qnalistId,
          studentId: userId,
        },
        {
          studentId: userId,
          questionId: data.questionId,
          qnalistId: data.qnalistId,
          studentAnswer: data.studentAnswer ? data.studentAnswer : null,
        },
        {
          upsert: true,
        }
      );
    });
    const totalMarksOfQna = await qnalists.aggregate([
      {
        $match: {
          _id: new ObjectId(qnalistId),
        },
      },
      {
        $lookup: {
          from: "qnas",
          let: { qnalistId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$qnalistId", "$$qnalistId"] },
              },
            },
          ],
          as: "qnas",
        },
      },
      {
        $addFields: {
          totalMarks: {
            $sum: "$qnas.marks",
          },
        },
      },
      { $project: { testQnaIds: 0 } },
    ]);
    let score = await attempt.aggregate([
      {
        $match: {
          studentId: new ObjectId(userId),
          isActive: true,
          qnalistId: new ObjectId(qnalistId),
          isDelete: false,
          studentAnswer: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "qnas",
          localField: "questionId", // Match based on questionId
          foreignField: "_id",
          as: "qnadata",
        },
      },
      {
        $unwind: "$qnadata",
      },
      {
        $project: {
          studentAnswer: 1,
          qnadata: 1,
        },
      },
    ]);

    if (!score.length) {
      return errorResponse(req, res, "Data not inserted...", 400);
    }

    let totalMarks = 0;
    let correctAnswerCount = 0;
    if (totalMarksOfQna.length) {
      totalMarks = totalMarksOfQna[0].totalMarks;
    }

    score.forEach((data) => {
      if (data.studentAnswer === data.qnadata.correctAnswer) {
        correctAnswerCount += data.qnadata.marks;
      }
    });

    return successResponse(
      req,
      res,
      { totalMarks: totalMarks, obtainMarks: correctAnswerCount },
      200,
      "Your total Score"
    );
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
