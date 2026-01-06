import mongoose, { Schema, model, models } from "mongoose";

const UnitSchema = new Schema(
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
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true }
);

const Unit = models.Unit || model("Unit", UnitSchema);

export default Unit;
