import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription for a channel
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id; // Assuming user is added to req by authentication middleware

  // Validate channel ID
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Check if the user is already subscribed to the channel
  const subscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  // If subscribed, unsubscribe; else, subscribe
  if (subscription) {
    await subscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed successfully"));
  } else {
    await Subscription.create({ subscriber: userId, channel: channelId });
    return res
      .status(201)
      .json(new ApiResponse(201, "Subscribed successfully"));
  }
});

// Get all channels subscribed by a user
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate channel ID
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }

  // Fetch subscriptions for the given channel ID
  const subscriptions = await Subscription.find({
    channel: channelId,
  }).populate("channel", "username fullName");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribed channels fetched successfully",
        subscriptions,
      ),
    );
});

// Get all subscribers of a user's channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // Validate subscriber ID
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID");
  }

  // Fetch subscribers for the given subscriber ID
  const subscribers = await Subscription.find({
    subscriber: subscriberId,
  }).populate("subscriber", "username fullName");

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers fetched successfully", subscribers),
    );
});

export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers };
