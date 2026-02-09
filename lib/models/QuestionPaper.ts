import mongoose, { Schema, model, models } from "mongoose";

const QuestionPaperSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true, // e.g. "Apr 2023"
    },
    link: {
      type: String, // Google Drive PDF Link
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

const QuestionPaper = models.QuestionPaper || model("QuestionPaper", QuestionPaperSchema);

export default QuestionPaper;
