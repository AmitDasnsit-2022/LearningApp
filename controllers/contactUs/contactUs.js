import { successResponse, errorResponse } from "../../helpers/index.js";
import contact from "../../modules/contact.js";

export const addContact = async (req, res) => {
    try {
        const { name, email, message, number } = req.body;
        const newContact = new contact({
          name,
          email,
          message,
          number,
        });
        const data = await newContact.save();
       return successResponse(req, res, data, 200, "Contact added successfully");

    }
    catch (error) {
        console.log(error);
        return errorResponse(req, res, error, 500);

    }
}
