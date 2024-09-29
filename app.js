import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import indexRouter from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import cors from "cors";
import connection from "./database/index.js";
import aws from "aws-sdk";
import fileUpload from "express-fileupload";
import rateLimit from "express-rate-limit";
import { sendOtpTwillo } from "./helpers/index.js";

dotenv.config();

aws.config.update({
  region: process.env.region,
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
});
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   limit: 6000,
//   message: "You have exceeded the 100 requests in 15 minutes limit!",
// });
const s3 = new aws.S3();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
var app = express();
connection();
// app.use(limiter);
app.use(cors());
app.use(fileUpload());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "hls_files")));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Test api");
});

app.use("/api", indexRouter);

export default app;
