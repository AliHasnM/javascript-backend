import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new router instance
const router = Router();

// Define a POST route for user registration
// When a POST request is made to /register, the upload middleware handles file uploads
// and then the registerUser function is called
router.route("/register").post(
  upload.fields([
    {
      name: "avatar", // Handle file upload for avatar
      maxCount: 1, // Maximum 1 file
    },
    {
      name: "coverImage", // Handle file upload for cover image
      maxCount: 1, // Maximum 1 file
    },
  ]),
  registerUser, // Call the registerUser controller
);

// Define a POST route for user login
// When a POST request is made to /login, the loginUser function is called
router.route("/login").post(loginUser);

// Define a POST route for user logout
// This route is protected by the verifyJWT middleware
// When a POST request is made to /logout, the verifyJWT middleware is called first
// If the token is verified, the logoutUser function is called
router.route("/logout").post(verifyJWT, logoutUser);

// Define a POST route for refreshing the access token
// When a POST request is made to /refresh-token, the refreshAccessToken function is called
router.route("/refresh-token").post(refreshAccessToken);

// This route is protected by the verifyJWT middleware
// When a POST request is made to /change-password, the verifyJWT middleware is called first
// If the token is verified, the changeCurrentPassword function is called
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Define a GET route to get the current user information
// This route is protected by the verifyJWT middleware
// When a GET request is made to /current-user, the verifyJWT middleware is called first
// If the token is verified, the getCurrentUser function is called
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Define a PATCH route to update account details
// This route is protected by the verifyJWT middleware
// When a PATCH request is made to /update-account, the verifyJWT middleware is called first
// If the token is verified, the updateAccountDetails function is called
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Define a PATCH route to update the user avatar
// This route is protected by the verifyJWT middleware
// When a PATCH request is made to /avatar, the verifyJWT middleware is called first
// If the token is verified, the upload middleware handles the avatar file upload
// and then the updateUserAvatar function is called
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Define a PATCH route to update the user cover image
// This route is protected by the verifyJWT middleware
// When a PATCH request is made to /cover-image, the verifyJWT middleware is called first
// If the token is verified, the upload middleware handles the cover image file upload
// and then the updateUserCoverImage function is called
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Define a GET route to get a user channel profile by username
// This route is protected by the verifyJWT middleware
// When a GET request is made to /c/:username, the verifyJWT middleware is called first
// If the token is verified, the getUserChannelProfile function is called
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

// Define a GET route to get the user's watch history
// This route is protected by the verifyJWT middleware
// When a GET request is made to /history, the verifyJWT middleware is called first
// If the token is verified, the getWatchHistory function is called
router.route("/history").get(verifyJWT, getWatchHistory);

// Export the router to be used in other parts of the application
export default router;
