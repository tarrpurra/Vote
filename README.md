# Decentralized Voting System

This project is a Decentralized Voting System that enables secure, transparent, and tamper-proof voting through blockchain technology.It consists of a React frontend and an Express/Node.js backend that work together to allow users to cast their votes safely.

<p>🚨 $${\color{red}Attention}$$ <b>This project  uses hardhat to compile the contract and uses hardhat for deployment.</b></p>
<p>🚨 $${\color{red}Delete}$$ <b> If you want to use the project delete the deployment folder and re-deploy with your favourite testnet or use Onchain block chain. </b> </p>

## Table of Contents

- [Decentralized Voting System](#decentralized-voting-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Backend Setup](#2-backend-setup)
    - [3. Frontend Setup](#3-frontend-setup)
  - [Running the Application](#running-the-application)
    - [Setting up hardhat](#setting-up-hardhat)
    - [Contract Deployment with Hardhat](#contract-deployment-with-hardhat)
    - [Setting up MetaMask](#setting-up-metamask)
    - [Running the Application](#running-the-application-1)
  - [Built With](#built-with)
  - [License](#license)
  - [LAST NOTES](#last-notes)

## Overview

This project will try to tackle some of the problems that can be faced during Voting online.

- Security: The system is built to prevent unauthorized access, ensuring that only eligible voters can participate and preventing tampering with vote records.
- Transparency: The blockchain's public ledger allows for transparency, enabling anyone to verify the results without compromising voter privacy.
- Decentralization: By using a decentralized network, the system removes the need for a central authority, reducing the risk of corruption or manipulation.
- User-Friendly Interface: The system includes a React-based frontend to provide an intuitive and accessible voting experience

## Prerequisites

Make sure you have the following software installed on your machine:

- [Node.js and npm](https://nodejs.org/)- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/)
- [hardhat](https://hardhat.org/)

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/tarrpurra/Vote.git
```

### 2. Backend Setup

<p>
The backend uses express and nodejs and is connected to MongoDB for the login page and download all the dependencies
create your .env file in where you can insert your MongoDB connection key. create the .env file inside the backend folder only.
</p>

```bash
  cd backend
  npm install
  npm run dev
```

use npm run dev to run the backend

### 3. Frontend Setup

The Frontend uses React and the its components uses different libraries.Open new terminal for running frontend part.

```bash
  cd frontend
  npm install
  npm run dev
```

use npm run dev to run the frontend

## Running the Application

First of all before you try to vote you need to compile and deploy the contract using Hardhat. Hardhat can be used to deploy and run the contract.

### Setting up hardhat

Hardhat will be install and you need to run some commands before runing for voting.

### Contract Deployment with Hardhat

1. Navigate to the voteContract directory:

```bash
cd voteContract
```

2. Install dependencies:

```bash
npm install
```

3. Compile the smart contracts:

```bash
npx hardhat clean
npx hardhat compile
```

4. If you want to deploy on localhost use this command

```bash
npx hardhat igniton deploy ./ignition/modules/votingsystem.js  --network localhost
```

if you want to deploy on custom network
go to the <b>hardhat-config file and add the custom network also add your wallet private address for contract deployment.
![Front](https://github.com/tarrpurra/Vote/blob/main/images/hardhat-deployment.png "frontend")

5. After deployment, you will get the contract address. Copy this address and update it in the frontend:

   - Open `frontend/src/components/contract_connection.jsx`
   - Replace the `CONTRACT_ADDRESS` constant with your deployed contract address:

   ```javascript
   const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

6. If you want to use hardhat localnetwork wallet then run:
   ```bash
   npx hardhat node
   ```
7. Update the abi.json file if necessary

### Setting up MetaMask

- Install MetaMask extension for the transactions
- Connect your MetaMask wallet to hardhat node using the private key provided by the hardhat node.
- In MetaMask, click on account and click on import account and paste the private key from hardhat node.
- Connect it to your wallet

### Running the Application

- Now you are ready to use the app for voting
- Now you can create new poll also.
- Result Photos
  ![Front](https://github.com/tarrpurra/Vote/blob/main/images/front1.png "frontend")
  <b> Can create new polls add options remove options for the poll also add whitelist which wallet can only vote and also can adjust the timer also.</b>
  ![Front](https://github.com/tarrpurra/Vote/blob/main/images/front2.png "frontend")
  <b>Register for the vote and provide an ID</b>
  ![Front](https://github.com/tarrpurra/Vote/blob/main/images/front3.png "frontend")
  <b>After register user can see all the live polls and can choose the poll they want and give there vote</b>
  ![Front](https://github.com/tarrpurra/Vote/blob/main/images/front4.png "frontend")

## Built With

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Blockchain: Ethereum smart contracts, hardhat

## License

This project is licensed under the MIT License.

## LAST NOTES

The project needs more work like user face detection with the type of the Identification card.

```

```
