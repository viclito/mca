import mongoose, { Schema, model, models } from "mongoose";

const DegreeSchema = new Schema(
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
  },
  { timestamps: true }
);

const Degree = models.Degree || model("Degree", DegreeSchema);

export default Degree;
