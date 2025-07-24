import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x76a607429bb5290e6c1ca1fad2e00fa8c2f913df'
const ABI = [
  "function submitScore(address user, uint256 score) external",
  "function userScores(address) view returns (uint256)",
  "event UserEligible(address indexed user)"
]

export async function submitScore(userAddress: string | undefined, score: number): Promise<boolean> {
  if (!userAddress) return false
  
  try {
    // This would typically connect to user's wallet
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
      
      const tx = await contract.submitScore(userAddress, score)
      await tx.wait()
      
      return true
    }
    return false
  } catch (error) {
    console.error('Error submitting score:', error)
    return false
  }
}

export async function checkIfClaimed(_userAddress: string): Promise<boolean> {
  try {
    // This would check if user has already claimed MON
    // For now, returning false as placeholder
    return false
  } catch (error) {
    console.error('Error checking claim status:', error)
    return false
  }
}