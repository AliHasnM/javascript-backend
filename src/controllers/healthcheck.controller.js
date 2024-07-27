import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  // Build a healthcheck response that simply returns the OK status as JSON with a message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Service is up and running"));
});

export { healthcheck };