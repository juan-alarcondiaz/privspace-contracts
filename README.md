# PrivSpace Contracts
PrivSpace Contracts is a blockchain-based project aimed at providing secure and private data storage solutions using
smart contracts. It leverages Ethereum and the Hardhat development framework to enable the deployment and management of
privacy-focused storage modules. The project uses Hardhat Ignition for managing and deploying smart contract modules
seamlessly, ensuring flexibility and reliability in local and network environments.

## System requirements
- Node.js v22.13.1

## Local configuration and execution
1. Clone the repository
   ```bash
      git clone https://github.com/juan-alarcondiaz/privspace-contracts.git
      cd privspace-contracts

2. Start a local hardhat node
    ```shell
    npx hardhat node
    ```

3. Deploy the module using Ignition
    ```shell
    npx hardhat ignition deploy ignition/modules/PrivateInfoStorage.ts --network localhost
    ```
4. Smart contracts is available in [http://localhost:8545](http://localhost:8545) by default

## Related repositories
- [privspace-dapp](https://github.com/juan-alarcondiaz/privspace-dapp.git)