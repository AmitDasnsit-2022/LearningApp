import {
  errorResponse,
  successResponse,
  uploadFiles,
} from "../../helpers/index.js";
import fileModal from "../../modules/filesmodal.js";
import path from "path";

/**
 * Upload multiple files and save their details in the fileModal collection.
 *
 * @param {*} req The request object containing the uploaded files and category (folderName).
 * @param {*} res The response object for sending JSON data.
 */
export const addFileMultiples = async (req, res) => {
  try {
    if (!req.files) {
      return errorResponse(req, res, "Please select files", 400);
    }
    const { columnName, courseFieldId } = req.body;
    const { files } = req.files;
    let folderName = req.body.category;
    const filesEndPoind = files.map((file) => uploadFiles(file, folderName));
    const fileUrls = await Promise.all(filesEndPoind);
    const filesToSave = files.map((file, index) => ({
      name: path.parse(file.name).name,
      fileUrl: fileUrls[index],
      folderName: folderName,
      courseFieldId: courseFieldId,
    }));
    const savedFiles = await fileModal.insertMany(filesToSave);
    const filedata = savedFiles.map((data) => {
      return { columnName, ...data.toObject() };
    });
    return successResponse(req, res, filedata, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Update an existing file by fileId and category (folderName).
 *
 * @param {*} req The request object containing the fileId and category (folderName).
 * @param {*} res The response object for sending JSON data.
 */
export const updateFile = async (req, res) => {
  try {
    const { fileId, category, isActive, courseFieldId } = req.body;
    const filedata = await fileModal.findOne({ _id: fileId });
    let filepath;
    let filename;
    if (filedata) {
      if (req.files) {
        let { files } = req.files;
        filename = path.parse(files.name).name;
        filepath = await uploadFiles(files, category, filedata.fileUrl);
      }
      const updatedData = await fileModal
        .findOneAndUpdate(
          { _id: fileId },
          {
            $set: {
              name: filename,
              fileUrl: filepath,
              folderName: category,
              isActive,
              courseFieldId: courseFieldId,
            },
          },
          { new: true }
        )
        .sort({ _id: -1 });
      return successResponse(req, res, updatedData, 200);
    } else {
      return errorResponse(req, res, "Data not found", 404);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all files belonging to a specific folder (category).
 *
 * @param {*} req The request object containing the folderName.
 * @param {*} res The response object for sending JSON data.
 */
export const getByFolder = async (req, res) => {
  try {
    const { folderName } = req.body;
    const filedata = await fileModal
      .find({ folderName: folderName, isDelete: false })
      .sort({ _id: -1 });
    if (!filedata.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, filedata, 200);
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Upload a single file and save its details in the fileModal collection.
 *
 * @param {*} req The request object containing the uploaded file and category (folderName).
 * @param {*} res The response object for sending JSON data.
 */
export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.files) {
      return errorResponse(req, res, "Please select files", 400);
    }
    const { files } = req.files;
    const { courseFieldId } = req.body;
    let folderName = req.body.category;
    const fileUrl = await uploadFiles(files, folderName);

    const savedFiles = await fileModal.create({
      name: path.parse(files.name).name,
      fileUrl: fileUrl,
      folderName: folderName,
      courseFieldId: courseFieldId,
    });
    return successResponse(req, res, savedFiles, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Delete a file by fileId.
 *
 * @param {*} req The request object containing the fileId.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      return errorResponse(req, res, "File id is required", 400);
    } else {
      const data = await fileModal.findOneAndUpdate(
        { _id: fileId },
        {
          $set: { isDelete: true },
        },
        { new: true }
      );
      return successResponse(req, res, [], 200, "File deleted successfully...");
    }
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all files from the fileModal collection that are not marked as deleted.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getfiles = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const data = await fileModal
      .find({ isDelete: false, folderName: { $ne: "testqna" } })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    const countQuery = await fileModal.countDocuments({
      isDelete: false,
      folderName: { $ne: "testqna" },
    });
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

/**
 * Get all unique folder names from the fileModal collection.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const getAllFolderName = async (req, res) => {
  try {
    const data = await fileModal.schema.path("folderName").enumValues;
    return successResponse(req, res, data, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get all files from the fileModal collection that are not marked as deleted.
 *
 * @param {*} req The request object.
 * @param {*} res The response object for sending JSON data.
 */
export const allBanners = async (req, res) => {
  try {
    const data = await fileModal
      .find({ folderName: "banners" })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description get banner by courseFieldId
 */
export const bannerbycourseField = async (req, res) => {
  try {
    const { courseFieldId } = req.body;
    const data = await fileModal
      .find({
        folderName: "banners",
        courseFieldId: courseFieldId,
        isActive: true,
        isDeleted: false,
      })
      .sort({ _id: -1 });
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    }
    return successResponse(req, res, data, 200);
  } catch (error) {
    // Handle any errors that occur during the process and return an error response
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Total number of files
 */
export const totalFiles = async (req, res) => {
  try {
    const totalfiles = await fileModal.countDocuments({ isDelete: false });
    return totalfiles;
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
