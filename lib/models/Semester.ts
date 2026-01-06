import mongoose, { Schema, model, models } from "mongoose";

const SemesterSchema = new Schema(
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
    degreeId: {
      type: Schema.Types.ObjectId,
      ref: "Degree",
      required: true,
    },
  },
  { timestamps: true }
);

const Semester = models.Semester || model("Semester", SemesterSchema);

export default Semester;
