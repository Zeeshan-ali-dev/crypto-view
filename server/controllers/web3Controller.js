const Txns = require("../models/txns");
const Metadata = require("../models/metadata");
const { formatResponse } = require("../utils/helpers");
const {
  fetchTokenURI,
  fetchMetadataFromURI,
  web3,
  fetchTransactions,
  fetchContractABI,
} = require("../utils/web3Helper");

const getNFTMetaData = async (req, res) => {
  const { contractAddress, tokenId } = req.body;

  if (!web3.utils.isAddress(contractAddress)) {
    return res
      .status(400)
      .json(formatResponse(false, "Invalid contract address"));
  }

  try {
    let metadata = await Metadata.findOne({ contractAddress, tokenId });

    if (!metadata) {
      const tokenURI = await fetchTokenURI(contractAddress, tokenId);
      const metadataJSON = await fetchMetadataFromURI(tokenURI);

      metadata = new Metadata({
        contractAddress,
        tokenId,
        name: metadataJSON.name,
        description: metadataJSON.description,
        image: metadataJSON.image,
      });
      await metadata.save();
    }

    res.status(200).json(
      formatResponse(true, "Success!", {
        contractAddress,
        tokenId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(formatResponse(false, error.message || "Failed to fetch metadata"));
  }
};

const getTransactions = async (req, res) => {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const transactions = await fetchTransactions(address);

    const savedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        const transaction = new Txns({
          address,
          hash: tx.hash,
          blockNumber: tx.blockNumber,
          timeStamp: new Date(tx.timeStamp * 1000),
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasUsed: tx.gasUsed,
        });
        return transaction.save();
      })
    );

    res.status(200).json(
      formatResponse(true, "Success!", {
        transactions: savedTransactions,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        formatResponse(
          false,
          error.message || "Failed to fetch and store transactions"
        )
      );
  }
};

const getTokenBalance = async (req, res) => {
  const { tokenAddress, walletAddress } = req.body;

  if (
    !web3.utils.isAddress(tokenAddress) ||
    !web3.utils.isAddress(walletAddress)
  ) {
    return res.status(400).json({ error: "Invalid token or wallet address" });
  }

  try {
    const contractAbi = await fetchContractABI(tokenAddress);
    const tokenContract = new web3.eth.Contract(contractAbi, tokenAddress);

    const [rawBalance, decimals] = await Promise.all([
      tokenContract.methods.balanceOf(walletAddress).call(),
      tokenContract.methods.decimals().call(),
    ]);

    let balance = 0;

    if (rawBalance > 0) {
      balance = Number(rawBalance) / 10 ** Number(decimals);
    }

    res.status(200).json(
      formatResponse(true, "Success!", {
        walletAddress,
        tokenAddress,
        balance,
      })
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        formatResponse(
          false,
          error.message || "Failed to retrieve token balance"
        )
      );
  }
};

const fetchTransactionsByDate = async (req, res) => {
  const { address, startDate, endDate } = req.query;

  if (!address) {
    return res
      .status(500)
      .json(formatResponse(false, error.message || "Address is required"));
  }

  try {
    const query = { address };

    if (startDate || endDate) {
      query.timeStamp = {};
      if (startDate) query.timeStamp.$gte = new Date(startDate);
      if (endDate) {
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
        query.timeStamp.$lte = adjustedEndDate;
      }
    }
    const transactions = await Txns.find(query);
    res.status(200).json(formatResponse(true, "Success!", transactions));
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json(
        formatResponse(false, error.message || "Failed to fetch transactions")
      );
  }
};

module.exports = {
  getNFTMetaData,
  getTransactions,
  getTokenBalance,
  fetchTransactionsByDate,
};
