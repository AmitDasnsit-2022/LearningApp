import paymentHistoryModel from "../../modules/paymentHistory.js";
import { errorResponse, successResponse } from "../../helpers/index.js";

/**
 * For Admin
 */
// Get all payment history
export const getpaymentHistory = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const paymentHistoryData = await paymentHistoryModel
      .find({ isActive: true, isDelete: false })
      .populate("studentId")
      .populate("courseFieldId")
      .populate("planDuration")
      .skip(skip)
      .limit(limit);
    const countQuery = await paymentHistoryModel.countDocuments({
      isDelete: false,
      isActive: true,
    });
    if (!paymentHistoryData.length) {
      return errorResponse(req, res, "Payments not found", 404);
    }
    return successResponse(
      req,
      res,
      paymentHistoryData,
      200,
      "",
      "",
      countQuery
    );
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * For students
 */
// Get student payments
export const getstudentPayment = async (req, res) => {
  try {
    const userId = req.user.userId || req.body.userId;
    const paymentHistoryData = await paymentHistoryModel
      .find({ studentId: userId, isActive: true, isDelete: false })
      .populate("studentId")
      .populate("courseFieldId")
      .populate("planDuration")
      .select("-paymentSignature");
    if (!paymentHistoryData.length) {
      return errorResponse(req, res, "Payments not found", 404);
    }
    return successResponse(req, res, paymentHistoryData, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
