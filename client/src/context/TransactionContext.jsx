/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

// exporting the react contexts, here we have only one context which will pass variables across components;
export const TransactionContext = React.createContext();

// Metamask provides ethereum object (window.ethereum) which will contain our addresses and our smart contract
const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  // returns our smart contract as an object using metamask and ethers ;
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer,
  );
  console.log(transactionContract);
  // return transactionContract;
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
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parse(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //amount in hexadecimal is equivalent to 2100Gwei a subunit of ether
            value: parsedAmount._hex, //amount provided in the input field
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

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.error(error);
      throw new Error("Problem connecting to wallet");
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
