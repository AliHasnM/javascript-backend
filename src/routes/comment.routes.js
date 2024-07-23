import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// Apply verifyJWT middleware to all routes in this file
// This ensures that only authenticated users can access these routes
router.use(verifyJWT);

// Define routes for handling comments related to a specific video
// GET /:videoId - Fetch all comments for a video
// POST /:videoId - Add a new comment to a video
router
  .route("/:videoId")
  .get(getVideoComments) // Handler to get comments for the video
  .post(addComment); // Handler to add a comment to the video

// Define routes for handling specific comment operations
// DELETE /c/:commentId - Delete a specific comment
// PATCH /c/:commentId - Update a specific comment
router
  .route("/c/:commentId")
  .delete(deleteComment) // Handler to delete a specific comment
  .patch(updateComment); // Handler to update a specific comment

// Export the router instance for use in other parts of the application
export default router;
