# Le-Vision: Vision-Impaired Assistance Application

Le-Vision is a Next.js-based application designed to assist vision-impaired users in navigating the world and completing tasks. The application streams video from the user's webcam, captures audio from the microphone, and periodically captures the screen. All captured data is processed to provide real-time assistance.

## Features

- Real-time video streaming from webcam
- Audio capture and transcription
- Periodic screen capture
- Integration with OpenAI's Whisper for audio transcription
- Real-time navigation assistance based on processed data

## Tech Stack

- Frontend Framework: Next.js 14 with TypeScript
- UI Components: shadcn
- Styling: Tailwind CSS
- Icons: Lucide React
- Video Capture: React Webcam
- Audio Capture: MediaRecorder API
- Screen Capture: Screen Capture API
- HTTP Client: Axios

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/le-vision.git
   cd le-vision
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Contains the main application pages and layout
- `/components`: React components including AssistanceApp and WebcamComponent
- `/lib`: Utility functions
- `/types`: TypeScript type definitions
- `/public`: Static assets

## Key Components

### AssistanceApp

The main component that orchestrates the application's functionality.
