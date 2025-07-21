"use strict";

// key dmdb install by Mongo Snippets for Node-js

const { model, Schema, default: mongoose } = require("mongoose");

const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

// Declare the Schema of the Mongo model
const ApikeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000", "1111", "2222"],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.models[DOCUMENT_NAME] || model(DOCUMENT_NAME, ApikeySchema);
