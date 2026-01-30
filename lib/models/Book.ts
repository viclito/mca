import mongoose, { Schema, model, models } from "mongoose";

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String, // Google Drive Link (PDF)
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true }
);

const Book = models.Book || model("Book", BookSchema);

export default Book;
