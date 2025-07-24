# 🥊 ChogPunch - Punch to Earn MON

A Web3 game where users punch their way to earning MON tokens on the Monad blockchain.

## 🏗️ Project Structure

```
ChogPunch/
├── chogpunch-backend/        ← Node.js Express backend
│   ├── index.js             ← Main server with event monitoring
│   ├── abi/
│   │   └── chogpunchAbi.json ← Contract ABI
│   ├── .env                 ← Environment variables
│   └── package.json         ← Backend dependencies
└── chogpunch-frontend/       ← Next.js React frontend
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx     ← Main game interface
    │   │   ├── layout.tsx   ← App layout with providers
    │   │   └── providers.tsx ← Web3 providers setup
    │   ├── components/ui/
    │   │   └── ChogFighter.tsx ← Interactive game component
    │   └── utils/
    │       ├── wagmi.ts     ← Web3 configuration
    │       └── contract.ts  ← Blockchain interactions
    └── package.json         ← Frontend dependencies
```

## 🎮 How It Works

1. **Frontend Game**: Users connect wallet and punch to reach 20 hits
2. **Smart Contract**: Submits score to Base blockchain contract
3. **Backend Monitoring**: Polls Base for `UserEligible` events
4. **MON Distribution**: Automatically sends 1 MON token on Monad
5. **Database Tracking**: Prevents duplicate claims via Supabase

## 🚀 Quick Start

### Backend Setup
```bash
cd chogpunch-backend
npm install
# Configure .env file with your keys
npm start
```

### Frontend Setup
```bash
cd chogpunch-frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
ALCHEMY_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-alchemy-key
CONTRACT_ADDRESS=0x76a607429bb5290e6c1ca1fad2e00fa8c2f913df
MONAD_PRIVATE_KEY=your-monad-wallet-private-key
SUPABASE_URL=https://oytglfzxkunhqkdibwad.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Frontend (wagmi.ts)
```typescript
projectId: 'YOUR_WALLETCONNECT_PROJECT_ID'
```

## 📋 Health Check

Backend health endpoint: `http://localhost:3001/health`

Returns component status and missing environment variables.

## 🛠️ Technologies

- **Backend**: Node.js, Express.js, ethers.js, Supabase
- **Frontend**: Next.js, TypeScript, Tailwind CSS, RainbowKit, wagmi
- **Blockchain**: Base (mainnet), Monad (testnet)
- **Database**: Supabase

## 📦 Dependencies Installed

✅ **Backend**: `express`, `ethers`, `dotenv`, `@supabase/supabase-js`  
✅ **Frontend**: `wagmi`, `@rainbow-me/rainbowkit`, `ethers`, `@tanstack/react-query`

## 🔗 Repository

GitHub: [ChogPunch-Backend](https://github.com/Fernoxx/ChogPunch-Backend)

---

**Ready to punch your way to MON tokens!** 🥊💰