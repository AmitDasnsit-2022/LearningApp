import planModal from "../../modules/plans.js";
import planduration from "../../modules/planduration.js";
import {
  errorResponse,
  orderGenerate,
  successResponse,
} from "../../helpers/index.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

export const addPlan = async (req, res) => {
  try {
    const {
      courseFieldId,
      planTypes,
      description,
      amount,
      planFeatures,
      courseId,
    } = req.body;

    let data = await planModal.findOne({
      courseFieldId,
      planTypes,
    });
    if (!data) {
      data = new planModal({
        courseFieldId,
        planTypes,
        description,
        amount,
        planFeatures,
        courseId,
      });
      let savedata = await data.save();
      await data.populate("courseFieldId");
      return successResponse(req, res, savedata, 200, "Plan data saved...");
    } else if (data.isDelete) {
      let existData = await planModal.findOneAndUpdate(
        { planTypes, courseFieldId },
        { $set: { isDelete: false, isActive: true } },
        { new: true }
      );
      return successResponse(req, res, existData, 200, "Data Add successful");
    }
    {
      return errorResponse(req, res, "Data already Exist", 403);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const updatePlan = async (req, res) => {
  try {
    const {
      courseFieldId,
      planTypes,
      description,
      amount,
      planFeatures,
      courseId,
      planId,
      isActive,
    } = req.body;

    let data = await planModal
      .findOneAndUpdate(
        { _id: planId },
        {
          $set: {
            courseFieldId,
            planTypes,
            description,
            amount,
            planFeatures,
            courseId,
            isActive,
          },
        },
        { new: true }
      )
      .populate("courseFieldId");
    if (!data) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, data, 200, "Plan data Updated...");
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getAll = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    let data = await planModal
      .find({ isDelete: false })
      .populate("courseFieldId")
      .skip(skip)
      .limit(limit);
    const countQuery = await planModal.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, data, 200, "", "", countQuery);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const deletePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    let data = await planModal.findOneAndUpdate(
      { _id: planId },
      { $set: { isDelete: true, isActive: false } },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, [], 200, "Data Deleted...");
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getOne = async (req, res) => {
  try {
    const { planId } = req.body;
    let data = await planModal.findOne({ _id: planId, isDelete: false });
    if (!data) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getBycourseFieldId = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    let data = await planModal.find({
      isDelete: false,
      isActive: true,
      courseFieldId: courseFieldId,
    });
    if (!data.length) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
