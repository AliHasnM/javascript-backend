import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id; // Assuming user is added to req by authentication middleware

  // Check if name and description are provided
  if (!(name || description)) {
    throw new ApiError(400, "Playlist name and description are required");
  }

  // Check if userId is available
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID is missing");
  }

  // Create the playlist
  const playlist = await Playlist.create({ name, description, owner: userId });

  // Return the response
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

// Get all playlists of a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate the user ID
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Fetch playlists for the user
  const playlists = await Playlist.find({ user: userId });

  // Return successful response with the user's playlists
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully"),
    );
});

// Get a specific playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  // Validate the playlist ID
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  // Fetch the playlist by ID
  const playlist = await Playlist.findById(playlistId);

  // Handle case where playlist is not found
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Return successful response with the playlist
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate the playlist and video IDs
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  // Fetch the playlist by ID
  const playlist = await Playlist.findById(playlistId);

  // Handle case where playlist is not found
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Add video to the playlist if not already present
  if (!playlist.videos.includes(videoId)) {
    playlist.videos.push(videoId);
    await playlist.save();
  }

  // Return successful response with the updated playlist
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully"),
    );
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  // Validate the playlist and video IDs
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID");
  }

  // Fetch the playlist by ID
  const playlist = await Playlist.findById(playlistId);

  // Handle case where playlist is not found
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Remove video from the playlist if present
  const videoIndex = playlist.videos.indexOf(videoId);
  if (videoIndex > -1) {
    playlist.videos.splice(videoIndex, 1);
    await playlist.save();
  }

  // Return successful response with the updated playlist
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully",
      ),
    );
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  // Validate the playlist ID
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  // Fetch the playlist by ID
  const playlist = await Playlist.findById(playlistId);

  // Handle case where playlist is not found
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Handle case where playlist is not found
  await playlist.deleteOne();

  // Return successful response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

// Update a playlist's details
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // Validate the playlist ID
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  // Fetch the playlist by ID
  const playlist = await Playlist.findById(playlistId);

  // Handle case where playlist is not found
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // Update playlist details if provided
  if (name) playlist.name = name;
  if (description) playlist.description = description;

  // Save updated playlist
  await playlist.save();

  // Return successful response with the updated playlist
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
