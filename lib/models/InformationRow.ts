import mongoose, { Schema, model, models } from "mongoose";

const InformationRowSchema = new Schema(
  {
    informationId: {
      type: Schema.Types.ObjectId,
      ref: "Information",
      required: true,
    },
    data: {
      type: Schema.Types.Mixed, // Flexible object to store any CSV row data
      required: true,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastEditedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate model compilation in dev with Hot Reload
if (process.env.NODE_ENV !== "production") {
  delete models.InformationRow;
}

const InformationRow = models.InformationRow || model("InformationRow", InformationRowSchema);

export default InformationRow;
