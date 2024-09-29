import express from "express";
import studentsRouter from "./students/studentsRouter.js";
import publicRouter from "./public/authRouter.js";
import courses from "./courses/coursesRoute.js";
import teachers from "./teachers/teachersRouter.js";
import courseFields from "./courseFields/courseFieldsRouter.js";
import academic from "./academic/academicRouter.js";
import language from "./language/languageRouter.js";
import subjects from "./subjects/subjectsRouter.js";
import allFiles from "./files/filesRoutes.js";
import syllabus from "./syllabus/syllabusRouter.js";
import videos from "./videos/videosRouter.js";
import playlists from "./playlist/playlistRouter.js";
import overviews from "./overview/overviewRouter.js";
import enrollTeacher from "./teachers/enrollTeacherRoutes.js";
import testQna from "./testQna/testQnaRouter.js";
import testlist from "./testLIst/testListRouter.js";
import attemptTestRoutes from "./attemptTest/attemptTestRouter.js";
import studyMaterials from "./studyMaterial/studyMaterial.js";
import roles from "./roles/rolesRouter.js";
import permission from "./permission/permissionRouter.js";
import plans from "./plans/plansRouter.js";
import planDuration from "./planDuration/planDurationRoutes.js";
import subscription from "./subscription/subscriptionRouter.js";
import liveStream from "./liveStream/liveStreamRouter.js";
import notificationRouter from "./notification/notificationRouter.js";
import newsRouter from "./news/newsRouter.js";
import contactRouter from "./contactUs/contactRouter.js";
import doubtRouter from "./doubt/doubtRouter.js";
import paymentRouter from "./paymentHistory/paymentRouter.js";
import authorizeRouter from "./admin/authorizeRouter.js";
import orderRouter from "./order/orderRouter.js";
import bookmarkRouter from "./bookmark/bookmarkRouter.js";
import quicksolutionRouter from "./quickSolution/quickSolutionRouter.js";
import qnalistsRouter from "./qnalists/qnalists.js";
import qna from "./qna/qnaRouter.js";
import * as auths from "../middlewares/auth.js";
import attempt from "./attempt/attemptRoute.js";
import batchesRouter from "./batches/batchesRouter.js"
const router = express();

// Public APIS
router.use("/public", publicRouter);

//Add contact
router.use("/contact", contactRouter);

// Private APIS
router.use("/students", studentsRouter);

// Course
router.use("/courses", courses);

// Course Fields
router.use("/coursefields", courseFields);

// Teachers
router.use("/teachers", teachers);

// Academics
router.use("/academics", academic);

// Language
router.use("/language", language);

// Subjects
router.use("/subjects", subjects);

// Iconst
router.use("/files", allFiles);

// Syllabus
router.use("/syllabus", syllabus);

// Videos
router.use("/videos", videos);

// Videos
router.use("/playlists", playlists);

// Overview
router.use("/overviews", overviews);

// Enrolled Teacher
router.use("/enroll/teacher", enrollTeacher);

// Enrolled Teacher
router.use("/testlists", testlist);

// Enrolled Teacher
router.use("/testqna", testQna);

//Qna list
router.use("/qnalists", qnalistsRouter);

// Qna route
router.use("/qna", qna);

// Attempt Test students
router.use("/attempttest", attemptTestRoutes);

// Study Material
router.use("/studymaterial", studyMaterials);

// Student Notification
router.use("/notifications", notificationRouter);

// Student doubts]
router.use("/doubt", doubtRouter);

// Payment History
router.use("/payment", paymentRouter);

// Create order
router.use("/order", orderRouter);

// Bookmark
router.use("/bookmark", bookmarkRouter);

// Attempt
router.use("/attempt", attempt);

/**
 * @access Admin
 */
router.use("/admin/auth", publicRouter);
router.use("/admin/roles", roles);
router.use("/admin/permission", permission);

router.use("/plans", plans);
router.use("/planduration", planDuration);

// Subscription
router.use("/subscription", subscription);

// Live Stream
router.use("/stream", liveStream);

//News
router.use("/news", newsRouter);

// Admin user create & update
router.use("/admin", authorizeRouter);
router.use("/teacher", auths.auth, authorizeRouter);

//Quick solution
router.use("/quicksolution", quicksolutionRouter);

//Batches
router.use("/batch", batchesRouter);

export default router;
