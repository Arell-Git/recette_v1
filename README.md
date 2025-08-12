# Recette v1

This project is a full-stack application that converts TikTok videos into recipe instructions using audio extraction and AI transcription. It consists of a Node.js/Express backend and a React frontend.

## Project Structure

```
recette_v1-master/
├── backend/
│   ├── app.js                  # Main Express server
│   ├── get-audio-from-url.py   # Python script to extract audio from video URLs
│   ├── controllers/
│   │   └── whisperController.js    # Handles transcription logic
│   ├── routes/
│   │   └── uploadRoute.js          # API routes for uploads
│   └── utils/
│       ├── fileUtils.js            # File handling utilities
│       └── openaiUtils.js          # OpenAI API utilities
├── frontend/
│   └── tiktok-to-recipe/
│       ├── public/
│       └── src/
│           ├── App.js              # Main React component
│           └── components/
│               └── fileUpload.js   # File/URL upload component
```

## Backend Setup
1. Go to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables as needed (e.g., OpenAI API key).
4. Start the server:
   ```bash
   npm run dev
   ```

## Frontend Setup
1. Go to the frontend React app directory:
   ```bash
   cd frontend/tiktok-to-recipe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage
- Open the frontend in your browser at http://localhost:3000
- Upload a TikTok video file or submit a video URL.
- The backend will extract audio, transcribe it, and return recipe instructions.

## Requirements
- Node.js (backend)
- Python 3 (for audio extraction script)
- OpenAI API key (for transcription)

## License
MIT License
