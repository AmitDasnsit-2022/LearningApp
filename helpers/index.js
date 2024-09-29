import twilio from "twilio";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import multer from "multer";
import multerS3 from "multer-s3";
import * as nodemailer from "nodemailer";
import admin from "firebase-admin";
import serviceAccount from "./google-service.json" assert { type: "json" };
import Razorpay from "razorpay";
import * as crypto from "crypto";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import notifications from "../modules/notifications.js";
import CryptoJS from "crypto-js";
import { CronJob } from "cron";
import testList from "../modules/testList.js";
import attemptexamlists from "../modules/attemptExamList.js";
import moment from "moment";
import EventEmitter from "node:events";
import https from "https";
import axios from "axios";
export const myEvents = new EventEmitter();

dotenv.config();

// Twilio Configuration
// const client = new twilio(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

const awsconfig = {
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  s3ForcePathStyle: true, // Needed for minio, remove if using AWS S3
  endpoint: process.env.endpoint,
  sslEnabled: false, // Set to true if you're connecting to an HTTPS endpoint
  signatureVersion: "v4", // Use Signature Version  4 signing process
  region: process.env.region,
  httpOptions: {
    agent: new https.Agent({
      rejectUnauthorized: false, // This will disable SSL verification
    }),
  },
};
//Aws configuration
AWS.config.update(awsconfig);

const s3 = new AWS.S3();

//mail configuration
const transporter = nodemailer.createTransport({
  host: process.env.mail_host_name,
  port: process.env.mail_port,
  auth: {
    user: process.env.mail_username,
    pass: process.env.mail_password,
  },
});

//firebase configuration
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Razorpay configuration
let instance = new Razorpay({
  key_id: process.env.razorpay_key_id,
  key_secret: process.env.key_secret,
  // headers: {"X-Razorpay-Account": "acc_Ef7ArAsdU5t0XL"}
});

export const successResponse = (req, res, data, code, msg, token, count) => {
  return res.status(code ?? 200).json({ data, msg, token, count });
};

export const errorResponse = (req, res, error, code) => {
  return res.status(code ?? 500).json({ error });
};

export const successResponseObject = ({
  req,
  res,
  data,
  code,
  msg,
  token,
  count,
}) => {
  return res.status(code ?? 200).json({ data, msg, token, count });
};

export const errorResponseObject = ({ req, res, error, code }) => {
  return res.status(code ?? 500).json({ error });
};

export const generateOTP = async () => {
  const digits = "123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  return otp;
};

export const sendOtpTwillo = async (mobile) => {
  const otp = await generateOTP();
  const message_od = `Your Cotgin Analytics verification OTP code is ${otp}. The code is valid for 2 minutes only, for one-time use. Please do not share this OTP with anyone.`;
  const message = `Your OTP is ${otp} for logging into your application, Please do not share it with anybody. - Cotgin Analytics`;
  try {
    // API endpoint
    const url = process.env.API_URL;

    // Data to be sent
    const postData = {
      apikey: process.env.API_KEY,
      senderid: process.env.SENDER_ID,
      number: mobile, // Comma-separated list of numbers
      message: message,
      format: "json",
    };
    const response = await axios.post(url, postData);
    // Sending POST request
    if (
      response.data.status === "AZQ01" ||
      response.data.status === "AZQ02" ||
      response.data.status === "AZQ03" ||
      response.data.status === "AZQ04" ||
      response.data.status === "AZQ05" ||
      response.data.status === "AZQ06" ||
      response.data.status === "AZQ07" ||
      response.data.status === "AZQ08" ||
      response.data.status === "AZQ09" ||
      response.data.status === "AZQ10" ||
      response.data.status === "AZQ12" ||
      response.data.status === "AZQ13" ||
      response.data.status === "AZQ14" ||
      response.data.status === "AZQ15" ||
      response.data.status === "AZQ16" ||
      response.data.status === "AZQ17"
    ) {
      return response.data.message;
    } else {
      // Logging response
      console.log("OTP Send successfully", response.data); // Assuming the API returns data in JSON format
      return parseInt(otp);
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

/**
 * @param {*} oldImage old user profile url
 */
export const removeFile = (oldImage) => {
  fs.unlink("./public" + oldImage, (err) => {
    if (err) console.log({ err });
    console.log("File deleted...");
  });
};

export const removeFile_old = (oldImage, foldername) => {
  const startIndex = oldImage.indexOf(foldername) + foldername.length;
  const value = oldImage.substring(startIndex);
  s3.deleteObject(
    {
      Bucket: process.env.bucket_name,
      Key: `${foldername}${value}`,
    },
    (err, data) => {
      if (err) {
        console.error("Error removing file:", err);
        return;
      } else {
        console.log("File removed successfully");
      }
    }
  );
};

/**
 *  * Upload user profile
 * @description Upload file with largest size on s3 bucket.
 * @param {*} filedata
 * @returns
 */
export const uploadFiles = async (filedata, foldername, oldImage) => {
  return new Promise((resolve, reject) => {
    const uniqueFileName = `/${foldername}/${Date.now()}_${filedata.name.replaceAll(
      " ",
      "_"
    )}`;
    filedata.mv("./public" + uniqueFileName, function (err) {
      if (err) return reject(err);
      if (oldImage) {
        removeFile(oldImage);
      }
      return resolve(uniqueFileName);
    });
  });
};

export const uploadFiles_old = async (filedata, foldername, oldImage) => {
  return new Promise((resolve, reject) => {
    const uniqueFileName = `${foldername}/${Date.now()}_${filedata.name.replaceAll(
      " ",
      "_"
    )}`;
    if (oldImage) {
      removeFile(oldImage, foldername);
    }
    let fileBuffer = filedata.data;
    fileBuffer.name = filedata.name;
    var params = {
      Bucket: process.env.bucket_name,
      Body: fileBuffer,
      ACL: process.env.bucket_access,
      Key: uniqueFileName,
    };
    s3.upload(params, (error, s3Data) => {
      if (error) {
        console.log({ error });
        return reject(error);
      } else {
        console.log(s3Data.Location);
        console.log({ uniqueFileName });
        const param = {
          Bucket: process.env.bucket_name, // Replace with your bucket name
          Key: uniqueFileName, // Replace with the key of the object you want to update
          Expires: 604800, // 15 minutes
        };

        const url = s3.getSignedUrl("getObject", param);
        return resolve(url);
      }
    });
  });
};

export const getVideoDurationWithOneFile = async (filePath) => {
  try {
    const file = await fs.open(filePath, "r");
    const buff = Buffer.alloc(100);
    const header = Buffer.from("mvhd");
    const { buffer } = await file.read(buff, 0, 100, 0);
    await file.close();
    const start = buffer.indexOf(header) + 17;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);
    const audioLength = Math.floor((duration / timeScale) * 1000) / 1000;

    const hours = Math.floor(audioLength / 3600);
    const minutes = Math.floor((audioLength % 3600) / 60);
    const seconds = audioLength % 60;
    let HH = hours.toString().padStart(2, "0");
    let MM = minutes.toString().padStart(2, "0");
    let SS = parseInt(seconds);
    let videoDuration = `${
      hours > 0 ? `${HH}:` : ""
    }${MM}:${SS.toString().padStart(2, "0")}`;
    return videoDuration;
  } catch (error) {
    return error.message;
  }
};

/**
 * @description Get Video time duration with video buffer
 */
export const getVideoDuration = async (buffer) => {
  try {
    const buff = Buffer.alloc(100);
    const header = Buffer.from("mvhd");
    const start = buffer.indexOf(header) + 17;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);
    const audioLength = Math.floor((duration / timeScale) * 1000) / 1000;

    const hours = Math.floor(audioLength / 3600);
    const minutes = Math.floor((audioLength % 3600) / 60);
    const seconds = audioLength % 60;
    const HH = hours.toString().padStart(2, "0");
    const MM = minutes.toString().padStart(2, "0");
    const SS = parseInt(seconds);
    const videoDuration = `${
      hours > 0 ? `${HH.toString().padStart(2, "0")}h:` : "0h:"
    }${MM.toString().padStart(2, "0")}m:${SS.toString().padStart(2, "0")}s`;

    console.log(videoDuration);
    return videoDuration;
  } catch (error) {
    console.log({ error });
    return error.message;
  }
};

export const pdfStream = async (req, res, fileUrl, bookmarkeddata) => {
  try {
    let filename = fileUrl.split("amazonaws.com/")[1].replace("%2F", "/");
    const s3 = new AWS.S3(awsconfig);
    const s3Params = {
      Bucket: process.env.bucket_name,
      Key: filename,
    };

    const range = req.headers.range;
    const filedata = await s3
      .headObject({ Bucket: s3Params.Bucket, Key: s3Params.Key })
      .promise();

    const fileSize = filedata.ContentLength;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const s3Stream = s3
        .getObject({
          Bucket: s3Params.Bucket,
          Key: s3Params.Key,
          Range: `bytes=${start}-${end}`,
        })
        .createReadStream();

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "application/pdf",
        isBookmarked: bookmarkeddata,
      });

      return s3Stream.pipe(res);
    } else {
      const s3Stream = s3
        .getObject({ Bucket: s3Params.Bucket, Key: s3Params.Key })
        .createReadStream({ highWaterMark: 64 * 1024 });
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "application/pdf",
        isBookmarked: bookmarkeddata,
      });

      return s3Stream.pipe(res);
    }
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

/**
 * Send mail on payment and student course subscription.
 * @param {*} usermail
 * @param {*} mailSubject
 * @returns
 *  <div style="height: 800px;  background-color: rgb(251,251,251); max-width: 600px;margin: auto;padding: 0 3%;">
            <div style=" max-width: 560px;padding-top: 35px; height: 70px;text-align:center;background: #EC4A5E; display: block; position:relative; top:30px; color: white; font-weight: 900; font-size: 20px;">
                <span style="position: relative;top: 40px;">Payment Received</span>
            </div>
            <div>
                <p style="position: relative;top: 40px; font-size: 16px;">Dear '.$invoice_name.',</p>
                <p style="position: relative;top: 40px;">Thank you for your payment. It was a pleasure doing business with you. We look forward to work together again!</p>
            </div>
            <br>
            <div style="background-color: yellowgreen; height: 450px; position: relative;top: 40px; padding: 3%;background: #fefff1;border: 1px solid #e8deb5;color: #333;">
                <div
                    style="position: relative;top: 10px;    padding: 0 3% 3%;border-bottom: 1px solid #e8deb5;text-align: center;">
                    <p style="text-align: center; font-size: large; font-weight: bold;">Payment Received</p>
                    <p style="text-align: center; font-size: large; font-weight: bold;color: green;">$'.$set_total_due_amount.'</p>
                </div>
                <div
                    style="display: flex; padding: 50px 90px 0;  ustify-content: space-around;">
                    <div>
                        <p style="text-align:start; margin-left:50px;">Invoice No.</p>
                        <p style="text-align:start; margin-left:50px;">Payment Date</p>
                    </div>
                    <div>
                        <p style="text-align:start; font-weight:900; margin-left:80px;">'.$invoice_number.'</p>
                        <p style="text-align:start; font-weight:900; margin-left:80px;">'.$date.'</p>
                    </div>
                </div>
                <div>
                </div>
                <p style="text-align:start;">Regards, <br>
                <span style="color: #8c8c8c;">Trust Haven Solution Inc.</span><br>
            </div>
        </div>
 */
export const sendMail = async (usermail, mailSubject, body) => {
  try {
    // HTML email template
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
    const mailOptions = {
      from: process.env.sender_mail,
      to: usermail,
      subject: mailSubject,
      html: htmlTemplate,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log({ mail: error });
        return error;
      } else {
        console.log("Email sent: ");
        return info;
      }
    });
  } catch (error) {
    console.log({ error });
    return error.message;
  }
};

/**
 * send single notification on mobile application
 * @param {*} fcmtoken
 * @param {*} title
 * @param {*} body
 * @param {*} data
 * @returns
 */
export const sendNotification = (fcmtoken, title, body, data, studentId) => {
  if (fcmtoken === (undefined || "" || null)) return;
  return new Promise((succ, rej) => {
    const message = {
      data: { data: JSON.stringify(data) },
      notification: {
        title: title,
        body: body,
      },
      token: fcmtoken,
    };
    admin
      .messaging()
      .send(message)
      .then(async (response) => {
        const newNotification = new notifications({
          title: title,
          description: body,
          notificationType: title,
          userId: data.studentId || studentId,
        });
        console.log("Notification sent successfully:", response);
        await newNotification.save();
        return succ("Notification sent successfully");
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        return rej("Error sending notification");
      });
  });
};

/**
 * Send notification on multiples of users at same times
 * @param {*} fcmtoken fcm with user data.like [{studentId:{fcmToken:kjljlkjklk, _id: kjflskdjflskdjfkls}}]
 * @param {*} title
 * @param {*} body
 * @param {*} data
 * @returns
 */
export const sendMultiNotification = (fcmtoken, title, body, data) => {
  if (!fcmtoken.length) return;
  return new Promise((succ, rej) => {
    for (const user of fcmtoken) {
      const message = {
        data: { data: JSON.stringify(data) },
        notification: {
          title: title,
          body: body,
        },
        token: user.studentId.fcmToken,
      };
      admin
        .messaging()
        .send(message)
        .then(async (response) => {
          return succ("Notification sent successfully");
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
          return rej("Error sending notification");
        });
    }
  });
};

export const generateUUID = () => {
  let d = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
};

/**Razorpay order Generate */
export const orderGenerate = (amount) => {
  return new Promise((succ, rej) => {
    instance.orders
      .create({
        amount: amount * 100,
        currency: "INR",
        receipt: generateUUID(),
      })
      .then((data) => succ(data))
      .catch((error) => rej(error));
  });
};

myEvents.on("convertRtmpTom3u8", (data, streamName) => {
  try {
    const dirname = "public/hls_files";
    const streamEndPoint = `${process.env.steam_end_point}/${streamName}`;
    fs.mkdir(`./${dirname}/${streamName}`, { recursive: true }, (err) =>
      console.log({ err })
    );
    // setTimeout(() => {
    //   console.log({ streamdata: data });
    //   getSubscriptionStudents(data)
    //     .then((tokens) => {
    //       // console.log({ tokens });
    //       if (tokens.length)
    //         sendMultiNotification(
    //           tokens,
    //           "Live Stream",
    //           "Live start, you can join it",
    //           data
    //         );
    //     })
    //     .catch((err) => {
    //       console.log("get tokens", err);
    //     });
    // }, 10000);
    // await uploadHlsFiles(`${dirname}/${streamName}`, "videos");
    ffmpeg(streamEndPoint)
      .setFfmpegPath(ffmpegPath.path)
      .inputFormat("flv")
      .inputOptions(["-copyts"])
      .outputOptions([
        "-hls_time 10",
        "-hls_list_size 0",
        // "-hls_wrap 10",
        "-c:v libx264", // Set the video codec to libx264
        "-preset fast", // Use a faster encoding preset
        "-crf 23", // Set the Constant Rate Factor (CRF) for video quality (adjust as needed)
        "-max_muxing_queue_size 1024",
        // "-hls_segment_filename segment_%03d.ts", // Segment filename pattern
      ])
      .on("end", (dat) => {
        console.log("stopped");
      })
      .output(`./${dirname}/${streamName}/output.m3u8`)
      .run();
  } catch (error) {
    console.log({ error });
    return error.message;
  }
});

/**
UPload files on s3 bucket
 */
export const smallFileOns3 = (file, folder) => {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: process.env.bucket_name,
      Body: file,
      ACL: process.env.bucket_access,
      Key: folder,
    };
    s3.upload(params, (error, s3Data) => {
      if (error) {
        console.log({ error });
        return reject(error);
      } else {
        const param = {
          Bucket: process.env.bucket_name, // Replace with your bucket name
          Key: folder, // Replace with the key of the object you want to update
          Expires: 604800, // 15 minutes
        };
        const url = s3.getSignedUrl("getObject", param);
        console.log(s3Data.Location);
        return resolve(url);
      }
    });
  });
};

export const createStreamForLive = (req, res, streamName) => {
  return (
    ffmpeg(`./public/hls_files/${streamName}/output.m3u8`)
      .setFfmpegPath(ffmpegPath.path)
      .videoCodec("libx264") // Change to an appropriate video codec
      // .videoBitrate("10000k")
      // .audioBitrate("320k")
      .audioCodec("aac") // Change to an appropriate audio codec
      .format("matroska") // Change to a different format (e.g., 'matroska' or 'flv')
      .on("end", () => {
        console.log("Streaming finished");
        res.end(); // Close the response stream when ffmpeg is done
      })
      .on("error", (err) => {
        console.error("Error:", err);
      })
      .pipe(res)
  );
};

/**@description Data encryption */
export const encryptData = (data) => {
  const encJson = CryptoJS.AES.encrypt(
    data,
    process.env.JWT_PAYLOAD_SECRET_KEY
  ).toString();
  const encData = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(encJson)
  );
  return encData;
};

/**@description Data Decryption*/
export const decryptData = (data) => {
  const decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
  const bytes = CryptoJS.AES.decrypt(
    decData,
    process.env.JWT_PAYLOAD_SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);
  return JSON.parse(bytes);
};

const job = new CronJob(
  "*/30 * * * * *", // cronTime
  async function () {
    try {
      const currentTime = new Date();
      const testlistdata = await testList.aggregate([
        {
          $match: {
            testListType: "exam",
            isActive: true,
            isDelete: false,
            endTime: { $lt: currentTime },
          },
        },
        {
          $lookup: {
            from: "attemptexamlists",
            let: { testListId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$testListId", "$$testListId"],
                  },
                  rank: { $exists: false },
                },
              },
              {
                $sort: {
                  obtainMarks: -1,
                  timeDuration: -1,
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "attemptexamlists",
          },
        },
        {
          $project: {
            _id: 1,
            courseFieldId: 1,
            attemptexamlists: 1,
          },
        },
        {
          $match: {
            attemptexamlists: { $ne: [] },
          },
        },
      ]);

      if (testlistdata.length) {
        const data = await attemptexamlists
          .find({
            courseFieldId: testlistdata[0].courseFieldId,
            testListId: testlistdata[0]._id,
            isActive: true,
            isDelete: false,
            rank: { $exists: false },
          })
          .sort({ obtainMarks: -1, timeDuration: -1 });
        if (!data.length) {
          return;
        }

        data.forEach(async (item, i) => {
          await attemptexamlists.updateOne(
            {
              _id: item._id,
              studentId: item.studentId,
              testListId: item.testListId,
              rank: { $exists: false },
            },
            { rank: 1 + i }
          );
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  }, // onTick
  null, // onComplete
  true, // start
  "Asia/Kolkata" // timeZone
);
