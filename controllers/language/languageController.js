import { errorResponse, successResponse } from "../../helpers/index.js";
import language from "../../modules/language.js";

/**
 * Add a new language with the given name and iconId.
 *
 * @param {*} req The request object containing the language name and iconId.
 * @param {*} res The response object for sending JSON data.
 */
export const addLanguage = async (req, res) => {
  try {
    const { name, iconId } = req.body;
    let data = await language.findOne({ name: name.toUpperCase() });
    if (!data) {
      data = new language({ name: name.toUpperCase(), iconName: iconId });
      await data.save();
      await data.populate("iconName");
      return successResponse(req, res, data, 200, "Add successfully...");
    } else if (data.isDelete) {
      let existData = await language.findOneAndUpdate(
        { name: name.toUpperCase() },
        { $set: { isDelete: false, isActive: true } },
        { new: true }
      );
      return successResponse(req, res, existData, 200, "Add successfully...");
    } else {
      return errorResponse(req, res, `${name} already Exist`, 403);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Update an existing language by languageId with the given name and iconId.
 *
 * @param {*} req The request object containing the languageId, name, and iconId.
 * @param {*} res The response object for sending JSON data.
 */
export const updateLanguage = async (req, res) => {
  try {
    const { languageId, name, iconId, isActive } = req.body;
    const data = await language.findOne({ _id: languageId });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      const updateData = await language
        .findOneAndUpdate(
          { _id: languageId },
          {
            $set: {
              iconName: iconId,
              name,
              isActive,
            },
          },
          {
            new: true,
          }
        )
        .populate({ path: "iconName", select: ["name", "fileUrl"] });
      return successResponse(req, res, updateData, 200, "Data updated...");
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Delete an existing language by languageId with the given name and iconId.
 *
 * @param {*} req The request object containing the languageId, name, and iconId.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteLanguage = async (req, res) => {
  try {
    const { languageId } = req.body;
    const data = await language.findOne({ _id: languageId });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      const updateData = await language
        .findOneAndUpdate(
          { _id: languageId },
          {
            $set: {
              isDelete: true,
              isActive:false,
            },
          },
          {
            new: true,
          }
        )
      return successResponse(req, res, [], 200, "Data Deleted...");
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};



/**
 * Get all existing languages that are not marked as deleted.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllLanguage = async (req, res) => {
  try {
    const data = await language
      .find({ isDelete: false })
      .populate("iconName", "-_id name fileUrl")
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
