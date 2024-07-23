import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to get all comments for a specific video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate the videoId parameter
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 }, // Sort comments by creation date in descending order
  };

  // Create an aggregate pipeline to fetch comments
  const aggregate = Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    { $sort: { createdAt: -1 } },
  ]);

  // Use the aggregatePaginate method to paginate the results
  const comments = await Comment.aggregatePaginate(aggregate, options);

  // Return the paginated comments in the response
  return res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", comments));
});

// Controller to add a new comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id; // Assuming user is added to req by authentication middleware

  // Validate the videoId parameter
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Validate the content field
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // Create a new comment document
  const comment = await Comment.create({
    video: videoId,
    owner: userId,
    content,
  });

  // Return the created comment in the response
  return res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", comment));
});

// Controller to update an existing comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validate the commentId parameter
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Find the comment document by its ID
  const comment = await Comment.findById(commentId);

  // Check if the comment exists
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Update the content of the comment
  comment.content = content;
  await comment.save();

  // Return the updated comment in the response
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", comment));
});

// Controller to delete an existing comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Validate the commentId parameter
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Find the comment document by its ID
  const comment = await Comment.findById(commentId);

  // Check if the comment exists
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Delete the comment document
  await comment.deleteOne();

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
