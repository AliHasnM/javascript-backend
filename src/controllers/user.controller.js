import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Function to generate access and refresh tokens for a user
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find user by ID
    const user = await User.findById(userId);

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user document
    user.refreshToken = refreshToken;
    await user.save({ ValiditeBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Throw an error if something goes wrong
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

// Handler for user registration
const registerUser = asyncHandler(async (req, res) => {
  // Destructure the user data from the request body
  const { username, email, password, fullName } = req.body;
  // console.log("Req Body", req.body);
  // console.log("Username:", username);
  // console.log("Email:", email);
  // console.log("Password:", password);
  // console.log("FullName:", fullName);

  // Validate that all fields are provided
  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if a user with the same username or email already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If user exists, throw an error
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // console.log("Req Files:", req.files);
  // Extract avatar file path from the uploaded files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // Extract cover image file path if it exists
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // Validate that the avatar file is provided
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required - multer not upload");
  }

  // Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Validate that the avatar file was uploaded successfully
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required - cloudinary not upload");
  }

  // Create a new user with the provided and uploaded data
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Retrieve the created user without the password and refreshToken fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // If the user creation fails, throw an error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Send a success response with the created user data
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

// Handler to login a user
const loginUser = asyncHandler(async (req, res) => {
  // Destructure the user data from the request body
  const { username, email, password } = req.body;

  // Check if username or email is provided
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  // Find user by username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If user is not found, throw an error
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Check if the provided password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  // If password is incorrect, throw an error
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  // Find the logged-in user and exclude password and refreshToken fields
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // Options for the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send the tokens and user data in the response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully",
      ),
    );
});

// Handler to logout a user
const logoutUser = asyncHandler(async (req, res) => {
  // Clear the refresh token of the user
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true },
  );

  // Options for the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send a response indicating the user has logged out
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// Handler to refresh the access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get the refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // If no refresh token is provided, throw an error
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    // Verify the incoming refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    // Find the user by the ID in the decoded token
    const user = await User.findById(decodedToken?._id);

    // If user is not found, throw an error
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // If the refresh token does not match the user's refresh token, throw an error
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is Expired or Used");
    }

    // Options for the cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new access and refresh tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Send the new tokens in the response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed",
        ),
      );
  } catch (error) {
    // Throw an error if the refresh token is invalid
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Function to change the current user's password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Find the user by their ID
  const user = await User.findById(req.user?._id);
  // Check if the old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  // If the old password is incorrect, throw an error
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password");
  }

  // Set the new password
  user.password = newPassword;
  // Save the user without validating the password before save
  await user.save({ ValiditeBeforeSave: false });

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change Successfully"));
});

// Function to get the current user's details
const getCurrentUser = asyncHandler(async (req, res) => {
  // Return the current user's details
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
});

// Function to update the current user's account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  // If fullName or email is missing, throw an error
  if (!fullName || !email) {
    throw new ApiError(400, "All fileds are required");
  }

  // Find the user by their ID and update their details
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true },
  ).select("-password");

  // Return a success response with the updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details update successfully"));
});

// Function to update the current user's avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  // If avatar file is missing, throw an error
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing - multer side");
  }

  // TODO: delete old image - assignment

  // Upload the avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // If there was an error uploading the avatar, throw an error
  if (!avatar.url) {
    throw new ApiError(
      400,
      "Error while uploading on avatar - cloudinary side",
    );
  }

  // Find the user by their ID and update their avatar
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  ).select("-password");

  // Return a success response with the updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Image updated successfully"));
});

// Function to update the current user's cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  // If cover image file is missing, throw an error
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing - multer side");
  }

  // Upload the cover image to Cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // If there was an error uploading the cover image, throw an error
  if (!coverImage.url) {
    throw new ApiError(
      400,
      "Error while uploading on Cover Image - cloudinary side",
    );
  }

  // Find the user by their ID and update their cover image
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    },
  ).select("-password");

  // Return a success response with the updated user details
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

// Function to get User channel Profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  // Check if username is provided and not empty
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }

  // Aggregate pipeline to fetch user channel profile
  const channel = await User.aggregate([
    {
      // Match the user by username (case-insensitive)
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      // Lookup the subscriptions where the user is the channel
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      // Lookup the subscriptions where the user is the subscriber
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      // Add fields for subscribers count, channels subscribed to count, and subscription status
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // Project the necessary fields for the response
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  // Check if the channel exists
  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  // Return the user channel profile
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});

// Function to get User Watch History
const getWatchHistory = asyncHandler(async (req, res) => {
  // Perform an aggregation query on the User collection
  const user = await User.aggregate([
    {
      // Match the user document by the provided user ID in the request
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      // Lookup the watch history from the videos collection
      $lookup: {
        from: "videos", // collection to join with
        localField: "watchHistory", // field form input document (users collection)
        foreignField: "_id", // field form videos collection
        as: "watchHistory", // name of new array field to add the user document
        pipeline: [
          {
            $lookup: {
              from: "users", // collection to join with
              localField: "owner", // field form input document (videos collection)
              foreignField: "_id", // field from users collection
              as: "owner", // name of new array field to add the video document
              pipeline: [
                {
                  // Project only the required fields from the owner document
                  $project: {
                    fullName: 1, // include fullName field
                    username: 1, // include username field
                    avatar: 1, // include avatar field
                  },
                },
                {
                  // Add a field to ensure the owner field is a single object instead of an array
                  $addFields: {
                    owner: {
                      // Take the first element of the owner array
                      $first: "$owner",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  // Send the watch history in the response with a success message
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History Fetched Successfully",
      ),
    );
});

// Export the functions for use in other modules
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
