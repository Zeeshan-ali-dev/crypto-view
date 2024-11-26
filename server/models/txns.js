const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    hash: { type: String, required: true },
    blockNumber: String,
    timeStamp: Date,
    from: String,
    to: String,
    value: String,
    gasUsed: String,
  },
  { timestamps: true }
);

const Txns = mongoose.model("Txns", TransactionSchema);

module.exports = Txns;
