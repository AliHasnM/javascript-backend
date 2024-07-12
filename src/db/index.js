import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Database Connection (try_catch and async_await)
// Function to establish a connection to the MongoDB database using Mongoose
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database using the connection string and database name
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    // Log a success message with the host of the connected database
    console.log(
      `\n MongoDB Connected !! DB Host: ${connectionInstance.connection.host}`,
    );
    // success message with host of the connected database
  } catch (error) {
    // If there is an error during connection, log an error message
    console.log("MongoDB Connection Failed:", error);
    process.exit(1);
    // process.exit(1) node js hamy access deta hai k hum process ko kahi b use kr sakty hain without import keye. hamari current application kesii na kesi process pr chal rahi hoti hai tu ye process osi ka reference hota hai. exit(number) ye ik function hai es se hamara process exit ho jaie ga
  }
};

// Export the connectDB function as the default export from this module
export default connectDB;
