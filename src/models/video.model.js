import mongoose, { Schema, plugin } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Defining the schema for the video collection
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    view: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  },
);

// Applying the pagination plugin to the schema
videoSchema.plugin(mongooseAggregatePaginate);

// Creating and exporting the Video model
export const Video = mongoose.model("Video", videoSchema);
