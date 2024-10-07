'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import WebcamComponent from '@/components/WebcamComponent'
import { NavigationResponse } from '@/types'

export default function Component() {
  const [isAssistanceStarted, setIsAssistanceStarted] = useState(false)
  const [navigationResponse, setNavigationResponse] = useState<NavigationResponse | null>(null)

  const handleVideoData = (blob: Blob) => {
    console.log('Video data received:', blob)
  }

  const handleScreenCapture = (dataUrl: string) => {
    console.log('Screen captured:', dataUrl)
  }

  const handleNavigation = (response: NavigationResponse) => {
    console.log('Navigation response received:', response)
    setNavigationResponse(response)
  }

  const startAssistance = () => {
    setIsAssistanceStarted(true)
  }

  const stopAssistance = () => {
    setIsAssistanceStarted(false)
    setNavigationResponse(null)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Le-Kellen</h1>
        <div className="flex flex-col items-center">
          <div className="border border-white rounded-3xl p-6 w-full">
            <WebcamComponent
              onVideoData={handleVideoData}
              onScreenCapture={handleScreenCapture}
              onNavigation={handleNavigation}
              isAssistanceStarted={isAssistanceStarted}
              onStopAssistance={stopAssistance}
            />
          </div>
          <div className="mt-6 flex justify-center">
              {!isAssistanceStarted ? (
                <Button
                  onClick={startAssistance}
                  className="bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Start Assistance
                </Button>
              ) : (
                <Button
                  onClick={stopAssistance}
                  className="bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Stop Assistance
                </Button>
              )}
            </div>
          {navigationResponse && (
            <div className="mt-8 border border-white rounded-3xl p-6 w-full">
              <h2 className="text-2xl font-bold mb-4">Navigation</h2>
              <p className="text-xl font-semibold mb-2">Current Action:</p>
              <p className="text-lg mb-4">{navigationResponse.current_action}</p>
              <p className="text-xl font-semibold mb-2">Target Task:</p>
              <p className="text-lg mb-4">{navigationResponse.target_task}</p>
              <p className="text-xl font-semibold mb-2">Current Location:</p>
              <p className="text-lg mb-4">{navigationResponse.current_location}</p>
              {navigationResponse.plan && navigationResponse.plan.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold mb-2">Plan:</h3>
                  <ul className="list-disc pl-6">
                    {navigationResponse.plan.map((step) => (
                      <li key={step.step_number} className="mb-2">
                        <strong>{step.action}:</strong> {step.description}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}