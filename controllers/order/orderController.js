import orderModel from "../../modules/order.js";
import planduration from "../../modules/planduration.js";
import planModal from "../../modules/plans.js";
import {
  errorResponse,
  orderGenerate,
  successResponse,
} from "../../helpers/index.js";
import subscriptionModal from "../../modules/subscription.js";

// Create Order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planDurationId, planId, courseFieldId } = req.body;
    const plandurationdata = await planduration.findOne({
      _id: planDurationId,
    });
    if (!plandurationdata) {
      return errorResponse(req, res, "Plan duration data not found", 404);
    }
    const plandata = await planModal.findOne({ _id: planId });
    if (!plandata) {
      return errorResponse(req, res, "Plan data not found", 404);
    }
    if (!plandurationdata || !plandata) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      let multiply = plandurationdata.duration * plandata.amount;
      let totalAmount = multiply + (multiply / 100) * 18;
      const existingSubscription = await subscriptionModal.findOne({
        courseFieldId: courseFieldId,
        studentId: userId,
        isPaid: true,
      });
      if (!existingSubscription) {
        const data = await orderGenerate(totalAmount);
        const existOrder = await orderModel.findOneAndUpdate(
          {
            planDurationId: planDurationId,
            planId: planId,
            courseFieldId: courseFieldId,
            studentId: userId,
          },
          {
            $set: {
              amount: data.amount,
              amount_due: data.amount_due,
              amount_paid: data.amount_paid,
              entity: data.entity,
              currency: data.currency,
              offer_id: data.offer_id,
              status: data.status,
              attempts: data.attempts,
              receipt: data.receipt,
              created_at: data.created_at,
              orderId: data.id,
            },
          },
          { new: true }
        );
        if (!existOrder) {
          const orderdata = new orderModel({
            studentId: userId,
            amount: data.amount,
            amount_due: data.amount_due,
            amount_paid: data.amount_paid,
            entity: data.entity,
            currency: data.currency,
            offer_id: data.offer_id,
            status: data.status,
            attempts: data.attempts,
            receipt: data.receipt,
            created_at: data.created_at,
            orderId: data.id,
            planDurationId: planDurationId,
            planId: planId,
            courseFieldId: courseFieldId,
          });
          const saveOrder = await orderdata.save();
          return successResponse(req, res, saveOrder, 200);
        } else {
          return successResponse(req, res, existOrder, 200);
        }
      } else {
        return errorResponse(req, res, "Already Exist", 403);
      }
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Get all order
export const getOrders = async (req, res) => {
  try {
    const studentId = req.user.userId || req.body.userId;
    const allOrders = await orderModel.find({
      studentId: studentId,
      isActive: true,
      isDelete: false,
    });

    if (!allOrders.length) {
      return errorResponse(req, res, "No orders found", 404);
    }
    return successResponse(req, res, allOrders, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
// Get order by Order Id
export const getorderById = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await orderModel
      .findOne({ _id: orderId, isActive: true, isDelete: false })
      .populate({ path: "planDurationId" })
      .populate({ path: "planId" })
      .populate({ path: "courseFieldId" })
      .populate({ path: "subjectId" });
    if (!order) {
      return errorResponse(req, res, "Order not found", 404);
    }
    return successResponse(req, res, order, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Admin
 */

// Get all orders
export const getOrdersAdmin = async (req, res) => {
  try {
    let skip = req.body.skip || 0;
    let limit = req.body.limit || 200;
    const allOrders = await orderModel
      .find({ isDelete: false })
      .skip(skip)
      .limit(limit);
    const countQuery = await orderModel.countDocuments({ isDelete: false });

    if (!allOrders.length) {
      return errorResponse(req, res, "No orders found", 404);
    }
    return successResponse(req, res, allOrders, 200, "", "", countQuery);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

// Get order by Order Id
export const orderByIdAdmin = async (req, res) => {
  const { orderId } = req.body;
  try {
    const order = await orderModel
      .findOne({ _id: orderId, isDelete: false })
      .populate({ path: "planDurationId" })
      .populate({ path: "planId" })
      .populate({ path: "courseFieldId" })
      .populate({ path: "subjectId" });
    if (!order) {
      return errorResponse(req, res, "Order not found", 404);
    }
    return successResponse(req, res, order, 200);
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};
