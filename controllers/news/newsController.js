import {
  errorResponse,
  sendMultiNotification,
  successResponse,
} from "../../helpers/index.js";
import newsModal from "../../modules/news.js";
import subscriptionModel from "../../modules/subscription.js";
import { uploadFiles } from "../../helpers/index.js";
import courseFields from "../../modules/courseFields.js";
import mongoose from "mongoose";
import { getAllStudentFcmtokenByCoursefieldId } from "../subscription/subscriptionController.js";
import eventEmitter from "../../helpers/eventEmiters.js";
const ObjectId = mongoose.Types.ObjectId;

/**
 * @description Add news API
 * @access Admin
 */
export const addNews = async (req, res) => {
  try {
    const { title, description, courseFieldId } = req.body;
    let filedata;
    if (req.files) {
      const { newsImg } = req.files;
      filedata = await uploadFiles(newsImg, "news");
    }
    const newsdata = new newsModal({
      title,
      description,
      courseFieldId,
      newsImg: filedata,
    });
    let studentdata = await getAllStudentFcmtokenByCoursefieldId(req.body);
    eventEmitter.emit("createNotification", {
      courseFieldId,
      notificationType: "news",
      title: "New news",
      description: `New News related with your Course`,
    });
    sendMultiNotification(
      studentdata,
      "New News",
      "New News related with your Course",
      req.body
    );
    const data = await newsdata.save();
    return successResponse(req, res, data, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Get all news API
 * @access Admin
 */
export const getNews = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const data = await newsModal
      .find({ isDelete: false })
      .sort({ _id: -1 })
      .populate("courseFieldId")
      .skip(skip)
      .limit(limit);
    const countQuery = await newsModal.countDocuments({ isDelete: false });

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

/**
 * @description Delete news API
 * @access Admin
 */
export const newsDelete = async (req, res) => {
  try {
    const { newsId } = req.body;
    const data = await newsModal.findOneAndUpdate(
      { _id: newsId },
      { $set: { isDelete: true } },
      { new: true }
    );
    if (data) {
      return successResponse(req, res, "News deleted successfully...", 200);
    } else {
      return errorResponse(req, res, "Data not found", 404);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Update news API
 * @access Admin
 */
export const updateNews = async (req, res) => {
  try {
    const { newsId, title, description, isActive } = req.body;
    let filedata;
    if (req.files) {
      const { newsImg } = req.files;
      filedata = await uploadFiles(newsImg, "news");
    }
    const data = await newsModal.findOneAndUpdate(
      { _id: newsId },
      { $set: { isActive, title, description, newsImg: filedata } },
      { new: true }
    );
    if (data) {
      return successResponse(
        req,
        res,
        data,
        200,
        "News Updated successfully..."
      );
    } else {
      return errorResponse(req, res, "Data not found", 404);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Get all news API
 * @access Students
 */
export const studentNews = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const allNews = await newsModal.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          isActive: true,
          isDelete: false,
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
          courseFieldId: {
            $arrayElemAt: ["$courseFieldId", 0],
          },
        },
      },
    ]);
    if (!allNews.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, allNews, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Get news by id API
 * @access Students
 */
export const newsById = async (req, res) => {
  const { newsId } = req.body;
  try {
    const news = await newsModal.findOne({
      _id: newsId,
      isActive: true,
      isDelete: false,
    });
    if (!news) {
      return errorResponse(req, res, "News not found", 404);
    }
    return successResponse(req, res, news, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
