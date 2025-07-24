# 🥊 ChogPunch Backend - Express.js Claim Engine

Node.js Express backend that monitors Base blockchain for ChogPunch game events and distributes MON tokens on Monad.

## 🏗️ Project Structure

```
ChogPunch-Backend/               ← This repository
├── index.js                    ← Main Express server with event monitoring
├── abi/
│   └── chogpunchAbi.json       ← Contract ABI
├── .env                        ← Environment variables
├── package.json                ← Dependencies
└── README.md                   ← This file
```

## 🎮 How It Works

1. **Express Server**: Runs claim engine with health monitoring
2. **Event Monitoring**: Polls Base blockchain for `UserEligible` events
3. **Duplicate Prevention**: Checks Supabase database for existing claims
4. **MON Distribution**: Simulates sending 1 MON token to eligible users
5. **Health Endpoint**: Provides system status and component health

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment variables in .env
# Add your actual API keys and private keys

# Start the server
npm start
```

Server will run on `http://localhost:3001`

## 🔧 Environment Variables

Create a `.env` file with your actual values:

```env
ALCHEMY_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-key
CONTRACT_ADDRESS=0x76a607429bb5290e6c1ca1fad2e00fa8c2f913df
MONAD_PRIVATE_KEY=your-monad-wallet-private-key
SUPABASE_URL=https://oytglfzxkunhqkdibwad.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

## 📋 Health Check

**Endpoint**: `GET /health`

Returns component status and missing environment variables:

```json
{
  "status": "online",
  "timestamp": "2025-07-24T15:12:43.078Z",
  "components": {
    "supabase": true,
    "provider": false,
    "contract": false,
    "signer": false
  },
  "missingEnvVars": ["SUPABASE_SERVICE_ROLE_KEY", "ALCHEMY_RPC_URL", "MONAD_PRIVATE_KEY"]
}
```

## 🛠️ Technologies

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Blockchain**: ethers.js for Base/Monad interaction
- **Database**: Supabase for claim tracking
- **Environment**: dotenv for configuration

## 📦 Dependencies

- `express` - Web server framework
- `ethers` - Ethereum blockchain interaction
- `@supabase/supabase-js` - Database client
- `dotenv` - Environment variable management

## 🔄 Event Processing

The server continuously monitors the Base blockchain contract for `UserEligible` events:

1. Queries last 1000 blocks for events
2. Checks if user already claimed (Supabase)
3. Prevents duplicate processing with in-memory cache
4. Logs MON distribution simulation
5. Records claim in database

## 🚨 Error Handling

- **Graceful Startup**: Server starts even with missing config
- **Environment Validation**: Warns about placeholder values
- **Component Monitoring**: Tracks initialization status
- **Comprehensive Logging**: Detailed error messages with emojis

---

**Ready to process ChogPunch claims!** 🥊💰