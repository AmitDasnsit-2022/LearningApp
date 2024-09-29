import { body, param, query, validationResult } from "express-validator";

export const validateLogin = [
  body("mobile").isMobilePhone().notEmpty().withMessage("Mobile is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const courseValidate = [
  body("name").notEmpty().withMessage("Name is required"),
  body("descriptions").notEmpty().withMessage("Description is required"),
  body("iconId").isMongoId().withMessage("Icons Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const courseFieldValidate = [
  body("name").notEmpty().withMessage("Name is required"),
  body("courseId").isMongoId().withMessage("Course id is required"),
  body("iconId").isMongoId().withMessage("Icon id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const rolesValidate = [
  body("roleName").notEmpty().withMessage("Role Name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const roleId = [
  body("roleId").isMongoId().withMessage("Role id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const permissionValidate = [
  body("permissionName").notEmpty().withMessage("Permission Name is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const permissionId = [
  body("permissionId").isMongoId().withMessage("Permission id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**@description teacherId, isActive */
export const teacherVerify = [
  body("teacherId").isMongoId().withMessage("Permission id is required"),
  body("isVerify").isBoolean().withMessage("Permission id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * firstName, lastName, gender, dob, email,mobile, qualification
experience designation subjects, teachExams.,address, state, zipCode, facebook
linkedin, instagram, youtube, tspp
 */
export const teacherValidate = [
  body("fullname").notEmpty().withMessage("Full Name is required"),
  body("gender").notEmpty().withMessage("Gender is required"),
  body("dob").notEmpty().withMessage("Date of Birth is required"),
  body("mobile").isMobilePhone().withMessage("Mobile is required"),
  body("qualification").notEmpty().withMessage("Qualification is required"),
  body("experience").notEmpty().withMessage("Experience is required"),
  body("email").notEmpty().withMessage("Email is required"),
  body("subjects").notEmpty().withMessage("Subjects is required"),
  body("teachExams").notEmpty().withMessage("Teach Exams is required"),
  body("address").notEmpty().withMessage("Address is required"),
  body("state").notEmpty().withMessage("State is required"),
  body("zipCode").notEmpty().withMessage("Zip Code is required"),
  body("designation").notEmpty().withMessage("Designation is required"),
  body("tspp")
    .notEmpty()
    .withMessage(" Term of service and Privacy Policy is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const academicValidate = [
  body("name").notEmpty().withMessage("Name is required"),
  body("iconId").isMongoId().withMessage("Icon Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const academicUPdateValidate = [
  body("academicId").isMongoId().withMessage("Academic Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const updateLanguageValidate = [
  body("languageId").isMongoId().withMessage("Language Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const subjectValidate = [
  body("subjectName").notEmpty().withMessage("Subject Name is required"),
  body("courseFieldId").isMongoId().withMessage("Course Field Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const updateSubjcet = [
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const mongodbId = [
  body("courseFieldId").isMongoId().withMessage("Course Field Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const courseId = [
  body("courseId").isMongoId().withMessage("Course Field Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const enrolledValidation = [
  body("courseId").isMongoId().withMessage("Course Id is required"),
  body("courseFieldId").isMongoId().withMessage("Course Field Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const allfileValidate = [
  body("category").notEmpty().withMessage("Category is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const fileValidate = [
  body("category").notEmpty().withMessage("Category is required"),
  body("fileId").isMongoId().withMessage("File Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const syllabusValid = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("subjectId").isMongoId().withMessage("subject id is required"),
  body("courseFieldId").isMongoId().withMessage("Course Field Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const syllabusUpdateValid = [
  body("syllabusId").isMongoId().withMessage("Syllabus Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const syllabusDeleteValid = [
  body("syllabusId").isMongoId().withMessage("Syllabus Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const newsValidate = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("courseFieldId").isMongoId().withMessage("courseFieldId is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * title,subjectId,teacherId,testlistId,studymaterialId,
 */
export const videosValidate = [
  body("title").notEmpty().withMessage("Title is required"),
  body("subjectId").isMongoId().withMessage("Subject is required"),
  body("videoIndex").notEmpty().withMessage("Video Index is required"),
  body("teacherId").notEmpty().withMessage("teacherId is required"),
  body("playlistId").isMongoId().withMessage("Playlist id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const videosSubjectIdValidate = [
  body("videoId").isMongoId().withMessage("Video Id is required"),
  // body("subjectId").isMongoId().withMessage("Subject Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const playlistId = [
  body("playlistId").isMongoId().withMessage("playlist Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 *  playlistName, description, teacherDetails, courseFieldId, languageId, subjectId, videosIds, playlistType
 */
export const playlistValidate = [
  body("playlistName").notEmpty().withMessage("Play List Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  body("courseFieldId").isMongoId().withMessage("Course Field Id is required"),
  body("languageId").isMongoId().withMessage("Language Id is required"),
  body("playlistType").notEmpty().withMessage("Play List Type is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 *playlistId
 */
export const playlistUpdateValidate = [
  body("playlistId").isMongoId().withMessage("Playlist Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Subject Id validation
 */
export const subjectId = [
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const videoId = [
  body("videoId").isMongoId().withMessage("Video Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
export const videoWatchedTime = [
  body("videoId").isMongoId().withMessage("Video Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**title, description, imageUrl, subjectId */
export const overviewValidate = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("secondaryTitle").notEmpty().withMessage("Secondary Title is required"),
  body("secondaryDescription")
    .notEmpty()
    .withMessage("Secondary Description is required"),
  body("imageUrl").notEmpty().withMessage("Image Url is required "),
  body("courseFieldId").isMongoId().withMessage("courseField Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**overviewId */
export const overviewIdValidate = [
  body("overviewId").isMongoId().withMessage("Overview Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * subjectId, teacherId, courseField
 */
export const enrollTeacher = [
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  body("teacherId").isMongoId().withMessage("Teacher Id is required"),
  body("courseField").isMongoId().withMessage("Course Field Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * subjectId, teacherId, courseField
 */
export const enrollId = [
  body("enrollId").isMongoId().withMessage("Enroll teacher Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description teacherId
 */
export const enrollTeacherId = [
  body("teacherId").isMongoId().withMessage("Teacher Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * marks, subjectId
 */
export const testQnaValidate = [
  body("marks").notEmpty().withMessage("Marks is required"),
  body("correctAnswer").notEmpty().withMessage("correct Answer is required"),
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * question, firstAnswer, secondAnswer, thirdAnswer, fourthAnswer, subjectId
 */
export const tesQnaInBulkValidate = [
  body()
    .isArray()
    .withMessage("Data must be an array of object with at least one element."),
  body("*.marks").notEmpty().withMessage("Marks is required"),
  body("*.a").notEmpty().withMessage("option a is required"),
  body("*.b").notEmpty().withMessage("option b is required"),
  body("*.c").notEmpty().withMessage("option c is required"),
  body("*.d").notEmpty().withMessage("option d is required"),
  body("*.subjectId").isMongoId().withMessage("Subject Id is required"),
  body("*.playlistId").isMongoId().withMessage("playlist Id is required"),
  body("*.correctAnswer").notEmpty().withMessage("Second Answer is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * question, firstAnswer, secondAnswer, thirdAnswer, fourthAnswer, subjectId
 */
export const testQnaId = [
  body("testQnaId").isMongoId().withMessage("Subject Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 * question, firstAnswer, secondAnswer, thirdAnswer, fourthAnswer, subjectId
 */
export const qnaids = [
  body("questionIds").notEmpty().withMessage("Qna Ids is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * title, duration, numberOfquestion, subjectId, languageId, testQnaIds
 */
export const tesListValidate = [
  body("title").notEmpty().withMessage("Question is required"),
  body("languageId").isMongoId().withMessage("First Answer is required"),
  body("testQnaIds").notEmpty().withMessage("Test Qna id is required"),
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  body("courseFieldId").isMongoId().withMessage("Coursefield Id is required"),
  body("testListType")
    .notEmpty()
    .withMessage("TestListType is required should be test or practice"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * title, duration, numberOfquestion, subjectId, languageId, testQnaIds
 */
export const testlistId = [
  body("testListId").isMongoId().withMessage("ExamList is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * studentId, questionId, subjectId, studentAnswer
 */
export const attemptTestValidate = [
  body("studentId").isMongoId().withMessage("studentId is required"),
  body("questionId").isMongoId().withMessage("questionId is required"),
  body("subjectId").isMongoId().withMessage("subjectId is required"),
  body("studentAnswer").notEmpty().withMessage("studentAnswer is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 * subjectId, testListId
 */
export const previousTestValidate = [
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  body("testListId").isMongoId().withMessage("Test List Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * subjectId, testListId
 */
export const testlistIdAndCourseFieldId = [
  body("courseFieldId").isMongoId().withMessage("CourseField Id is required"),
  body("testListId").isMongoId().withMessage("Test List Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * studentId, questionId, subjectId, studentAnswer
 */
export const attemptPracticeInBulkValidate = [
  body()
    .isArray({ min: 1 })
    .withMessage("Data must be an array of object with at least one element."),
  body("*.studentId").isMongoId().withMessage("Student Id is required"),
  body("*.questionId").isMongoId().withMessage("Answer Id is required"),
  body("*.testListId").isMongoId().withMessage("Test List Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * studentId, questionId, subjectId, studentAnswer
 */
export const attemptTestInBulkValidate = [
  body()
    .isArray({ min: 1 })
    .withMessage("Data must be an array of object with at least one element."),
  body("*.studentId").isMongoId().withMessage("Student Id is required"),
  body("*.questionId").isMongoId().withMessage("Answer Id is required"),
  // body("*.subjectId").isMongoId().withMessage("Subject Id is required"),
  body("*.testListId").isMongoId().withMessage("Test List Id is required"),
  body("*.courseFieldId").isMongoId().withMessage("CourseField Id is required"),
  body("*.timeDuration").notEmpty().withMessage("Time Duration is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * title, description, fileUrl, subjecId
 */
export const studyMaterialValidate = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("description is required"),
  body("subjectId").isMongoId().withMessage("Subject Id is required"),
  body("courseFieldId").isMongoId().withMessage("Course Field Id is required"),
  body("playlistId")
    .isMongoId()
    .withMessage("Playlist Id or Chapter Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * studyMaterialId
 */
export const studyMaterialIdValidate = [
  body("studyMaterialId")
    .isMongoId()
    .withMessage("Study material Id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Email, password
 */
export const adminRegisterValidate = [
  body("email").notEmpty().withMessage("Email is required"),
  body("password")
    .notEmpty()
    .isLength(6)
    .withMessage(
      "Password is required password should be minimum 6 characters"
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 * Email, password
 */
export const password = [
  body("password")
    .notEmpty()
    .isLength(6)
    .withMessage(
      "Password is required password should be minimum 6 characters"
    ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 * Email, password
 */
export const passwordValidation = [
  body("password")
    .notEmpty()
    .isLength(6)
    .withMessage(
      "Password is required password should be minimum 6 characters"
    ),
  body("oldPassword").notEmpty().withMessage("Old Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Email, password
 */
export const adminLoginValidate = [
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required."),
  body("macAddress").notEmpty().withMessage("Mac Address is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * courseFieldId,
      planTypes,
      description,
      amount,
      planFeatures,
      duration,
      courseId,
*/
export const planValidate = [
  body("courseFieldId").isMongoId().withMessage("Valid course filed id"),
  body("planTypes").notEmpty().withMessage("Plan Types is required."),
  body("description").notEmpty().withMessage("Description is required."),
  body("amount").isNumeric().withMessage("Amount is required."),
  body("planFeatures").isArray().withMessage("Description is required."),
  body("courseId").isMongoId().withMessage("Course id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 * planId
 */
export const planId = [
  body("planId").isMongoId().withMessage("Plan id is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
      duration,
*/
export const planDuration = [
  body("duration").isNumeric().withMessage("Duration is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**duration*/
export const calculateValidate = [
  body("planDurationId")
    .isMongoId()
    .withMessage("Plan Duration Id is required."),
  body("planId").isMongoId().withMessage("Plan Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
      courseFieldId,
      planDuration,
      planId,
      paymentStatus,
      paymentMethod,
      orderId,
      totalAmount,
*/
export const subscriptionValidate = [
  body("courseFieldId").isMongoId().withMessage("Course field Id is required."),
  body("planDuration").isMongoId().withMessage("Plan Duration Id is required."),
  body("planId").isMongoId().withMessage("Plan Id is required."),
  body("paymentStatus").notEmpty().withMessage("Payment Status is required."),
  body("paymentMethod").notEmpty().withMessage("Payment Method is required."),
  body("orderId").notEmpty().withMessage("Order Id is required."),
  body("totalAmount").notEmpty().withMessage("Total Amount is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
  email, password
*/
export const emailValid = [
  body("email").notEmpty().withMessage("Email is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
  email, password
*/
export const teacherLogin = [
  body("otp").notEmpty().withMessage("Otp is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
  email, roleId, permissionId, firstName, lastName
*/
export const adminValidate = [
  body("email").isEmail().withMessage("Email is required."),
  body("roleId").isMongoId().withMessage("Role Id is required."),
  body("firstName").notEmpty().withMessage("First Name is required."),
  body("lastName").notEmpty().withMessage("Last Name is required."),
  body("permissionId")
    .isArray()
    .withMessage("Permission Id  is required with array."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
  email, roleId, permissionId, firstName, lastName
*/
export const adminUpdateValidate = [
  body("userId").isMongoId().withMessage("User Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Steam validate create
 * title,
      teacher: teacherId,
      subject: subjectId,
      timeSchedule
 */
export const steamCreateValidate = [
  body("title").notEmpty().withMessage("Title is required."),
  body("teacherId").isMongoId().withMessage("Teacher Id is required."),
  body("subjectId").isMongoId().withMessage("Subject Id is required."),
  body("timeSchedule").notEmpty().withMessage("Date is required."),
  body("courseFieldId").notEmpty().withMessage("Course field is required."),
  body("playlistId").isMongoId().withMessage("Playlist Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Steam validate create
 * liveStreamPlay
 */
export const liveStreamPlay = [
  body("liveStreamId").isMongoId().withMessage("Live Stream Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/*
* Contact validator 
* title,
      teacher: teacherId,
      subject: subjectId,
      timeSchedule
 */
export const addContactValidate = [
  body("name").notEmpty().withMessage("Name is required."),
  body("email").isEmail().notEmpty().withMessage("Email is required."),
  body("number").notEmpty().withMessage("Mobile is required."),
  body("message").notEmpty().withMessage("Message is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Validator for add doubts
 */
export const addDoubtValidate = [
  body("subjectId").isMongoId().withMessage("Subject Id is required."),
  body("courseFieldId").isMongoId().withMessage("CourseField Id is required."),
  body("message").notEmpty().withMessage("Message is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
/**
 * @description Validator for doubt Id
 */
export const doubtId = [
  body("doubtId").isMongoId().withMessage("Doubt Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const solutionValidate = [
  body("doubtId").isMongoId().withMessage("Doubt Id is required."),
  body("solutionMsg").notEmpty().withMessage("Solution message is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

//Create course
export const orderValidate = [
  body("planDurationId")
    .isMongoId()
    .withMessage("Plan Duration Id is required."),
  body("planId").isMongoId().withMessage("Plan Id is required."),
  body("courseFieldId").isMongoId().withMessage("Course field Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**@description Bookmarks validations */

export const bookmarkIdValidate = [
  body("bookmarkId").isMongoId().withMessage("Bookmark Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Qnalist validation
 * videoId, duration, title, description
 */
export const qnalist = [
  body("videoId").isMongoId().withMessage("videoId Id is required."),
  body("duration").notEmpty().withMessage("Duration is required."),
  body("title").notEmpty().withMessage("Title is required."),
  body("description").notEmpty().withMessage("Description is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Qnalist validation
 * videoId, duration, title, description
 */
export const qnalistId = [
  body()
    .isArray({ min: 1 })
    .withMessage("Data must be an array of object with at least one element."),
  body("*.studentId").isMongoId().withMessage("Student Id is required"),
  body("*.qnalistId").isMongoId().withMessage("Qnalist Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description Qnalist validation
 * videoId, duration, title, description
 */
export const qnalistIdValidate = [
  body("qnalistId").isMongoId().withMessage("QnalistId Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * @description batch Id validation
 * title, description
 */
export const batchIdValidate = [
  body("batchId").isMongoId().withMessage("Batch Id is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const connectTeacherValidationRules = [
  body("livestreamId").notEmpty().withMessage("livestreamId is required"),
  body("coursefieldId").notEmpty().withMessage("coursefieldId is required"),
];
