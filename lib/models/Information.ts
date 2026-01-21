import mongoose, { Schema, model, models } from "mongoose";

const InformationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    columns: {
      type: [String], // Array of column names from CSV
      required: true,
    },
    permissionMode: {
      type: String,
      enum: ["view-only", "editable", "edit-with-proof"],
      default: "view-only",
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Prevent duplicate model compilation in dev with Hot Reload
if (process.env.NODE_ENV !== "production") {
  delete models.Information;
}

const Information = models.Information || model("Information", InformationSchema);

export default Information;
