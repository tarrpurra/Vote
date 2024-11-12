# Decentralized Voting System
This project is a Decentralized Voting System that enables secure, transparent, and tamper-proof voting through blockchain technology.It consists of a React frontend and an Express/Node.js backend that work together to allow users to cast their votes safely.
<p>🚨 $${\color{red}Attention}$$ <b>This project  works well in the local machine and uses gas money when voting thus it try to simulate the transaction through Ganache.</b></p>
🚨 $${\color{red}Delete the Build folder}$$ 

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Running the Application](#running-the-application)
- [Built With](#built-with)
- [License](#license)

## Overview
This project will try to tackle some of the problems that can be faced during Voting online.
- Security: The system is built to prevent unauthorized access, ensuring that only eligible voters can participate and preventing tampering with vote records.
- Transparency: The blockchain’s public ledger allows for transparency, enabling anyone to verify the results without compromising voter privacy.
- Decentralization: By using a decentralized network, the system removes the need for a central authority, reducing the risk of corruption or manipulation.
- User-Friendly Interface: The system includes a React-based frontend to provide an intuitive and accessible voting experience

## Prerequisites

Make sure you have the following software installed on your machine:
- [Node.js and npm](https://nodejs.org/)- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/)
- [Ganache](https://trufflesuite.com/ganache/) (if you're using a local blockchain for testing)

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine:
```bash 
git clone https://github.com/tarrpurra/Vote.git
cd Vote
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
First of all before you try to vote you need to compile the contract using truffle also ganche is must as it provide enviroment and can provide transaction details also provide you with different accounts. In the project I have used ganche GUI but you can use CLI also.
- If using GUI one
  -Then download from the original website and when opened you will see it like this-
  ![Alt text](https://assets.digitalocean.com/articles/alligator/boo.svg "a title")
after this you can check the workspace that was created.
- If using ClI one
   - Use the command
     ```bash
       ganache-cli --a
     ```
- In the workspace you can see various dummy etherium wallets
    ![Alt text](https://assets.digitalocean.com/articles/alligator/boo.svg "a title")

-compile the contract using 
```bash
  truffle compile
```
after compiling you will get build folder 
```bash
  truffle migrate --network development
```
after running this you will get contract address.
you can paste the address in the components folder. In Voting_main.jsx.
     ![Alt text](https://assets.digitalocean.com/articles/alligator/boo.svg "a title")

  - install metaMask extension  for the transactions and also connect you metamask wallet to ganache wallet using the private key.In meta Mask click on account and click on import account and paste the private key in metamask and connenct it to your wallet. 
     ![Alt text](https://assets.digitalocean.com/articles/alligator/boo.svg "a title")
    
- Now you are ready to use the app for voting


## Built With

- Frontend: React, Tailwind CSS
- Backend: Node.js, Express, MongoDB
- Blockchain: Ethereum smart contracts, Ganache

## License

This project is licensed under the MIT License.
