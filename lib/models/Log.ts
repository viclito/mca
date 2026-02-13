import mongoose, { Schema, model, models } from "mongoose";

const LogSchema = new Schema(
  {
    level: {
      type: String,
      enum: ["INFO", "WARN", "ERROR"],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "SYSTEM",
      index: true,
    },
    details: {
      type: Schema.Types.Mixed, // Can store any JSON object
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    context: {
      path: String,
      method: String,
      ip: String,
      userAgent: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    // Use a capped collection to automatically remove old logs if size exceeds limit (e.g., 500MB)
    // capped: { size: 524288000 }, 
    // Note: Capped collections cannot be easily created via Mongoose schema options if the collection already exists as uncapped.
    // For now, we'll use a standard collection and manually manage or set up TTL index later if needed.
    // A TTL index is generally more flexible for log retention than capped collections.
  }
);

// TTL Index: Automatically expire logs after 30 days
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Prevent duplicate model compilation in dev with Hot Reload
if (process.env.NODE_ENV !== "production") {
    delete models.Log;
}

const Log = models.Log || model("Log", LogSchema);

export default Log;
