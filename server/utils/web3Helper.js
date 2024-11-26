const { Web3 } = require("web3");
const dotenv = require("dotenv");
const { polygonKey } = require("../config/constants");
dotenv.config();
const web3 = new Web3(
  `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_URL}`
);

const fetchTokenURI = async (contractAddress, tokenId) => {
  const abi = await fetchContractABI(contractAddress);
  const contract = new web3.eth.Contract(abi, contractAddress);
  return await contract.methods.tokenURI(tokenId).call();
};

const fetchMetadataFromURI = async (uri) => {
  if (uri.startsWith("ipfs://")) {
    uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  const response = await fetch(uri);
  return await response.json();
};

const fetchTransactions = async (address) => {
  const url = `https://api.polygonscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${polygonKey}`;
  const data = await fetch(url);
  const response = await data.json();
  if (response.status === "1" && response.result) {
    return response.result;
  }
  throw new Error("Failed to fetch transactions");
};

const fetchContractABI = async (contractAddress) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const url = `https://api.polygonscan.com/api?module=contract&action=getabi&address=${contractAddress}&apikey=${polygonKey}`;

  try {
    const data = await fetch(url);
    const response = await data.json();

    if (response.status === "1" && response.result) {
      const abi = JSON.parse(response.result);
      return abi;
    } else {
      throw new Error(`Failed to fetch ABI: ${response.message}`);
    }
  } catch (error) {
    console.error(`Error fetching contract ABI: ${error.message}`);
    throw error;
  }
};

module.exports = {
  web3,
  fetchTokenURI,
  fetchMetadataFromURI,
  fetchTransactions,
  fetchContractABI,
};
