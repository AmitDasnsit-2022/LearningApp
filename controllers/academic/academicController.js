// Controller to add a new academic entry to the database
import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import academic from "../../modules/academic.js";

/**
 * Add a new academic entry to the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - name: The name of the academic entry to be added.
 *                - iconId: The ID of the icon associated with the academic entry.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The newly created academic entry.
 */
export const addAcademic = async (req, res) => {
  try {
    const { name, iconId } = req.body;
    // Check if the academic entry already exists in the database
    let data = await academic.findOne({ name });
    if (!data) {
      // If not, create a new academic entry and save it to the database
      data = new academic({
        name: name,
        iconName: iconId,
      });
      await data.save();
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        msg: "Add Successful...",
      });
    } else if (data.isDelete) {
      let data = await academic.findOneAndUpdate(
        { name },
        { isDelete: false },
        { new: true }
      );
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        msg: "Add Successful...",
      });
    } else {
      // If the academic entry already exists, return an error response
      return errorResponseObject({
        req,
        res,
        error: `${name} is already Exist`,
        code: 403,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Update an existing academic entry in the database.
 *
 * @param {*} req The request object containing the following fields:
 *                - name: The name of the academic entry to be updated.
 *                - iconId: The ID of the icon associated with the academic entry.
 *                - academicId: The ID of the academic entry to be updated.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} The updated academic entry.
 */
export const updateAcademic = async (req, res) => {
  try {
    const { name, iconId, academicId, isActive } = req.body;
    const data = await academic
      .findOneAndUpdate(
        { _id: academicId },
        { $set: { name, iconName: iconId, isActive: isActive } },
        { new: true }
      )
      .populate({ path: "iconName", select: ["name", "fileUrl"] });
    if (!data) {
      // If the academic entry is not found, return an error response
      return errorResponseObject({
        req,
        res,
        error: `Data not found`,
        code: 404,
      });
    } else {
      // If the academic entry is updated successfully, return a success response
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        msg: "Data Updated...",
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * Get all academic entries that are not deleted from the database.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 * @returns {data[]} An array of academic entries.
 */
export const getall = async (req, res) => {
  try {
    // Find all academic entries with the property 'isDelete' set to false
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const data = await academic
      .find({ isDelete: false })
      .populate("iconName", "-_id name fileUrl")
      .sort({ _id: 1 })
      .skip(skip)
      .limit(limit);
    const count = await academic.countDocuments({ isDelete: false });
    if (!data.length) {
      // If no academic entries are found, return an error response
      return errorResponseObject({
        req,
        res,
        error: `Data not found`,
        code: 404,
      });
    } else {
      // If academic entries are found, return a success response with the data
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        msg: "Data Updated...",
        count: count,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

// Add more controllers here, if you have additional ones.
// Don't forget to include detailed comments for each function explaining their purpose, parameters, and return values.
// For example:

/**
 * Delete an academic entry from the database.
 *
 * @param {*} req The request object containing the academicId of the entry to be deleted.
 * @param {*} res The response object for sending JSON data.
 * @returns {message} A success message indicating that the academic entry was deleted successfully.
 */
export const deleteAcademic = async (req, res) => {
  try {
    const { academicId } = req.body;
    // Find the academic entry with the given academicId and delete it
    const data = await academic.findOneAndUpdate(
      { _id: academicId },
      { isActive: false, isDelete: true }
    );
    if (!data) {
      // If the academic entry is not found, return an error response
      return errorResponseObject({
        req,
        res,
        error: `Data not found`,
        code: 404,
      });
    } else {
      // If the academic entry is deleted successfully, return a success response
      return successResponseObject({
        req,
        res,
        msg: "Academic entry deleted successfully.",
        code: 200,
      });
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
