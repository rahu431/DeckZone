# SignaCoaching AI - English Coach

An AI-powered English coaching application designed to help technical professionals improve their real-time English communication confidence, particularly during client calls and escalations.

## Features

- **Real-time Sentence Correction**: Get instant corrections for English sentences with explanations
- **Multi-language Support**: Input in English, Telugu, Tamil, Hindi, and more
- **Tone Adjustment**: Choose between Professional, Friendly, Direct, and Casual tones
- **Voice Playback**: Hear corrected sentences with text-to-speech
- **Communication Profiles**: GPS (Direct), Barista (Friendly), and Dance (Expressive) modes
- **Progress Tracking**: Monitor improvement over time
- **Firebase Integration**: Secure user data and corrections storage

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Voice**: Web Speech API
- **AI Integration**: Ready for Azure AI services
- **Build Tool**: Vite
- **Testing**: Jest

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Firebase project (optional for local development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SignaCoachingAI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase and API configuration
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck

# Firebase emulators (requires Firebase setup)
npm run firebase:emulators

# Deploy to Firebase
npm run firebase:deploy
```

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── features/           # Feature-specific components
│   └── layout/             # Layout components
├── hooks/                  # Custom React hooks
├── pages/                  # Page components
├── services/               # API and service classes
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── styles/                 # Global styles
└── assets/                 # Static assets
```

## Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Copy your Firebase config to `.env`
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5001
```

## Usage

1. **Sentence Correction**: Type or paste a sentence in the input field
2. **Language Selection**: Choose your input language (English, Telugu, Tamil, Hindi)
3. **Tone Selection**: Select desired tone (Professional, Friendly, Direct, Casual)
4. **Get Corrections**: Click "Correct Sentence" to receive corrections
5. **Voice Playback**: Use the play button to hear the original and corrected sentences
6. **Review Changes**: See detailed explanations for each correction

## Development Notes

- The app currently uses simulated corrections for development
- Firebase integration is configured but requires project setup
- Voice synthesis uses the Web Speech API (browser-dependent)
- Azure AI integration is planned for production-level corrections

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details