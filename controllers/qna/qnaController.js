import {
  errorResponseObject,
  successResponseObject,
} from "../../helpers/index.js";
import qnaModal from "../../modules/qna.js";
import attemptModel from "../../modules/attempt.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
export const createQna = async (req, res) => {
  try {
    const {
      question,
      solution,
      qnalistId,
      correctAnswer,
      subjectId,
      marks,
      a,
      b,
      c,
      d,
    } = req.body;
    let data = await qnaModal.findOne({ question, subjectId });
    let solutionfileurl,
      questionfileurl,
      optionAUrl,
      optionBUrl,
      optionCUrl,
      optionDUrl;

    if (!data) {
      if (req.files) {
        if (req.files.solutionfileurl) {
          solutionfileurl = await uploadFiles(
            req.files.solutionfileurl,
            "testsQna"
          );
        }
        if (req.files.questionfileurl) {
          questionfileurl = await uploadFiles(
            req.files.questionfileurl,
            "testsQna"
          );
        }
        if (req.files.a) {
          optionAUrl = await uploadFiles(req.files.a, "testsQna");
        } else {
          optionAUrl = a;
        }
        if (req.files.b) {
          optionBUrl = await uploadFiles(req.files.b, "testsQna");
        } else {
          optionBUrl = b;
        }
        if (req.files.c) {
          optionCUrl = await uploadFiles(req.files.c, "testsQna");
        } else {
          optionCUrl = c;
        }
        if (req.files.d) {
          optionDUrl = await uploadFiles(req.files.d, "testsQna");
        } else {
          optionDUrl = d;
        }
      }
      data = new qnaModal({
        question: question,
        questionfileurl: questionfileurl,
        a: optionAUrl,
        b: optionBUrl,
        c: optionCUrl,
        d: optionDUrl,
        solution: solution,
        solutionfileurl: solutionfileurl,
        qnalistId,
        marks,
        correctAnswer: correctAnswer,
      });
      await data.save();

      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        msg: "Data added successfully...",
      });
    } else {
      return errorResponseObject({
        req,
        res,
        error: "Data already exist",
        code: 403,
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const qnaByQnalistId = async (req, res) => {
  try {
    const { qnalistId } = req.body;
    const data = await qnaModal.find({
      qnalistId: qnalistId,
      isActive: true,
      isDelete: false,
    });
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description qna answerLists
 */
export const qnaListAnswer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { qnalistId } = req.body;
    const data = await attemptModel
      .find({
        qnalistId: qnalistId,
        studentId: new ObjectId(userId),
        isActive: true,
        isDelete: false,
      })
      .populate("questionId");
    if (!data.length) {
      return errorResponseObject({
        req,
        res,
        error: "Data not found",
        code: 404,
      });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};