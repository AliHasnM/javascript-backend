import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

// Load environment variables from a .env file located at the specified path
dotenv.config({
  path: "./.env",
});

// Execute the database connection
connectDB()
  .then(() => {
    // Set up an error handler for the app
    app.on("error", (error) => {
      console.log("ERRR:", error);
      throw error;
    });
    // Start the server and listen on the specified port (from .env file or default to 8000)
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at PORT : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    // Log an error message if the database connection fails
    console.log("MongoDB Connection Failed !!!", err);
  });
