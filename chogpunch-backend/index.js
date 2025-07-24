import { ethers } from 'ethers'
import { supabase } from './supabaseClient.js'
import { sendMon } from './sendMon.js'
import dotenv from 'dotenv'
dotenv.config()

const abi = ["event UserEligible(address indexed user)"]
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC)
const contract = new ethers.Contract(process.env.BASE_CONTRACT_ADDRESS, abi, provider)

let lastScannedBlock = 0

async function pollEvents() {
  try {
    const latestBlock = await provider.getBlockNumber()

    if (lastScannedBlock === 0) {
      lastScannedBlock = latestBlock
      return
    }

    for (let b = lastScannedBlock + 1; b <= latestBlock; b++) {
      const logs = await contract.queryFilter("UserEligible", b, b)

      for (let log of logs) {
        const user = log.args.user

        const { data: exists } = await supabase
          .from("mon_claims")
          .select("*")
          .eq("wallet_address", user)
          .single()

        if (exists) continue

        const { success, txHash } = await sendMon(user)

        if (success) {
          await supabase.from("mon_claims").insert({
            wallet_address: user,
            claimed: true
          })
          console.log(`✅ Sent 1 MON to ${user}, tx: ${txHash}`)
        } else {
          console.log(`❌ Failed to send MON to ${user}`)
        }
      }
    }

    lastScannedBlock = latestBlock
  } catch (err) {
    console.error("Polling error:", err.message)
  }
}

setInterval(pollEvents, 10000)