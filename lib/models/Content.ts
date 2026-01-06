import mongoose, { Schema, model, models } from "mongoose";

const ContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "pdf"],
      required: true,
    },
    url: {
      type: String, // Google Drive Link
      required: true,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
  },
  { timestamps: true }
);

const Content = models.Content || model("Content", ContentSchema);

export default Content;
