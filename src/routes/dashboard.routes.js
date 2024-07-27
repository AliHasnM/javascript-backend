import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Route to get channel statistics such as total video views, subscribers, etc.
router.route("/stats/:channelId").get(getChannelStats);
// Route to get all videos uploaded by the channel with pagination and sorting
router.route("/videos/:channelId").get(getChannelVideos);

export default router;
