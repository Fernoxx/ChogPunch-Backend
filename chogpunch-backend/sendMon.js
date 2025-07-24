import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC)
const signer = new ethers.Wallet(process.env.MONAD_PRIVATE_KEY, provider)

export async function sendMon(address) {
  try {
    const tx = await signer.sendTransaction({
      to: address,
      value: ethers.parseEther('1')
    })
    await tx.wait()
    return { success: true, txHash: tx.hash }
  } catch (e) {
    console.error('MON SEND FAILED:', e.message)
    return { success: false }
  }
}