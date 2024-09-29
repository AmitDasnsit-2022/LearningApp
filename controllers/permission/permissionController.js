import { errorResponse, successResponse } from "../../helpers/index.js";
import permission from "../../modules/permissions.js";

export const addPermission = async (req, res) => {
  try {
    let { permissionName } = req.body;
    permissionName.toLowerCase();
    let data = await permission.findOne({ permissionName });
    if (!data) {
      data = new permission({
        permissionName,
      });
      await data.save();
      return successResponse(req, res, data, 200);
    } else if (data.isDelete) {
      let existData = await permission.findOneAndUpdate(
        { permissionName },
        { $set: { isDelete: false, isActive: true } },
        { new: true }
      );
      return successResponse(req, res, existData, 200);
    } else {
      return errorResponse(req, res, `${permissionName} is already exist`, 403);
    }
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { permissionName, isActive, permissionId } = req.body;
    let data = await permission.findOneAndUpdate(
      { _id: permissionId },
      { $set: { permissionName, isActive } },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, `Data not found`, 404);
    } else {
      return successResponse(req, res, data, 200, "Data Updated");
    }
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { permissionId } = req.body;
    let data = await permission.findOneAndUpdate(
      { _id: permissionId },
      { $set: { isDelete: true } },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, `Data not found`, 404);
    } else {
      return successResponse(req, res, data, 200, "Data deleted");
    }
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
		let limit = req.body.limit || 200;
    const data = await permission.find({ isDelete: false }).sort({ _id: -1 }).skip(skip).limit(limit);
    const countQuery = await permission.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200,'','', countQuery);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
