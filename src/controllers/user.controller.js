import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

export { registerUser, loginUser, logoutUser, refreshAccessToken };
