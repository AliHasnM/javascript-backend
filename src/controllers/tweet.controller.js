import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to create a new tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id; // Assuming user is added to req by authentication middleware

  // Check if content is provided
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // Create a new tweet
  const newTweet = await Tweet.create({ content, owner: userId });

  // Respond with the created tweet
  return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", newTweet));
});

// Function to get tweets of a specific user
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Check if userId is valid
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Fetch user tweets with pagination
  const tweets = await Tweet.find({ owner: userId })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  // Respond with the fetched tweets
  return res
    .status(200)
    .json(new ApiResponse(200, "User tweets fetched successfully", tweets));
});

// Function to update a tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id; // Assuming user is added to req by authentication middleware

  // Check if tweetId is valid
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Find the tweet by id and owner
  const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

  // If tweet not found, throw error
  if (!tweet) {
    throw new ApiError(
      404,
      "Tweet not found or you do not have permission to update it",
    );
  }

  // Update tweet content
  tweet.content = content || tweet.content;
  await tweet.save();

  // Respond with the updated tweet
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet));
});
//   const { tweetId } = req.params;
//   const userId = req.user._id; // Assuming user is added to req by authentication middleware

//   if (!isValidObjectId(tweetId)) {
//     throw new ApiError(400, "Invalid tweet ID");
//   }

//   const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

//   if (!tweet) {
//     throw new ApiError(
//       404,
//       "Tweet not found or you do not have permission to delete it",
//     );
//   }

//   await tweet.deleteOne();

//   res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"));
// });

// Function to delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id; // Assuming user is added to req by authentication middleware

  // Check if tweetId is valid
  if (!isValidObjectId(tweetId)) {
    console.error("Invalid tweet ID");
    throw new ApiError(400, "Invalid tweet ID");
  }

  // Find the tweet by id and owner
  const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

  // If tweet not found, throw error
  if (!tweet) {
    console.error("Tweet not found or permission denied");
    throw new ApiError(
      404,
      "Tweet not found or you do not have permission to delete it",
    );
  }

  // Delete the tweet
  await tweet.deleteOne();

  // Respond with success message
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
