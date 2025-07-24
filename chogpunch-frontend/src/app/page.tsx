"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { submitScore, checkIfClaimed } from "@/utils/contract"
import ChogFighter from "@/components/ui/ChogFighter"

export default function Home() {
  const { address, isConnected } = useAccount()
  const [hits, setHits] = useState(0)
  const [claimed, setClaimed] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (address) checkIfClaimed(address).then(setClaimed)
  }, [address])

  const handleHit = () => {
    if (hits < 20) setHits(hits + 1)
  }

  const handleClaim = async () => {
    setClaiming(true)
    const success = await submitScore(address, 20)
    if (success) setClaimed(true)
    setClaiming(false)
  }

  return (
    <main className="min-h-screen bg-[#F3E8FF] flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-4">CHOGPUNCH</h1>
      <ConnectButton />
      <div className="my-6">
        <ChogFighter hits={hits} onPunch={handleHit} />
        <p className="mt-2 text-lg">Hits: {hits}/20</p>
        {isConnected && hits >= 20 && !claimed && (
          <button
            onClick={handleClaim}
            disabled={claiming}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg hover:bg-green-700"
          >
            {claiming ? "Claiming..." : "Claim 1 MON"}
          </button>
        )}
        {claimed && <p className="mt-2 text-green-700">You already claimed MON</p>}
      </div>
    </main>
  )
}
