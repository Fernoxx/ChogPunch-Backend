// /eventHandler.js
import { getLogs, parseEventLog, http, createPublicClient, createWalletClient, formatEther, parseEther } from "viem"
import { base } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import { createClient } from "@supabase/supabase-js"
import chogpunchAbi from "./abi/chogpunchAbi.json" assert { type: "json" }

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
const PRIVATE_KEY = process.env.MONAD_PRIVATE_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const account = privateKeyToAccount(PRIVATE_KEY)

const publicClient = createPublicClient({
  chain: base,
  transport: http(ALCHEMY_RPC_URL),
})

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(ALCHEMY_RPC_URL),
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const POLL_INTERVAL_MS = 15000
let lastBlockChecked = 0

export async function pollEvents() {
  try {
    const latestBlock = await publicClient.getBlockNumber()

    if (lastBlockChecked === 0) {
      lastBlockChecked = latestBlock - 500n
    }

    const logs = await getLogs(publicClient, {
      address: CONTRACT_ADDRESS,
      fromBlock: lastBlockChecked,
      toBlock: latestBlock,
      event: {
        type: "event",
        name: "UserEligible",
        inputs: [
          { indexed: true, internalType: "address", name: "user", type: "address" },
        ],
        anonymous: false,
      },
    })

    for (const log of logs) {
      const { args } = parseEventLog({ abi: chogpunchAbi, ...log })
      const userAddress = args.user.toLowerCase()

      const { data: existingClaim } = await supabase
        .from("chog_claims")
        .select("wallet")
        .eq("wallet", userAddress)
        .maybeSingle()

      if (!existingClaim) {
        console.log(`🥊 Eligible user detected: ${userAddress}`)

        // Replace with actual MONAD tx logic (stub below)
        const monTx = await sendMonToUser(userAddress)

        if (monTx) {
          await supabase.from("chog_claims").insert([
            {
              wallet: userAddress,
              claimed_at: new Date().toISOString(),
              tx_hash: monTx,
            },
          ])
          console.log(`✅ MON sent and claim saved: ${monTx}`)
        } else {
          console.log(`❌ Failed to send MON to ${userAddress}`)
        }
      } else {
        console.log(`⏩ User already claimed: ${userAddress}`)
      }
    }

    lastBlockChecked = latestBlock
  } catch (err) {
    console.error("❌ Error polling events:", err)
  }
}

async function sendMonToUser(toAddress) {
  try {
    // ⚠️ Replace with real Monad testnet transfer logic here
    // For now just simulate tx hash
    console.log(`💸 Simulating MON transfer to ${toAddress}...`)
    return `0xmocktx_${toAddress.slice(2, 8)}`
  } catch (err) {
    console.error("❌ Error sending MON:", err)
    return null
  }
}
