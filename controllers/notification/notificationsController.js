import { successResponse, errorResponse } from "../../helpers/index.js";
import notifications from "../../modules/notifications.js";

/**
 * Get user all notifications.
 *
 * @param {*} req The request object containing the 'userId'
 * @param {*} res The response showing all notifiactions
 */

export const getAllNotifications = async (req, res) => {
  try {
    const studentId = req.user.userId || req.body.userId;
    const notificationData = await notifications
      .find({
        userId: studentId,
        isDelete: false,
      })
      .sort({ _id: -1 });
    if (!notificationData.length) {
      return successResponse(req, res, [], 200, "Data not found");
    } else {
      return successResponse(req, res, notificationData, 200);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};

/**
 * Update user read notification.
 *
 * @param {*} req The request object containing the 'userId'
 * @param {*} res The response object for updating read value to true.
 */

export const readAllNotifications = async (req, res) => {
  try {
    const notificationId = req.body.notificationIds;
    const readNotification = await notifications.updateMany(
      { _id: { $in: notificationId } },
      { $set: { read: true } }
    );
    if (!readNotification) {
      return errorResponse(req, res, "Error in updating data", 401);
    } else {
      return successResponse(req, res, [], 200, "success");
    }
  } catch (error) {
    console.error(error);
    return errorResponse(req, res, error, 500);
  }
};
/**
 * Delete user notifications.
 *
 * @param {*} req The request object containing the 'userId'
 * @param {*} res The response object for delete notification.
 */
export const deleteNotifications = async (req, res) => {
  try {
    const notificationId = req.body.notificationIds;
    const deleteAllNotification = await notifications.updateMany(
      { _id: { $in: notificationId } },
      { $set: { isDelete: true, isActive: false } }
    );
    if (!deleteAllNotification) {
      return errorResponse(req, res, "Error while delete", 401);
    } else {
      return successResponse(req, res, [], 200, "success");
    }
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};

export const getAllNotificationsByAdmin = async (req, res) => {
  try {
    const notificationData = await notifications.find({
      userId: { $exists: false },
      teacherId: { $exists: false },
      isDelete: false,
    });
    if (!notificationData.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, notificationData, 200);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};
export const getAllNotificationsByTeacher = async (req, res) => {
  try {
    const notificationData = await notifications.find({
      adminId: { $exists: false },
      userId: { $exists: false },
      isDelete: false,
    });
    if (!notificationData.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, notificationData, 200);
    }
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 500);
  }
};
