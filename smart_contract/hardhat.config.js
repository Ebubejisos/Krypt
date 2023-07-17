//  https://eth-sepolia.g.alchemy.com/v2/OUzbcGptYo-wLlubx-X-w2X2WZCShwpC

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/OUzbcGptYo-wLlubx-X-w2X2WZCShwpC",
      accounts: ["014d48a975ccf83a8a99107284b54d3367b2fb30896127a8351635be69fc78fd"]
    }
  }
}