import { errorResponse, successResponse } from "../../helpers/index.js";
import roles from "../../modules/roles.js";

export const addRole = async (req, res) => {
  try {
    let { roleName } = req.body;
    roleName = roleName.toLowerCase();
    let data = await roles.findOne({ roleName });
    if (!data) {
      data = new roles({
        roleName,
      });
      await data.save();
      return successResponse(req, res, data, 200);
    } else if (data.isDelete) {
      let existData = await roles.findOneAndUpdate(
        { roleName },
        { $set: { isDelete: false, isActive: true } },
        { new: true }
      );
      return successResponse(req, res, existData, 200);
    } else {
      return errorResponse(req, res, `${roleName} is already exist`, 403);
    }
  } catch (error) {
    return errorResponse(req, res, error.message, 500);
  }
};

export const updateRole = async (req, res) => {
  try {
    const { roleName, isActive, roleId } = req.body;
    let data = await roles.findOneAndUpdate(
      { _id: roleId },
      { $set: { roleName: roleName.toLowerCase(), isActive } },
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

export const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.body;
    let data = await roles.findOneAndUpdate(
      { _id: roleId },
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

export const getAllRoles = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const data = await roles
      .find({ isDelete: false })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await roles.countDocuments({ isDelete: false });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200, "", "", countQuery);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
