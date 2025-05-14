HELLO EVERYONE!
# Ethereum ToDo List - Blockchain Application

A decentralized todo list application built on the Ethereum blockchain. This project demonstrates how to build a basic dApp (decentralized application) using Solidity smart contracts and a web-based frontend.

## 📝 Project Overview

This project implements a simple todo list that allows users to:
- Create new tasks
- Mark tasks as completed
- View all tasks and their completion status

All data is stored on the Ethereum blockchain, making it transparent, immutable, and decentralized.

## 🔧 Technologies Used

- **Blockchain**:
  - Solidity ^0.8.0 (Smart Contract Language)
  - Truffle (Development Framework)
  - Ganache (Local Blockchain)
  
- **Frontend**:
  - HTML/CSS
  - JavaScript
  - jQuery
  - Web3.js (Ethereum JavaScript API)
  - MetaMask (Ethereum Wallet)

## 📋 Prerequisites

Before running this project, you should have the following installed:

- [Node.js](https://nodejs.org/) and npm
- [Truffle](https://www.trufflesuite.com/truffle) (`npm install -g truffle`)
- [Ganache](https://www.trufflesuite.com/ganache) - Personal Ethereum blockchain
- [MetaMask](https://metamask.io/) - Browser extension for interacting with Ethereum

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/akshat16206/eth-to-do-list.git
cd eth-to-do-list.git
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Ganache
Launch Ganache and create a new workspace (or use an existing one).

### 4. Configure MetaMask
- Connect MetaMask to your Ganache blockchain (usually http://localhost:7545)
- Import an account from Ganache to MetaMask using the private key

### 5. Compile and deploy smart contracts
```bash
truffle compile
truffle migrate --reset
```

### 6. Start the application
```bash
npm run dev
```

### 7. Access the application
Open your browser and navigate to `http://localhost:3000`

## 🔍 Project Structure

```
ethereum-todo-list/
├── contracts/                # Smart contracts
│   ├── Migrations.sol
│   └── TodoList.sol
├── migrations/               # Deployment scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── src/                      # Frontend application
│   ├── app.js                # Application logic
│   └── index.html            # User interface
├── test/                     # Test scripts
│   └── todolist.test.js
├── truffle-config.js         # Truffle configuration
└── package.json              # Project dependencies
```

## 🧪 Testing

To run the tests for the smart contracts:

```bash
truffle test
```

## 📱 Usage

1. Connect to the application with MetaMask
2. Create a new task by typing in the input field and pressing Enter
3. Check the checkbox next to a task to mark it as completed
4. The tasks will be stored on the blockchain and persist across sessions

## 👨‍💻 Contributors

- **Aditi Agrawal**
- **Akshat Gupta**

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgements

- This project was inspired by [Dapp University](https://www.dappuniversity.com/)
- Special thanks to all contributors and the Ethereum community

## 📝 Notes

- This is a prototype/educational application and may not be suitable for production use
- Gas costs will be incurred for each transaction on the real Ethereum network
- The user interface is optimized for desktop browsers with MetaMask installed
