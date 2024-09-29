import express from "express";
const router = express();
import * as validate from "../../helpers/validates.js";
import * as language from "../../controllers/language/languageController.js";
import * as auths from "../../middlewares/auth.js";

router.post(
  "/add/new",
  auths.admin("create"),
  validate.academicValidate,
  language.addLanguage
);
router.post(
  "/update",
  auths.admin("edit"),
  validate.updateLanguageValidate,
  language.updateLanguage
);
router.post(
  "/delete",
  auths.admin("delete"),
  validate.updateLanguageValidate,
  language.deleteLanguage
);
router.post("/getall", auths.admin("read"), language.getAllLanguage);

export default router;
