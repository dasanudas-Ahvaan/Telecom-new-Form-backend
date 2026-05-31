const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["text", "textarea", "options", "number"],
    },

    options: {
      type: [String],
      default: [],
    },

    required: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const VolunteerProgramSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
      // required: true,
      default: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    pdfHash: {
      type: String,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },

    questions: [QuestionSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("VolunteerProgram", VolunteerProgramSchema);
