// backend/index.js
import express from "express"
import { ethers } from "ethers"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import { readFileSync } from "fs"

dotenv.config()

const app = express()
const port = 3001

// ✅ Load ABI
const ABI = JSON.parse(readFileSync("./abi/chogpunchAbi.json", "utf8"))

// ✅ Environment variable validation
const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ALCHEMY_RPC_URL: process.env.ALCHEMY_RPC_URL,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  MONAD_PRIVATE_KEY: process.env.MONAD_PRIVATE_KEY
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
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  console.log('✅ Supabase client initialized')
} catch (error) {
  console.error('❌ Failed to initialize Supabase:', error.message)
}

// ✅ Setup Base RPC + contract
let provider = null
let contract = null
let signer = null

try {
  if (process.env.ALCHEMY_RPC_URL && !process.env.ALCHEMY_RPC_URL.includes('your-')) {
    provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_RPC_URL)
    console.log('✅ Base RPC provider initialized')
  }

  if (process.env.MONAD_PRIVATE_KEY && !process.env.MONAD_PRIVATE_KEY.includes('your-') && provider) {
    signer = new ethers.Wallet(process.env.MONAD_PRIVATE_KEY, provider)
    console.log('✅ Wallet signer initialized')
  }

  if (process.env.CONTRACT_ADDRESS && !process.env.CONTRACT_ADDRESS.includes('your-') && signer) {
    contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, signer)
    console.log('✅ Contract initialized')
  }
} catch (error) {
  console.error('❌ Failed to initialize blockchain components:', error.message)
}

let processed = new Set()

// ✅ Claim Loop
async function checkEvents() {
  if (!contract || !supabase) {
    console.log('⏸️  Skipping event check - missing contract or supabase configuration')
    return
  }

  try {
    const logs = await contract.queryFilter(contract.filters.UserEligible(), -1000)

    for (const log of logs) {
      const user = log.args.user.toLowerCase()
      if (processed.has(user)) continue

      const { data: existing } = await supabase
        .from("claims")
        .select("address")
        .eq("address", user)

      if (existing && existing.length > 0) continue

      // Simulate MON sending to user (offchain on Monad)
      console.log("🎯 Sending 1 MON to:", user)

      await supabase.from("claims").insert({ address: user })
      processed.add(user)
    }
  } catch (e) {
    console.error("❌ Error reading events:", e.message)
  }
}

setInterval(checkEvents, 10000)

app.get("/health", (_, res) => {
  const status = {
    status: "online",
    timestamp: new Date().toISOString(),
    components: {
      supabase: !!supabase,
      provider: !!provider,
      contract: !!contract,
      signer: !!signer
    },
    missingEnvVars: missingVars
  }
  res.json(status)
})

app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`)
  console.log(`📋 Health check: http://localhost:${port}/health`)
  if (missingVars.length === 0) {
    console.log('✅ All environment variables configured - full functionality enabled')
  }
})