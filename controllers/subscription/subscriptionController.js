import {
  errorResponse,
  errorResponseObject,
  sendMail,
  sendMultiNotification,
  sendNotification,
  successResponse,
  successResponseObject,
} from "../../helpers/index.js";
import subscriptionModal from "../../modules/subscription.js";
import paymentHistoryModal from "../../modules/paymentHistory.js";
import crypto from "crypto";
import subscription from "../../modules/subscription.js";
import plans from "../../modules/plans.js";
import mongoose from "mongoose";
import notifications from "../../modules/notifications.js";
import planDurationModel from "../../modules/planduration.js";
const ObjectId = mongoose.Types.ObjectId;

const getDateOfnextOfPlanDuration = (plandurationNumber) => {
  let todayDate = new Date();
  var a = todayDate.getFullYear();
  var m = todayDate.getMonth();
  var d = todayDate.getDate();
  m = m + plandurationNumber;
  todayDate = new Date(a, m, d);
  if (todayDate.getDate() != d) todayDate = new Date(a, m + 1, 0);
  return todayDate;
};

export const addSubscription = async (req, res) => {
  try {
    const {
      courseFieldId,
      planDuration,
      planId,
      paymentStatus,
      paymentMethod,
      orderId,
      totalAmount,
      paymentId,
      paymentSignature,
    } = req.body;
    const { userId, email, fcmToken } = req.user;
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.key_secret)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature !== paymentSignature) {
      return errorResponse(req, res, "Payment not verified", 400);
    }
    const getplanDuration = await planDurationModel.findOne({
      _id: planDuration,
    });
    let expireDate= getDateOfnextOfPlanDuration(getplanDuration.duration);
    // console.log(expectedSignature === "lkjflskdfjlkds");
    let payment = new paymentHistoryModal({
      studentId: userId,
      courseFieldId,
      planDuration,
      planId,
      paymentStatus,
      paymentMethod,
      orderId,
      totalAmount,
      paymentId,
      paymentSignature,
      expireDate: expireDate,
    });
    await payment.save();
    const plandata = await plans.findOne({
      _id: planId,
      isActive: true,
      isDelete: false,
      courseFieldId: courseFieldId,
    });
    if (!plandata) {
      return errorResponse(req, res, "Sub course is not valid to plan");
    }
    if (paymentStatus === "Success") {
      let data = await subscription.findOneAndUpdate(
        {
          courseFieldId: courseFieldId,
          studentId: userId,
          isDelete: false,
          isActive: true,
          isPaid: false,
        },
        {
          $set: {
            planDuration,
            courseId: plandata.courseId,
            planId,
            isPaid: true,
            paymentId: payment._id,
            expireDate: expireDate,
          },
        }
      );
      await notifications.create({
        notificationType: "Subscription",
        title: "New Subscription",
        description: "A new subscription has been created.",
        userId: userId,
      });
      await sendMail(email, "Course Subscription");
      sendNotification(
        fcmToken,
        "Subscription",
        "Subscription Successfully",
        data
      );
      return successResponse(req, res, data, 200, "Subscription Successfully");
    }
    return successResponse(req, res, payment, 200, "Payment add successfully");
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const getSubscriptionStudents = async (streamdata) => {
  try {
    const data = await subscription
      .find({
        courseFieldId: streamdata.subject.courseFieldId,
      })
      .populate({ path: "studentId", select: "fcmToken" });
    if (!data.length) {
      return false;
    }
    // console.log({ subscription: data });
    // data.forEach((user, i) => {
    //   tokens.push(user.studentId.fcmToken);
    // });
    return data;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

export const upGradePlan = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      courseFieldId,
      planDuration,
      planId,
      paymentStatus,
      paymentMethod,
      orderId,
      totalAmount,
      paymentId,
      paymentSignature,
      languageId,
    } = req.body;
    const data = await subscription.findOne({
      courseFieldId,
      planDuration,
      planId,
      studentId: userId,
      isActive: true,
    });
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description total number of paid users in year
 */
export const totalactiveUsers = async (req, res) => {
  try {
    const uniqueStudents = await subscription.aggregate([
      {
        $match: {
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "plandurations", // Use the actual collection name if different
          localField: "planDuration",
          foreignField: "_id",
          as: "planInfo",
        },
      },
      {
        $unwind: "$planInfo",
      },
      {
        $group: {
          _id: "$studentId", // Group by studentId
          isPaid: { $max: "$isPaid" }, // Get the maximum isPaid value for each student
          maxPlanDuration: { $max: "$planInfo.duration" }, // Use the plan duration from planduration model
          latestSubscriptionDate: { $max: "$createdAt" },
        },
      },
      {
        $match: {
          // isPaid: true, // Filter out students with no paid subscriptions
          $and: [
            { isPaid: true },
            {
              $expr: {
                $gte: [
                  {
                    $add: [
                      "$latestSubscriptionDate",
                      {
                        $multiply: [
                          "$maxPlanDuration",
                          30 * 24 * 60 * 60 * 1000,
                        ],
                      }, // Convert months to milliseconds
                    ],
                  },
                  new Date(),
                ],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Count the distinct students
        },
      },
      {
        $project: {
          _id: 0,
          totalActiveUsers: "$count",
        },
      },
    ]);

    const totalactiveUsers =
      uniqueStudents.length > 0 ? uniqueStudents[0].totalActiveUsers : 0;
    console.log({ uniqueStudents });
    return totalactiveUsers;
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description Total revenue by course field
 */

export const totalRevenueByCourse = async (req, res) => {
  try {
    const { courseFieldId, startDate } = req.body;
    const endDate = new Date();
    const data = await subscription.aggregate([
      {
        $match: {
          courseFieldId: new ObjectId(courseFieldId),
          isPaid: true,
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "paymenthistories",
          localField: "paymentId",
          foreignField: "_id",
          as: "paymentDetails",
        },
      },
      {
        $unwind: "$paymentDetails",
      },
      {
        $match: {
          "paymentDetails.createdAt": {
            $gte: new Date(startDate),
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paymentDetails.totalAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
        },
      },
    ]);

    const result = data.length > 0 ? data[0].totalRevenue : 0;

    return successResponseObject({
      req,
      res,
      data: { totalRevenue: result },
      code: 200,
    });
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description total inactive users
 */

export const totalExpiredCount = async (req, res) => {
  try {
    const expiredUsers = await subscription.aggregate([
      {
        $match: {
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "plandurations", // Use the actual collection name if different
          localField: "planDuration",
          foreignField: "_id",
          as: "planInfo",
        },
      },
      {
        $unwind: "$planInfo",
      },
      {
        $group: {
          _id: "$studentId", // Group by studentId
          isPaid: { $max: "$isPaid" }, // Get the maximum isPaid value for each student
          maxPlanDuration: { $max: "$planInfo.duration" }, // Use the plan duration from planduration model
          latestSubscriptionDate: { $max: "$createdAt" },
        },
      },
      {
        $match: {
          $and: [
            { isPaid: true },
            {
              $expr: {
                $lt: [
                  {
                    $add: [
                      "$latestSubscriptionDate",
                      {
                        $multiply: [
                          "$maxPlanDuration",
                          30 * 24 * 60 * 60 * 1000, // Convert months to milliseconds
                        ],
                      },
                    ],
                  },
                  new Date(),
                ],
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Count the distinct students
        },
      },
      {
        $project: {
          _id: 0,
          totalexpiredUsers: "$count",
        },
      },
    ]);

    const totalexpiredUsersCount =
      expiredUsers.length > 0 ? expiredUsers[0].totalexpiredUsers : 0;

    return totalexpiredUsersCount;
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const unsubscribedUsers = async (req, res) => {
  try {
    const unSubscribed = await subscription.aggregate([
      {
        $match: {
          isActive: true,
          isDelete: false,
        },
      },
      {
        $group: {
          _id: "$studentId", // Group by studentId
          isPaid: { $max: "$isPaid" }, // Get the maximum isPaid value for each student
        },
      },
      {
        $match: {
          isPaid: false, // Filter out students with at least one subscription that is paid
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Count the distinct students
        },
      },
      {
        $project: {
          _id: 0,
          totalUnsubscribed: "$count",
        },
      },
    ]);
    console.log({ unSubscribed });
    const totalUnsubscribedCount =
      unSubscribed.length > 0 ? unSubscribed[0].totalUnsubscribed : 0;

    return totalUnsubscribedCount;
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const totalInactiveUsers = async (req, res) => {
  try {
    const unsubscribe = await unsubscribedUsers();
    const expire = await totalExpiredCount();

    const totalInactiveUsers = unsubscribe + expire;

    return totalInactiveUsers;
  } catch (error) {
    console.log(error);
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};
/**
 * @description total purchased courses
 */
export const totalpurchasedCourses = async (req, res) => {
  try {
    const purchasedCourses = await subscription.countDocuments({
      isPaid: true,
      paymentId: { $exists: true },
      isActive: true,
      isDelete: false,
    });
    return purchasedCourses;
  } catch (error) {
    console.log(error);
    errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const getAllStudentFcmtokenByCoursefieldId = async (data) => {
  try {
    const studentdata = await subscription
      .find({
        courseFieldId: data.courseField,
        isActive: true,
        isPaid: true,
      })
      .populate({ path: "studentId", select: ["fcmToken"] });
    return studentdata;
  } catch (error) {
    console.log({ error });
  }
};
