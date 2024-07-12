import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
