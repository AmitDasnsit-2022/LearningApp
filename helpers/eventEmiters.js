import events from "events";
import subscription from "../modules/subscription.js";
import mongoose from "mongoose";
import notifications from "../modules/notifications.js";
const ObjectId = mongoose.Types.ObjectId;
const eventEmitter = new events.EventEmitter();

/**
 * @description Create notification.
 * @param courseFieldId, courseId, notificationType, title, description, studentId,
 */
eventEmitter.on(
  "createNotification",
  async ({
    courseFieldId,
    courseId,
    notificationType,
    title,
    description,
    studentId,
  }) => {
    let match = {
      $match: {
        isPaid: true, // Filter documents where isPaid is true
        isActive: true,
        isDelete: false,
      },
    };
    let pipeline = [
      match,
      {
        $group: {
          _id: "$studentId", // Group by studentId
          fcmToken: { $first: "$fcmToken" }, // Collect fcmTokens into an array per studentId
        },
      },
    ];
    if (courseFieldId) {
      pipeline[0]["$match"] = {
        ...match.$match,
        courseFieldId: new ObjectId(courseFieldId),
      };
    }
    if (courseId) {
      pipeline[0]["$match"] = {
        ...match.$match,
        courseId: new ObjectId(courseId),
      };
    }
    const finddata = await subscription.aggregate(pipeline);
    if (!finddata.length) {
      await notifications.create({
        userId: studentId,
        notificationType: notificationType,
        title: title,
        description: description,
      });
    } else {
      await notifications.insertMany(
        finddata.map((data) => {
          return {
            userId: data._id,
            notificationType: notificationType,
            title: title,
            description: description,
          };
        })
      );
    }
  }
);

export default eventEmitter;
