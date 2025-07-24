'use client'

import { useState } from 'react'

interface ChogFighterProps {
  hits: number
  onPunch: () => void
}

export default function ChogFighter({ hits, onPunch }: ChogFighterProps) {
  const [isPunching, setIsPunching] = useState(false)

  const handlePunch = () => {
    if (hits >= 20) return
    
    setIsPunching(true)
    onPunch()
    
    setTimeout(() => {
      setIsPunching(false)
    }, 200)
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`w-48 h-48 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 ${
          isPunching ? 'scale-95' : 'scale-100'
        } ${hits >= 20 ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
        onClick={handlePunch}
      >
        <div className="text-6xl">🥊</div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          {hits < 20 ? 'Click to Punch!' : 'Ready to Claim!'}
        </p>
        <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(hits / 20) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}