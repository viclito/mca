import mongoose, { Schema, model, models } from "mongoose";

const SubjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    semesterId: {
      type: Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
  },
  { timestamps: true }
);

const Subject = models.Subject || model("Subject", SubjectSchema);

export default Subject;
