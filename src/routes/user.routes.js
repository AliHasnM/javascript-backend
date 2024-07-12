import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

// Create a new router instance
const router = Router();

// Define a POST route for user registration
// When a POST request is made to /register, the upload middleware handles file uploads
// and then the registerUser function is called
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

// Export the router to be used in other parts of the application
export default router;
