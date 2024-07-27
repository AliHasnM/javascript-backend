import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Route to get subscribed channels and toggle subscription for a specific channel
router
  .route("/c/:channelId")
  .get(getSubscribedChannels) // Fetch all channels subscribed by a user
  .post(toggleSubscription); // Toggle subscription status for a channel

// Route to get all subscribers of a user's channel
router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
