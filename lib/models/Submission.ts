import mongoose, { Schema, model, models } from "mongoose";

const SubmissionSchema = new Schema(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true, 
    },
    responses: {
      type: Map,
      of: Schema.Types.Mixed, // flexible storage for different input types
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a student can only submit once per form? 
// The prompt didn't strictly say so, but usually yes. 
// making compound index for uniqueness
SubmissionSchema.index({ formId: 1, studentId: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production") delete models.Submission;

const Submission = models.Submission || model("Submission", SubmissionSchema);

export default Submission;
