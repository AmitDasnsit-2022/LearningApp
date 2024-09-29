import {
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import qnalists from "../../modules/qnalists.js";
import qnamodal from "../../modules/qna.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const createQnalist = async (req, res) => {
  try {
    const { qnadata, videoId, duration, title, description } = req.body;
    const qnalistdata = await qnalists.create({
      videoId,
      duration,
      title,
      description,
    });
    if (!qnalistdata) {
      return errorResponse(req, res, "Data not found", 404);
    }
    const qnadatawithqnalistId = qnadata.map((qnadata, i) => {
      return { ...qnadata, qnalistId: qnalistdata._id };
    });
    let data = await qnamodal.insertMany(qnadatawithqnalistId);
    const result = {
      qnalistdata,
      qnaData: data,
    };
    return successResponseObject({
      req,
      res,
      data: result,
      code: 200,
      msg: "Data added successfully",
    });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const getByVideoId = async (req, res) => {
  try {
    const { videoId } = req.body;
    const data = await qnalists.aggregate([
      {
        $match: {
          videoId: new ObjectId(videoId),
          isDelete: false,
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
                isActive: true,
                isDelete: false,
              },
            },
          ],
          as: "qnas",
        },
      },
    ]);
    if (!data) {
      errorResponseObject({ req, res, error: "Data not found", code: 404 });
    }
    return successResponseObject({ req, res, data, code: 200 });
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
