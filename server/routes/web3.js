const express = require("express");
const {
  getNFTMetaData,
  getTransactions,
  getTokenBalance,
} = require("../controllers/web3Controller");

const web3Router = express.Router();

web3Router.get("/get-transactions/:address", getTransactions);
web3Router.post("/get-nft-metadata", getNFTMetaData);
web3Router.post("/get-token-balance/", getTokenBalance);

module.exports = { web3Router };
