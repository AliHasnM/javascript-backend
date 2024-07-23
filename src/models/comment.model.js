import mongoose, { Schema, plugin } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the schema for comments
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Applying the pagination plugin to the schema
commentSchema.plugin(mongooseAggregatePaginate);

// Creating and exporting the Comment model
export const Comment = mongoose.model("Comment", commentSchema);
