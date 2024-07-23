import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this file to ensure the user is authenticated
router.use(verifyJWT);

// Define routes for videos
// Route for getting all videos and publishing a new video
router
  .route("/")
  .get(getAllVideos) // Fetch all videos
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo, // Publish a new video
  );

// Route for operations on a specific video (get, delete, update)
router
  .route("/:videoId")
  .get(getVideoById) // Fetch a video by its ID
  .delete(deleteVideo) // Delete a video by its ID
  .patch(upload.single("thumbnail"), updateVideo); // Update a video by its ID

// Route for toggling the publish status of a video
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
