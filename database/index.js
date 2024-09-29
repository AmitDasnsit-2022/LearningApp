import mongoose from "mongoose";

const connection = () => {
  try {
    mongoose.connect(process.env.DATA_BASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.on("connected", () => {
      console.log("Connected to Database");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Disconnected from Database");
    });
  } catch (error) {
    console.log(error.message);
  }
};

export default connection;
