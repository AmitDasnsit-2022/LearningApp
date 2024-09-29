import {
  errorResponse,
  errorResponseObject,
  successResponse,
  successResponseObject,
  uploadFiles,
} from "../../helpers/index.js";
import language from "../../modules/language.js";
import students from "../../modules/students.js";
import courseFields from "../../modules/courseFields.js";
import mongoose from "mongoose";
import subscription from "../../modules/subscription.js";
import Attempts from "../../modules/attempt.js";
import AttemptExamLists from "../../modules/attemptExamList.js";
import AttemptTests from "../../modules/attemptTest.js";
import Bookmarks from "../../modules/bookmark.js";
import Chats from "../../modules/chats.js";
import Doubts from "../../modules/doubt.js";
import Notifications from "../../modules/notifications.js";
import Orders from "../../modules/order.js";
import PaymentHistories from "../../modules/paymentHistory.js";
import StudentsModules from "../../modules/students.js";
import Subscriptions from "../../modules/subscription.js";
import VideoLogs from "../../modules/videoLogs.js";
const ObjectId = mongoose.Types.ObjectId;

/**
 * Get all active students from the database with pagination.
 *
 * @param {*} req The request object containing optional 'skip' and 'limit' parameters for pagination.
 * @param {*} res The response object for sending JSON data.
 * @returns {data} Array of active student records.
 */
export const allStudentsController = async (req, res) => {
  try {
    let skip = req.body.skip ?? 1;
    let limit = req.body.skip ?? 10;
    const data = await students
      .find({ isActive: true, isDelete: false })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    if (!data.length) {
      return errorResponse(req, res, "Data not found", 400);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

/**
 * Update user profile with image.
 *
 * @param {*} req The request object containing the 'userId' and other profile information to be updated.
 * @param {*} res The response object for sending JSON data.
 */
export const updateProfile = async (req, res) => {
  try {
    let userId = req.user.userId || req.body.userId;
    let filepath;
    let {
      email,
      address,
      gender,
      bio,
      courseRelated,
      studyReminder,
      promotions,
      fullname,
      fcmToken,
      state,
      pincode,
    } = req.body;

    const student = await students.findOne({ _id: userId });
    if (student) {
      if (req.files && req.files.profile_img) {
        let profile = req.files.profile_img;
        if (student.profile_img == "") {
          filepath = await uploadFiles(profile, "usersProfile");
        } else {
          filepath = await uploadFiles(
            profile,
            "usersProfile",
            student.profile_img
          );
        }
      }
      const data = await students.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            bio,
            profile_img: filepath,
            gender,
            fullname,
            email,
            address,
            fcmToken,
            courseRelated,
            studyReminder,
            promotions,
            state,
            pincode,
          },
        },
        { new: true }
      );

      // Use aggregation to retrieve the enrolled courses and academic data
      const additionalData = await students.aggregate([
        {
          $match: {
            _id: new ObjectId(userId),
            isActive: true,
            isDelete: false,
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            let: { studentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$studentId", "$$studentId"],
                  },
                },
              },
              {
                $lookup: {
                  from: "languages",
                  localField: "languageId",
                  foreignField: "_id",
                  as: "languageId",
                },
              },
              {
                $addFields: {
                  languageId: {
                    $arrayElemAt: ["$languageId", 0],
                  },
                },
              },
            ],
            as: "enrolledCourses",
          },
        },
        {
          $lookup: {
            from: "academics",
            localField: "academicId",
            foreignField: "_id",
            as: "academicId",
          },
        },
      ]);

      const combinedData = {
        ...data.toObject(),
        enrolledCourses: additionalData[0].enrolledCourses,
        academicId: additionalData[0].academicId,
      };
      return successResponse(
        req,
        res,
        [combinedData],
        200,
        "Profile Updated..."
      );
    } else {
      return errorResponse(req, res, "Data not updated", 400);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

/**
 * Get a student by their ID.
 *
 * @param {*} req The request object containing the 'userId'.
 * @param {*} res The response object for sending JSON data.
 */
export const getStudentsById = async (req, res) => {
  try {
    const userId = req.user.userId || req.body.userId;
    const data = await students.aggregate([
      {
        $match: { _id: new ObjectId(userId), isActive: true, isDelete: false },
      },
      {
        $lookup: {
          from: "subscriptions",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$studentId", "$$studentId"],
                },
              },
            },
            {
              $lookup: {
                from: "languages",
                localField: "languageId",
                foreignField: "_id",
                as: "languageId",
              },
            },
            {
              $addFields: {
                languageId: {
                  $arrayElemAt: ["$languageId", 0],
                },
              },
            },
          ],
          as: "enrolledCourses",
        },
      },
      {
        $lookup: {
          from: "academics",
          localField: "academicId",
          foreignField: "_id",
          as: "academicId",
        },
      },
    ]);
    // .populate({ path: "enrolledCourses.languageId", select: "name -_id" });
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

/**
 * Enroll a student in a course with the provided course and field IDs.
 *
 * @param {*} req The request object containing the 'courseId', 'courseFieldId', 'languageId', and 'academicId'.
 * @param {*} res The response object for sending JSON data.
 */
export const addEnrolledCourses = async (req, res) => {
  try {
    let { courseId, courseFieldId, languageId, academicId } = req.body;
    const languageData = await language.findOne({
      isActive: true,
      isDelete: false,
    });
    const studentId = req.user.userId;
    await students.findOneAndUpdate(
      { _id: studentId },
      { academicId: academicId }
    );
    let data = await subscription.findOneAndUpdate(
      {
        $and: [
          { studentId: studentId },
          { courseId: courseId },
          { courseFieldId: courseFieldId },
        ],
      },
      {
        $set: {
          isActive: true,
          isDelete: false,
        },
      },
      { new: true }
    );
    if (!data) {
      // Enroll the student in the new courseField
      data = new subscription({
        courseId,
        courseFieldId,
        studentId: studentId,
        isSelected: true,
        languageId: languageId ?? languageData._id,
      });
      await data.save();
    }
    return successResponse(req, res, data, 200, "Data added successfully...");
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

/**
 * Select a course field for a student.
 *
 * @param {*} req The request object containing the 'userId' and 'courseFieldId'.
 * @param {*} res The response object for sending JSON data.
 */
export const selectCourseField = async (req, res) => {
  try {
    const studentId = req.body.userId || req.user.userId;
    const { courseFieldId } = req.body;
    await students.updateOne(
      { _id: studentId, "enrolledCourses.isSelected": true },
      { $set: { "enrolledCourses.$.isSelected": false } }
    );
    const data = await students.findOneAndUpdate(
      { _id: studentId, "enrolledCourses.courseFieldId": courseFieldId },
      {
        $set: {
          "enrolledCourses.$.isSelected": true,
        },
      },
      { new: true }
    );
    if (data) {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error, 500);
  }
};

/**
 * Get the enrolled courses of a student with additional course and language details.
 *
 * @param {*} req The request object containing the 'userId', 'courseFieldId', and 'courseId'.
 * @param {*} res The response object for sending JSON data.
 */
export const getStudentEnrolledCourse = async (req, res) => {
  try {
    const studentId = req.user.userId || req.body.userId;
    const { courseFieldId, courseId } = req.body;
    const languageData = await language.findOne({
      isActive: true,
      isDelete: false,
    });

    // Deactivate the previously selected courseField if any
    if (courseFieldId !== undefined) {
      const existCourseField = await subscription.findOne({
        studentId: studentId,
        courseFieldId: courseFieldId,
      });
      if (!existCourseField) {
        const data = await courseFields.findOne({ _id: courseFieldId });
        await subscription.create({
          courseId: data.courseId,
          courseFieldId,
          studentId: studentId,
          isSelected: true,
          languageId: languageData._id,
        });
      }
      await subscription.updateMany(
        { studentId: studentId, isSelected: true },
        { $set: { isSelected: false } },
        { new: true }
      );

      await subscription.findOneAndUpdate(
        { studentId: studentId, courseFieldId: courseFieldId },
        {
          $set: {
            isSelected: true,
          },
        },
        { new: true }
      );
    }

    // Aggregate query to get detailed enrolled course data
    const student = await students.aggregate([
      {
        $match: { _id: new ObjectId(studentId) },
      },
      {
        $lookup: {
          from: "subscriptions",
          // localField: "_id",
          // foreignField: "studentId",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$studentId", "$$studentId"],
                },
                isActive: true,
                isDelete: false,
              },
            },
          ],
          as: "subscriptions",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "subscriptions.courseId",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "subscriptions.courseFieldId",
          let: {
            courseFieldId: "$subscriptions.courseFieldId",
            courseId: "$courses._id",
          },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$courseFieldId"],
                      $eq: ["$courseId", "$$courseId"],
                    },
                  },
                ],
                isActive: true,
              },
            },
            {
              $lookup: {
                from: "subscriptions",
                let: { courseFieldId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$$courseFieldId", "$courseFieldId"],
                      },
                      studentId: new ObjectId(studentId),
                      // Add any other subscription filters if needed
                    },
                  },
                ],
                as: "courseSubscriptions",
              },
            },
            {
              $addFields: {
                isSelected: {
                  $arrayElemAt: ["$courseSubscriptions.isSelected", 0],
                },
                isPaid: { $arrayElemAt: ["$courseSubscriptions.isPaid", 0] },
              },
            },
            {
              $lookup: {
                from: "subjects",
                let: { courseFieldId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$courseFieldId", "$$courseFieldId"] },
                      isActive: true,
                      isDelete: false,
                    },
                  },
                  {
                    $lookup: {
                      from: "filesmodals",
                      localField: "iconName",
                      foreignField: "_id",
                      as: "iconName",
                    },
                  },
                  {
                    $addFields: {
                      iconName: { $arrayElemAt: ["$iconName", 0] },
                    },
                  },
                  {
                    $lookup: {
                      from: "enrolledteachers",
                      let: {
                        subjectId: "$_id",
                        enrolledCourseFieldId: "$courseFieldId",
                      },

                      pipeline: [
                        {
                          $match: {
                            $and: [
                              {
                                $expr: {
                                  $and: [
                                    {
                                      $eq: ["$subjectId", "$$subjectId"],
                                    },
                                    {
                                      $eq: [
                                        "$courseField",
                                        "$$enrolledCourseFieldId",
                                      ],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        },
                      ], 
                      as: "enrolledteachers",
                    },
                  },
                  {
                    $addFields: {
                      enrolledteachers: {
                        $arrayElemAt: ["$enrolledteachers", 0],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "teachers",
                      let: { teacherId: "$enrolledteachers.teacherId" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$_id", "$$teacherId"],
                            },
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            fullname: 1,
                            gender: 1,
                            dob: 1,
                            mobile: 1,
                            joiningDate: 1,
                            qualification: 1,
                            experience: 1,
                            isActive: 1,
                            isDelete: 1,
                            designation: 1,
                            image: 1,
                            teacherBgImage: 1,
                          },
                        },
                      ],
                      as: "teacher",
                    },
                  },
                  {
                    $unwind: "$teacher",
                  },
                  {
                    $lookup: {
                      from: "videos",
                      let: { teacherId: "$teacher._id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ["$teacherId", "$$teacherId"] },
                            isActive: true,
                          },
                        },
                        {
                          $limit: 1,
                        },
                        {
                          $project: {
                            title: 1,
                          },
                        },
                      ],
                      as: "videos",
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      subjectName: 1,
                      courseFieldId: 1,
                      iconName: 1,
                      isDelete: 1,
                      isActive: 1,
                      teacher: 1,
                      playlist: { $arrayElemAt: ["$videos.title", 0] },
                    },
                  },
                ],
                as: "subject",
              },
            },
            {
              $lookup: {
                from: "languages",
                localField: "language",
                foreignField: "_id",
                as: "language",
              },
            },
            {
              $unwind: {
                path: "$language",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "filesmodals",
                let: { iconName: "$language.iconName" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$iconName"],
                      },
                    },
                  },
                  {
                    $project: {
                      fileUrl: 1,
                    },
                  },
                ],
                as: "language.iconName",
              },
            },
            {
              $unwind: {
                path: "$language.iconName",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "filesmodals",
                let: { iconName: "$iconName" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$iconName"],
                      },
                    },
                  },
                  {
                    $project: {
                      fileUrl: 1,
                    },
                  },
                ],
                as: "iconName",
              },
            },
            {
              $unwind: {
                path: "$iconName",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          foreignField: "_id",
          as: "courses.courseFields",
        },
      },
      {
        $lookup: {
          from: "filesmodals",
          let: { iconName: "$courses.iconName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$iconName"],
                },
              },
            },
            {
              $project: {
                fileUrl: 1,
              },
            },
          ],
          as: "courses.iconName",
        },
      },
      {
        $unwind: {
          path: "$courses.iconName",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "academics",
          localField: "academicId",
          foreignField: "_id",
          as: "academic",
        },
      },
      {
        $unwind: {
          path: "$academic",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "filesmodals",
          let: { iconName: "$academic.iconName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$iconName"],
                },
              },
            },
            {
              $project: {
                fileUrl: 1,
              },
            },
          ],
          as: "academic.iconName",
        },
      },
      {
        $unwind: {
          path: "$academic.iconName",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          mobile: { $first: "$mobile" },
          email: { $first: "$email" },
          bio: { $first: "$bio" },
          profile_img: { $first: "$profile_img" },
          fullname: { $first: "$fullname" },
          isActive: { $first: "$isActive" },
          isDelete: { $first: "$isDelete" },
          courses: { $push: "$courses" },
          academicId: { $first: "$academic" },
        },
      },
      {
        $project: {
          courses: {
            courseFields: {
              courseSubscriptions: 0,
            },
          },
        },
      },
    ]);

    if (!student.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, student, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Delete an enrolled course for a student with the given course and field IDs.
 *
 * @param {*} req The request object containing the 'courseId' and 'courseFieldId'.
 * @param {*} res The response object for sending JSON data.
 */
export const deleteEnrolledCourse = async (req, res) => {
  try {
    const { courseId, courseFieldId } = req.body;
    const { userId } = req.user;
    const data = await subscription.findOneAndUpdate(
      {
        $and: [
          { courseId: courseId },
          { courseFieldId: courseFieldId },
          { isPaid: false },
          { studentId: userId },
        ],
      },
      {
        $set: {
          isDelete: true,
          isActive: false,
        },
      },
      { new: true }
    );
    if (!data) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, [], 200, "Data deleted...");
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

export const enrolledCourseField = async (req, res) => {
  try {
    const studentId = req.user.userId || req.body.userId;
    const { courseFieldId, courseId } = req.body;

    // Deactivate the previously selected courseField if any
    if (courseFieldId !== undefined) {
      const existCourseField = await subscription.findOne({
        studentId: studentId,
        courseFieldId: courseFieldId,
      });
      if (!existCourseField) {
        return errorResponse(req, res, "It's Not valid details", 404);
      }
      await subscription.updateMany(
        { studentId: studentId, isSelected: true },
        { $set: { isSelected: false } },
        { new: true }
      );

      await subscription.findOneAndUpdate(
        { studentId: studentId, courseFieldId: courseFieldId },
        { $set: { isSelected: true } },
        { new: true }
      );
    }

    const data = await students.aggregate([
      {
        $match: { _id: new ObjectId(studentId) },
      },
      {
        $lookup: {
          from: "subscriptions",
          // localField: "_id",
          // foreignField: "studentId",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$studentId", "$$studentId"],
                },
                isActive: true,
                isDelete: false,
              },
            },
          ],
          as: "subscriptions",
        },
      },
      {
        $unwind: "$subscriptions",
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "subscriptions.courseFieldId",
          foreignField: "_id",
          as: "courseFieldId",
        },
      },
      {
        $unwind: "$courseFieldId",
      },
      {
        $addFields: {
          courseFieldId: {
            isSelected: "$subscriptions.isSelected",
            isPaid: "$subscriptions.isPaid",
          },
        },
      },
      {
        $lookup: {
          from: "filesmodals",
          let: { iconName: "$courseFieldId.iconName" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$iconName"],
                },
              },
            },
            {
              $project: {
                fileUrl: 1,
              },
            },
          ],
          as: "courseFieldId.iconName",
        },
      },
      {
        $unwind: {
          path: "$courseFieldId.iconName",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "academics",
          localField: "academicId",
          foreignField: "_id",
          as: "academicId",
        },
      },
      { $unwind: "$academicId" },
      {
        $group: {
          _id: "$_id",
          mobile: { $first: "$mobile" },
          email: { $first: "$email" },
          address: { $first: "$address" },
          bio: { $first: "$bio" },
          courseRelated: { $first: "$courseRelated" },
          studyReminder: { $first: "$studyReminder" },
          promotions: { $first: "$promotions" },
          profile_img: { $first: "$profile_img" },
          fullname: { $first: "$fullname" },
          gender: { $first: "$gender" },
          courses: { $push: "$courseFieldId" },
          academicId: { $first: "$academicId" },
        },
      },
      {
        $project: {
          // subscriptions: 0,
          enrolledCourses: 0,
        },
      },
    ]);

    if (!data.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, data, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * Get the enrolled courses of a student with additional course and language details.
 *
 * @param {*} req The request object containing the 'userId', 'courseFieldId', and 'courseId'.
 * @param {*} res The response object for sending JSON data.
 */
export const getEnrolledCourseforWebiste = async (req, res) => {
  try {
    const studentId = req.user.userId || req.body.userId;
    const { courseFieldId, courseId } = req.body;

    // Deactivate the previously selected courseField if any
    if (courseFieldId !== undefined) {
      const existCourseField = await subscription.findOne({
        studentId: studentId,
        courseFieldId: courseFieldId,
      });
      if (!existCourseField) {
        return errorResponse(req, res, "It's Not valid details", 404);
      }
      await subscription.findOneAndUpdate(
        { studentId: studentId, isSelected: true },
        { $set: { isSelected: false } },
        { new: true }
      );

      await subscription.findOneAndUpdate(
        { studentId: studentId, courseFieldId: courseFieldId },
        { $set: { isSelected: true } },
        { new: true }
      );
    }

    // Aggregate query to get detailed enrolled course data
    const student = await students.aggregate([
      {
        $match: { _id: new ObjectId(studentId) },
      },
      {
        $lookup: {
          from: "subscriptions",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$studentId", "$$studentId"],
                },
                isActive: true,
                isDelete: false,
              },
            },
            {
              $lookup: {
                from: "coursefields",
                let: { courseFieldId: "$courseFieldId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$_id", "$$courseFieldId"],
                      },
                      isActive: true,
                      isDelete: false,
                    },
                  },
                  {
                    $lookup: {
                      from: "courses",
                      let: { courseId: "$courseId" },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $eq: ["$_id", "$$courseId"],
                            },
                          },
                        },
                      ],
                      as: "courses",
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      courseId: 1,
                      iconName: 1,
                      language: 1,
                      isActive: 1,
                      isDelete: 1,
                      createdAt: 1,
                      updatedAt: 1,
                      courseId: { $arrayElemAt: ["$courses", 0] },
                    },
                  },
                ],
                as: "courseFieldId",
              },
            },
            {
              $project: {
                courseFieldId: { $arrayElemAt: ["$courseFieldId", 0] },
                isSelected: 1, // Include isSelected field
                isPaid: 1, // Include isPaid field
              },
            },
          ],
          as: "enrolledCourses",
        },
      },
      {
        $project: {
          _id: 1,
          mobile: 1,
          email: 1,
          bio: 1,
          profile_img: 1,
          fullname: 1,
          isActive: 1,
          isDelete: 1,
          "enrolledCourses.courseFieldId": 1,
          "enrolledCourses.isSelected": 1, // Include isSelected field
          "enrolledCourses.isPaid": 1, // Include isPaid field
        },
      },
    ]);

    if (!student.length) {
      return errorResponse(req, res, "Data not found", 404);
    } else {
      return successResponse(req, res, student, 200);
    }
  } catch (error) {
    console.log({ error });
    return errorResponse(req, res, error.message, 500);
  }
};

/**
 * @description get all students details
 */
export const getallStudents = async (req, res) => {
  try {
    const limit = req.body.limit || 200;
    const skip = req.body.skip || 0;
    const data = await students
      .aggregate([
        {
          $match: { isActive: true, isDelete: false },
        },
        {
          $lookup: {
            from: "subscriptions",
            let: { studentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$studentId", "$$studentId"],
                  },
                },
              },
              {
                $lookup: {
                  from: "coursefields",
                  localField: "courseFieldId",
                  foreignField: "_id",
                  as: "courseFieldId",
                },
              },
              {
                $addFields: {
                  courseFieldId: {
                    $arrayElemAt: ["$courseFieldId", 0],
                  },
                },
              },
            ],
            as: "enrolledCourses",
          },
        },
        {
          $project: {
            fcmToken: 0,
          },
        },
      ])
      .skip(skip)
      .limit(limit);
    const totalCount = await students.countDocuments({
      isActive: true,
      isDelete: false,
    });
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "data not found",
        code: 404,
      });
    } else {
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
        count: totalCount,
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description total number of students
 */
export const totalStudents = async (req, res) => {
  try {
    const totalStudents = await students.countDocuments({
      isActive: true,
      isDelete: false,
    });
    return totalStudents;
  } catch (error) {
    console.log({ error });
    return error;
  }
};

/**
 * @description total number of new students
 */
export const totalNewStudents = async (req, res) => {
  try {
    const currentDate = new Date();
    const threeMonthsAgo = new Date(currentDate);
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    const totalNewStudents = await students.countDocuments({
      isDelete: false,
      createdAt: { $lte: currentDate, $gte: threeMonthsAgo },
    });
    return totalNewStudents;
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

/**
 * @description get all students details
 */
export const getStudentInfo = async (req, res) => {
  try {
    const { studentId } = req.body;
    const data = await students.aggregate([
      {
        $match: {
          _id: new ObjectId(studentId),
          isActive: true,
          isDelete: false,
        },
      },
      {
        $lookup: {
          from: "attemptexamlists",
          localField: "_id",
          foreignField: "studentId",
          as: "attemptexamlists",
        },
      },
      {
        $lookup: {
          from: "videologs",
          localField: "_id",
          foreignField: "studentId",
          as: "videologs",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          let: { studentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$studentId", "$$studentId"],
                },
                isActive: true,
                isDelete: false,
                isPaid: true,
              },
            },
          ],
          as: "subscriptions",
        },
      },
      {
        $lookup: {
          from: "coursefields",
          localField: "subscriptions.courseFieldId",
          foreignField: "_id",
          as: "courseFieldId",
        },
      },
      {
        $addFields: {
          totalattemptExams: { $size: "$attemptexamlists" },
          totalwatchTime: { $sum: "$videologs.watchedTime" },
        },
      },
      {
        $project: {
          fcmToken: 0,
          attemptexamlists: 0,
          videologs: 0,
          subscriptions: 0,
        },
      },
    ]);
    if (!data) {
      return errorResponseObject({
        req,
        res,
        error: "data not found",
        code: 404,
      });
    } else {
      return successResponseObject({
        req,
        res,
        data,
        code: 200,
      });
    }
  } catch (error) {
    console.log({ error });
    return errorResponseObject({ req, res, error: error.message, code: 500 });
  }
};

export const getInactiveStudents = async (req, res, next) => {
  try {
    const data = await students.count({ isActive: false, isDelete: true });
    return data;
  } catch (error) {
    console.log({ error });
  }
};

export const deleteAccount = async (req, res) => {
  const collections = [
    Attempts,
    AttemptExamLists,
    AttemptTests,
    Bookmarks,
    Chats,
    Doubts,
    Notifications,
    Orders,
    PaymentHistories,
    StudentsModules,
    Subscriptions,
    VideoLogs,
  ];

  let { mobile } = req.body;
  // mobile = `+91${mobile}`;
  const studentData = await students.findOne({ mobile });
  const query = {
    $or: [
      { studentId: studentData._id },
      { userId: studentData._id },
      { _id: studentData._id },
    ],
  };
  // collections.forEach(async (collectionName) => {
  //   await collectionName.deleteMany(query);
  // });
  if (studentData) {
    return successResponse(req, res, [], 200, "deleted");
  }
};
