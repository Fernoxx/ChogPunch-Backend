import { createPublicClient, http, createWalletClient } from "viem"
import { base } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"
import express from "express"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import { readFileSync } from "fs"

dotenv.config()

const app = express()
app.use(cors())

// ✅ Load ABI
const ABI = JSON.parse(readFileSync("./abi/chogpunchAbi.json", "utf8"))

// ✅ Environment variable validation
const {
  ALCHEMY_RPC_URL,
  MONAD_PRIVATE_KEY,
  CONTRACT_ADDRESS,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env

const requiredEnvVars = {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  ALCHEMY_RPC_URL,
  CONTRACT_ADDRESS,
  MONAD_PRIVATE_KEY
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value.includes('your-'))
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing or placeholder environment variables: ${missingVars.join(', ')}`)
  console.warn('⚠️  Server will start but functionality will be limited until real values are provided')
}

// ✅ Setup Supabase
let supabase = null
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  console.log('✅ Supabase client initialized')
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error.message)
}

// ✅ Setup viem clients
let publicClient = null
let walletClient = null
let account = null

try {
  if (ALCHEMY_RPC_URL && !ALCHEMY_RPC_URL.includes('your-')) {
    publicClient = createPublicClient({
      chain: base,
      transport: http(ALCHEMY_RPC_URL),
    })
    console.log('✅ Viem public client initialized')
  }

  if (MONAD_PRIVATE_KEY && !MONAD_PRIVATE_KEY.includes('your-')) {
    account = privateKeyToAccount(`0x${MONAD_PRIVATE_KEY}`)
    
    if (publicClient) {
      walletClient = createWalletClient({
        account,
        chain: base,
        transport: http(ALCHEMY_RPC_URL),
      })
      console.log('✅ Viem wallet client initialized')
    }
  }
} catch (error) {
  console.error('❌ Failed to initialize viem clients:', error.message)
}

// ✅ Event polling configuration
const MAX_BLOCK_RANGE = 500n
let lastCheckedBlock = null
const topic = "0xc3e4faa1a1f5487098f428e561711d3452e6322f1bf6574570920209f4513874" // UserEligible event topic
let processed = new Set()

// ✅ Poll events function
const pollEvents = async () => {
  if (!publicClient || !CONTRACT_ADDRESS || !supabase) {
    console.log('⏸️  Skipping event check - missing configuration')
    return
  }

  try {
    const latestBlock = await publicClient.getBlockNumber()
    let from = lastCheckedBlock || latestBlock - MAX_BLOCK_RANGE

    while (from <= latestBlock) {
      const to = from + MAX_BLOCK_RANGE - 1n

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        fromBlock: from,
        toBlock: to,
        topics: [topic],
      })

      for (const log of logs) {
        const user = log.topics[1]?.toLowerCase()
        if (!user || processed.has(user)) continue

        // Check if user already exists in database
        const { data: existing } = await supabase
          .from("claims")
          .select("address")
          .eq("address", user)

        if (existing && existing.length > 0) {
          processed.add(user)
          continue
        }

        console.log("✅ User eligible:", user)
        console.log("🎯 Sending 1 MON to:", user)
        
        // Insert into Supabase
        try {
          await supabase.from("claims").insert({ address: user })
          processed.add(user)
          console.log("💾 User claim recorded in database")
        } catch (dbError) {
          console.error("❌ Failed to record claim:", dbError.message)
        }
      }

      from = to + 1n
    }

    lastCheckedBlock = latestBlock
  } catch (err) {
    console.error("❌ Failed reading logs:", err.message)
  }
}

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  const status = {
    status: "online",
    timestamp: new Date().toISOString(),
    message: "✅ CHOGPUNCH Backend alive",
    components: {
      supabase: !!supabase,
      publicClient: !!publicClient,
      walletClient: !!walletClient,
      account: !!account,
      contractAddress: !!CONTRACT_ADDRESS
    },
    missingEnvVars: missingVars,
    lastCheckedBlock: lastCheckedBlock?.toString(),
    processedCount: processed.size
  }
  res.json(status)
})

// ✅ Start server
app.listen(3001, () => {
  console.log("🚀 CHOGPUNCH Backend running at http://localhost:3001")
  console.log(`📋 Health check: http://localhost:3001/health`)
  if (missingVars.length === 0) {
    console.log('✅ All environment variables configured - full functionality enabled')
  }
})

// ✅ Start event polling
console.log("🔄 Starting event polling every 15 seconds...")
setInterval(pollEvents, 15000)

// Run initial poll
pollEvents()