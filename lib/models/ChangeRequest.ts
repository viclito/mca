import mongoose, { Schema, model, models } from "mongoose";

const ChangeRequestSchema = new Schema(
  {
    informationId: {
      type: Schema.Types.ObjectId,
      ref: "Information",
      required: true,
    },
    rowId: {
      type: Schema.Types.ObjectId,
      ref: "InformationRow",
      required: true,
    },
    proposedChanges: {
      type: Schema.Types.Mixed, // Object containing the proposed changes
      required: true,
    },
    proofImages: {
      type: [String], // Array of image URLs
      default: [],
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Prevent duplicate model compilation in dev with Hot Reload
if (process.env.NODE_ENV !== "production") {
  delete models.ChangeRequest;
}

const ChangeRequest = models.ChangeRequest || model("ChangeRequest", ChangeRequestSchema);

export default ChangeRequest;
