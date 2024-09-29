import planModal from "../../modules/planduration.js";
import { errorResponse, successResponse } from "../../helpers/index.js";

export const addPlanDuration = async (req, res) => {
  try {
    const { duration, iconId } = req.body;
    let data = await planModal.findOne({ duration }).populate({
      path: "iconId",
      modal: "filesModal",
      select: ["fileUrl"],
    });
    if (!data) {
      data = new planModal({ duration, iconId });
      let savedata = await data.save();
      return successResponse(req, res, savedata, 200, "Plan duration saved...");
    } else {
      return errorResponse(req, res, "Data already Exist", 403);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getAllDuration = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
		let limit = req.body.limit || 200;
    let data = await planModal.find({ isDelete: false }).populate({
      path: "iconId",
      modal: "filesModal",
      select: ["fileUrl"],
    })
    .skip(skip)
    .limit(limit);
    const countQuery = await planModal.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not Exist", 404);
    } else {
      return successResponse(req, res, data, 200,'','', countQuery);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getAllForStudent = async (req, res) => {
  try {
    let data = await planModal
		.find({ isDelete: false, isActive: true })
		.populate({
			path: "iconId",
			modal: "filesModal",
			select: ["fileUrl"],
		})
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
