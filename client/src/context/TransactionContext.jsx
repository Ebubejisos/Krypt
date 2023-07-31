/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  contractABI,
  contractAddress,
  contractBytecode,
} from "../utils/constants";

// exporting the react contexts, here we have only one context which will pass variables across components;
export const TransactionContext = React.createContext();

// Metamask provides ethereum object (window.ethereum) which will contain our addresses and our smart contract
const { ethereum } = window;

const getEthereumContract = async () => {
  try {
    // fetching our verified contract abi from etherscan
    const response = await fetch(
      "https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=0xe96199E3985d61Fc464CDcdD66C38b58A3A758b4&apikey=YourApiKeyToken",
    );
    const data = await response.json();
    const abi = data.result;

    const provider = new ethers.JsonRpcProvider(
      "https://rpc.notadegen.com/sepolia",
    );
    // only while using Wallet as contract runner was I able to interact with the smartt contract
    const wallet = new ethers.Wallet(
      "014d48a975ccf83a8a99107284b54d3367b2fb30896127a8351635be69fc78fd",
      provider,
    );
    // returns our smart contract as an object using ethers ;
    const transactionContract = new ethers.Contract(
      contractAddress,
      abi,
      wallet,
    );
    /*let count = await transactionContract.getTransactionCount();
    const readableCount = count.toString();*/
    return transactionContract;
  } catch (error) {
    console.log(error);
  }
};
// exporting context container for the App or target parent component
export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount"),
  );
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: 0,
    keyword: "",
    message: "",
  });

  const checkIfWalletIsConnected = async () => {
    try {
      // checks if the metamask etheruem object is available, i.e if metamask is installed
      if (!ethereum) return alert("Please, install metamask");
      // returns an array of connected accounts
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        // at the start of every render we are going to get access to our account through the useEffect
        setCurrentAccount(accounts[0]);
        console.log(accounts);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please, install metamask");
      // get all the accounts and in particular the one user connected accounts
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
      throw new Error("Problem connecting to wallet");
    }
  };

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please, install metamask");
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = await getEthereumContract();
      console.log(transactionContract);
      // converts the user input into BigNumber Ethereum
      const parsedAmount = ethers.parseEther(amount);
      // coverts BigNumber ETH into hex value
      const hexString = ethers.toBeHex(parsedAmount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 2100Gwei; gas fee SI unit
            value: hexString, // user input in hexadecimal
          },
        ],
      });

      // adds transaction to block chain using our smart contract and returns a transaction hash or Id
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword,
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);
    } catch (error) {
      console.error(error);
    }
  };

  const shortenAddress = (address) =>
    `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
        shortenAddress,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
