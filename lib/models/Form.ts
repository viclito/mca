import mongoose, { Schema, model, models } from "mongoose";

const FormSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fields: [
      {
        id: { type: String, required: true }, // unique id for the field
        label: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "number", "textarea", "select", "file", "date"],
          required: true,
        },
        placeholder: String,
        required: { type: Boolean, default: false },
        options: [String], // for select/dropdown
      },
    ],
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") delete models.Form;

const Form = models.Form || model("Form", FormSchema);

export default Form;
