import express from 'express';
const router = express();
import * as contactController from '../../controllers/contactUs/contactUs.js'
import * as validate from "../../helpers/validates.js";

router.post('/addcontact',validate.addContactValidate,contactController.addContact);

export default router;