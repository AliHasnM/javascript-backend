import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // Validate channel ID
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Get total number of subscribers for the channel
  const totalSubscribers = await Subscription.countDocuments({ channelId });

  // Fetch all videos uploaded by the channel
  const videos = await Video.find({ channelId });

  // Calculate total number of videos and total views for the channel
  const totalVideos = videos.length;
  const totalViews = videos.reduce((acc, video) => acc + video.views, 0);

  // Get total number of likes for all videos in the channel
  const totalLikes = await Like.countDocuments({
    videoId: { $in: videos.map((video) => video._id) },
  });

  // Return the channel stats as a response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes,
      },
      "Channel Stats Details",
    ),
  );
});

// Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const {
    page = 1, // Default to page 1 if not specified
    limit = 10, // Default to 10 videos per page if not specified
    sortBy = "createdAt", // Default sorting by creation date
    sortType = "desc", // Default sorting order is descending
  } = req.query;

  // Validate channel ID
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Fetch videos uploaded by the channel with pagination and sorting
  const videos = await Video.find({ channelId })
    .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Get the total number of videos uploaded by the channel
  const totalVideos = await Video.countDocuments({ channelId });

  // Return the paginated list of videos as a response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        videos,
      },
      "Channel Videos Details",
    ),
  );
});

export { getChannelStats, getChannelVideos };
