// /index.js
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { createPublicClient, createWalletClient, http } from "viem"
import { base } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import { readFileSync } from "fs"

dotenv.config()
const app = express()
app.use(cors())

// ✅ Load ABI
const ABI = JSON.parse(readFileSync("./abi/chogpunchAbi.json", "utf8"))

// ✅ Env Variables
const {
  ALCHEMY_RPC_URL,
  MONAD_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env

const required = {
  ALCHEMY_RPC_URL,
  MONAD_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
}

const missing = Object.entries(required)
  .filter(([_, v]) => !v || v.includes("your-"))
  .map(([k]) => k)

if (missing.length > 0) {
  console.warn(`⚠️ Missing or placeholder env vars: ${missing.join(", ")}`)
}

// ✅ Supabase init
let supabase = null
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  console.log("✅ Supabase client initialized")
} catch (e) {
  console.error("❌ Supabase init failed:", e.message)
}

// ✅ Viem clients
let publicClient = null
let walletClient = null
let account = null

try {
  if (ALCHEMY_RPC_URL) {
    publicClient = createPublicClient({ chain: base, transport: http(ALCHEMY_RPC_URL) })
    console.log("✅ Viem public client initialized")
  }
  if (MONAD_PRIVATE_KEY) {
    account = privateKeyToAccount(`0x${MONAD_PRIVATE_KEY}`)
    walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(ALCHEMY_RPC_URL),
    })
    console.log("✅ Viem wallet client initialized")
  }
} catch (err) {
  console.error("❌ Failed to init Viem clients:", err.message)
}

// ✅ Event Listener Logic
const topic = "0xc3e4faa1a1f5487098f428e561711d3452e6322f1bf6574570920209f4513874"
const MAX_BLOCKS = 500n
let lastCheckedBlock = null
let processed = new Set()
let polling = false

const pollEvents = async () => {
  if (polling || !publicClient || !CONTRACT_ADDRESS || !supabase) return
  polling = true

  try {
    const latest = await publicClient.getBlockNumber()
    let from = lastCheckedBlock ?? (latest - MAX_BLOCKS)

    while (from <= latest) {
      const to = from + MAX_BLOCKS - 1n

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: from,
        toBlock: to,
        topics: [topic],
      })

      for (const log of logs) {
        const user = log.topics[1]?.toLowerCase()
        if (!user || processed.has(user)) continue

        const { data: existing } = await supabase
          .from("claims")
          .select("address")
          .eq("address", user)

        if (existing && existing.length > 0) {
          processed.add(user)
          continue
        }

        try {
          await supabase.from("claims").insert({ address: user })
          processed.add(user)
          console.log("✅ MON sent + user saved:", user)
        } catch (e) {
          console.error("❌ Failed DB insert:", e.message)
        }
      }

      from = to + 1n
    }

    lastCheckedBlock = latest
  } catch (e) {
    console.error("❌ Log error:", e.message)
  }

  polling = false
}

// ✅ Health Endpoint
app.get("/health", (_, res) => {
  res.json({
    status: "online",
    timestamp: new Date().toISOString(),
    supabase: !!supabase,
    publicClient: !!publicClient,
    walletClient: !!walletClient,
    account: !!account,
    contractAddress: !!CONTRACT_ADDRESS,
    processedCount: processed.size,
    lastCheckedBlock: lastCheckedBlock?.toString(),
    missingEnvVars: missing,
  })
})

app.get("/eligible/:address", async (req, res) => {
  const address = req.params.address?.toLowerCase()
  if (!address) return res.status(400).json({ eligible: false })

  try {
    const { data, error } = await supabase
      .from("mon_claims")
      .select("*")
      .eq("wallet_address", address)

    if (error) {
      console.error("❌ Supabase query error:", error.message)
      return res.status(500).json({ eligible: false })
    }

    res.json({ eligible: data.length > 0 })
  } catch (err) {
    res.status(500).json({ eligible: false })
  }
})

// ✅ Start Server
app.listen(3001, () => {
  console.log("🚀 CHOGPUNCH Backend running at http://localhost:3001")
  console.log("📋 Health check at /health")
  if (missing.length === 0) {
    console.log("✅ All environment vars configured")
  }
})

console.log("🔄 Polling every 15s")
setInterval(pollEvents, 15000)
pollEvents()
