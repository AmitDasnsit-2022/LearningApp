import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import qnaModal from "../../modules/testQna.js";

export const addNew = async (req, res) => {
  try {
    const data = await qnaModal.insertMany(req.body);
    if (!data.length) {
      return errorResponse(req, res, "Data not inserted", 400);
    }

    return successResponse(req, res, data, 200, "Data added successfully...");
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 * I Got a issue in this API, When I'm try to update answerOption, so update each Object id with option.
 * So i'm try to find data If the document does not exist, create a new one otherwise skip the next data.
 */
export const addInBulk = async (req, res) => {
  try {
    const data = await qnaModal.insertMany(req.body);
    if (!data.length) {
      return errorResponse(req, res, "Data not inserted", 400);
    }
    return successResponse(req, res, data, 200, "Data added successfully...");
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, error.message, 500);
  }
};

export const update = async (req, res) => {
  try {
    const {
      testQnaId,
      question,
      questionfileurl,
      solution,
      solutionfileurl,
      correctAnswer,
      isActive,
      subjectId,
      marks,
      a,
      b,
      c,
      d,
    } = req.body;
    let updatedata = await qnaModal.findOneAndUpdate(
      { _id: testQnaId },
      {
        $set: {
          question,
          questionfileurl,
          subjectId,
          marks,
          correctAnswer,
          solution,
          solutionfileurl,
          isActive,
          a: a,
          b: b,
          c: c,
          d: d,
        },
      },
      { new: true }
    );

    return successResponseObject({
      req,
      res,
      data: updatedata,
      code: 200,
      msg: "Data added successfully...",
    });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getall = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    let data = await qnaModal
      .find({ isDelete: false })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await qnaModal.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getbyid = async (req, res) => {
  try {
    const { testQnaId } = req.body;
    let data = await qnaModal.findOne({ _id: testQnaId, isDelete: false });
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
    const skip = req.body.skip || 0;
    const limit = req.body.limit || 200;
    const { subjectId, playlistId } = req.body;
    const query = {
      subjectId: subjectId,
      isDelete: false,
    };
    if(playlistId){
      query.playlistId = playlistId;
    }
    let data = await qnaModal
      .find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const count = await qnaModal.countDocuments(query);
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200, "", "", count);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const qnadelete = async (req, res) => {
  try {
    const { testQnaId } = req.body;
    let data = await qnaModal.updateOne({ _id: testQnaId }, { isDelete: true });
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

export const getbyids = async (req, res) => {
  try {
    const { questionIds } = req.body;
    const data = await qnaModal.find({
      _id: { $in: questionIds },
      isDelete: false,
      isActive: true,
    });
    if (!data.length) {
      return errorResponse(req, res, "Data not found");
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description get testqna by playlist Id
 */
export const getbyplaylistId = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const data = await qnaModal.find({
      playlistId: playlistId,
      isActive: true,
      isDelete: false,
    });
    if (!data.length) {
      return errorResponseObject({ req, res, error: "data not found" });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
