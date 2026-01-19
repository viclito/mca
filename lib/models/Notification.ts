import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["exam", "fees", "general", "seminar", "viva"],
      default: "general",
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    timetable: [
      {
        date: String,
        subject: String,
        time: String,
      },
    ],
    link: {
      type: String, // Optional URL for PDF or external link
    },
    image: {
      type: String, // Optional URL for Image
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate model compilation in dev with Hot Reload
if (process.env.NODE_ENV !== "production") {
    delete models.Notification;
}

const Notification = models.Notification || model("Notification", NotificationSchema);

export default Notification;
