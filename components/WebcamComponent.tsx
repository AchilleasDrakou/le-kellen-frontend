// TODO: Have the audio streaming a button to start and stop recording


import React, { useRef, useCallback, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Camera, Mic } from 'lucide-react'
import axios from 'axios'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NavigationResponse } from '@/types'

interface WebcamComponentProps {
  onVideoData: (blob: Blob) => void
  onScreenCapture: (dataUrl: string) => void
  onNavigation: (response: NavigationResponse) => void
  isAssistanceStarted: boolean
  onStopAssistance: () => void
}

export default function Component({
  onVideoData,
  onScreenCapture,
  onNavigation,
  isAssistanceStarted,
  onStopAssistance,
}: WebcamComponentProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('')
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('')
  const [lastTranscription, setLastTranscription] = useState('')
  const [lastCapturedImage, setLastCapturedImage] = useState('')

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const vDevices = devices.filter(device => device.kind === 'videoinput')
      const aDevices = devices.filter(device => device.kind === 'audioinput')
      setVideoDevices(vDevices)
      setAudioDevices(aDevices)
      if (vDevices.length > 0) setSelectedVideoDeviceId(vDevices[0].deviceId)
      if (aDevices.length > 0) setSelectedAudioDeviceId(aDevices[0].deviceId)
    })
  }, [])

  const videoConstraints = {
    width: 1280,
    height: 720,
    deviceId: selectedVideoDeviceId
  }

  const audioConstraints = {
    deviceId: selectedAudioDeviceId
  }

  useEffect(() => {
    if (isAssistanceStarted) {
      handleStartCaptureClick()
    } else {
      handleStopCaptureClick()
    }
  }, [isAssistanceStarted])

  const handleStartCaptureClick = useCallback(() => {
    setIsCapturing(true)
  }, [])

  const handleStopCaptureClick = useCallback(() => {
    setIsCapturing(false)
    onStopAssistance()
  }, [onStopAssistance])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConstraints,
        video: false  // We're only recording audio here
      })
      const recorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        await sendAudioToWhisper(audioBlob)
      }

      recorder.start()
      setAudioRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [audioConstraints])

  const stopRecording = useCallback(() => {
    if (audioRecorder) {
      audioRecorder.stop()
      setIsRecording(false)
    }
  }, [audioRecorder])

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', 'whisper-1')

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log('Whisper response:', response.data)
      const transcription = response.data.text
      handleNewTranscription(transcription)
    } catch (error) {
      console.error('Error sending audio to Whisper:', error)
    }
  }

  const captureAndSendData = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        const base64Image = imageSrc.split(',')[1]
        sendDataToFastAPI(base64Image, lastTranscription)
      }
    }
  }, [lastTranscription])

  const handleNewTranscription = (transcription: string) => {
    setLastTranscription(transcription)
    sendDataToFastAPI(lastCapturedImage, transcription)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAssistanceStarted) {
      interval = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot()
          if (imageSrc) {
            const base64Image = imageSrc.split(',')[1]
            setLastCapturedImage(base64Image)
            sendDataToFastAPI(base64Image, lastTranscription)
          }
        }
      }, 3000) // Capture and send data every 3 seconds
    }
    return () => clearInterval(interval)
  }, [isAssistanceStarted, lastTranscription])

  const sendDataToFastAPI = async (base64Image: string, transcription: string) => {
    try {
      const formData = new FormData()
      formData.append('image', base64Image)
      formData.append('transcription', transcription)

      const response = await axios.post('http://localhost:8001/image/navigate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log('Data processed by FastAPI:', response.data)
      onNavigation(response.data)
    } catch (error) {
      console.error('Error sending data to FastAPI:', error)
    }
  }

  // Remove the old captureScreen and sendImageToFastAPI functions as they're no longer needed

  return (
    <div className="space-y-6">
      <div className="border border-white rounded-2xl p-4 aspect-video flex items-center justify-center">
        {isAssistanceStarted ? (
          <Webcam
            audio={true}
            audioConstraints={audioConstraints}
            ref={webcamRef}
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="text-2xl font-bold">CAMERA FEED</div>
        )}
      </div>
      {isAssistanceStarted && (
        <div className="flex">
          <div className="w-1/2 pr-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Select Inputs</h3>
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <Camera className="w-6 h-6" />
                <Select value={selectedVideoDeviceId} onValueChange={setSelectedVideoDeviceId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Mic className="w-6 h-6" />
                <Select value={selectedAudioDeviceId} onValueChange={setSelectedAudioDeviceId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="w-1/2 pl-4 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Record Question</h3>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full w-16 h-16 flex items-center justify-center ${
                isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <Mic className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}