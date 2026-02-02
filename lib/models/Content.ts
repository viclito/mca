import mongoose, { Schema, model, models } from "mongoose";

const ContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "pdf", "note"],
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

// Force delete model in development to enable schema changes to take effect
if (process.env.NODE_ENV === "development" && models.Content) {
  delete models.Content;
}

const Content = models.Content || model("Content", ContentSchema);

export default Content;
