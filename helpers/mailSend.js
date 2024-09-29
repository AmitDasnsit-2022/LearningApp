import dotenv from "dotenv";
import * as nodemailer from "nodemailer";
import axios from "axios";
dotenv.config();

/**
 * @description this is for alternet function of sendmail
 * @param {*} usermail
 * @param {*} mailSubject
 * @param {*} body
 * @returns
 */
export const sendMail = async (usermail, mailSubject, body) => {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    </head>
    <body>
    <div> <center>${body ?? "Test text"}</center></div>
    </body>
    </html>`;
  const config = {
    headers: {
      Accept: "application/json",
      "Api-Key": process.env.brevo_key,
      "Content-Type": "application/json",
    },
  };

  const data = {
    sender: {
      email: process.env.mail_username,
      name: "From Imtihan",
    },
    to: [
      {
        email: usermail,
      },
    ],
    subject: mailSubject,
    htmlContent: htmlTemplate,
  };

  try {
    const res = await axios.post(process.env.brevo_api, data, config);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Mail Error:- ", error.message);
    return error.message;
  }
};
