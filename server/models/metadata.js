const mongoose = require("mongoose");

const MetadataSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
    name: String,
    description: String,
    image: String,
  },
  { timestamps: true }
);

const Metadata = mongoose.model("Metadata", MetadataSchema);

module.exports = Metadata;
