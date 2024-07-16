import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
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

// Export the router to be used in other parts of the application
export default router;
