// Module for handling monetary transactions
require('dotenv').config();
const { ethers } = require('ethers');

// Initialize provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Function to send money/tokens
async function sendMoney(toAddress, amount) {
    try {
        console.log(`Sending ${amount} to ${toAddress}`);
        
        // Create transaction
        const tx = {
            to: toAddress,
            value: ethers.parseEther(amount.toString())
        };
        
        // Send transaction
        const transaction = await wallet.sendTransaction(tx);
        console.log('Transaction sent:', transaction.hash);
        
        // Wait for confirmation
        const receipt = await transaction.wait();
        console.log('Transaction confirmed:', receipt.hash);
        
        return receipt;
    } catch (error) {
        console.error('Error sending money:', error);
        throw error;
    }
}

module.exports = {
    sendMoney
};