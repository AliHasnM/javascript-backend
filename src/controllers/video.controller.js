import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Set the path to the ffprobe binary
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Controller to get all videos with pagination, search, and sorting
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  // Create a filter object based on query and userId
  const filter = {
    ...(query && { title: { $regex: query, $options: "i" } }),
    ...(userId && isValidObjectId(userId) && { user: userId }),
  };

  // Define sorting order
  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  // Options for pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
  };

  // Aggregate videos with filters and sorting
  const aggregate = Video.aggregate([{ $match: filter }, { $sort: sort }]);

  // Fetch paginated videos
  const videos = await Video.aggregatePaginate(aggregate, options);

  // Success Message and Response
  return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", videos));
});

// Function to get video duration using ffprobe
const getVideoDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(new Error("Failed to retrieve video duration"));
      resolve(metadata.format.duration);
    });
  });
};

// Controller to publish a video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const owner = req.user._id;
  const files = req.files;

  if (!files || !files.videoFile || !files.thumbnail) {
    throw new ApiError(400, "Video and thumbnail files are required");
  }

  const videoFileLocalPath = files.videoFile[0].path;
  const thumbnailLocalPath = files.thumbnail[0].path;

  // Get video duration
  const duration = await getVideoDuration(videoFileLocalPath);
  if (!duration) {
    throw new ApiError(400, "Failed to retrieve video duration");
  }

  // Upload files to Cloudinary
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(
      400,
      "Failed to upload video or thumbnail to Cloudinary",
    );
  }

  // Create a new video document
  const video = await Video.create({
    title,
    description,
    owner,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration,
  });

  // Success message and Response
  return res
    .status(201)
    .json(new ApiResponse(201, "Video published successfully", video));
});

// Controller to get a video by ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Success message and Response
  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video));
});

// Controller to update video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Update video fields if provided
  if (title) video.title = title;
  if (description) video.description = description;
  if (thumbnail) video.thumbnail = thumbnail;

  await video.save();

  // Success message and Response
  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

// Controller to delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Delete the video document
  await video.deleteOne(); // Use deleteOne method

  // Success message and Response
  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

// Controller to toggle the publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Toggle the isPublished status
  video.isPublished = !video.isPublished;
  await video.save();

  // Success message and Response
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video publish status toggled successfully", video),
    );
});

// Export all controller functions
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
