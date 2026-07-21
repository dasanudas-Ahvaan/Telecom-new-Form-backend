const mongoose = require("mongoose");

const VolunteerProgramResponseSchema = new mongoose.Schema(
  {
    programId: {
      type: String,
      required: true,
    },

    version: {
      type: Number,
    //   required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    agreed: {
      type: Boolean,
      required: true,
      default: false,
    },

    agreedAt: {
      type: Date,
    //   required: true,
    },

    termsPdfUrl: {
      type: String,
    },

    termsPdfHash: {
      type: String,
    },

    // questions: [
    //   {
    //     id: String,
    //     label: String,
    //     type: String,
    //     options: [String],
    //   },
    // ],

    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

module.exports = { VolunteerProgramResponseSchema };
