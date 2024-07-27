import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create an instance of an Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) with specified options
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allow requests from the specified origin
    credentials: true, // Allow cookies to be sent with requests
  }),
);

// Parse incoming JSON requests with a size limit (Form Data)
// Parse URL-encoded data with a size limit (URL Data)
// Serve static files from the "public" directory (e.g., images, PDFs, icons)
// Parse cookies attached to the client requests
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/dashboard", dashboardRouter);
// http://localhost:8000/api/v1/users${differentRoutes}

// Export the configured Express app instance
export { app };
