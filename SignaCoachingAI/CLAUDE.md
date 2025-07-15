# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **SignaCoachingAI** project - an AI English Coach application designed to help technically skilled employees improve their real-time English communication confidence, particularly during USA client calls and escalations.

## Repository Structure

This repository contains comprehensive planning documentation for the AI English Coach project:

```
SignaCoachingAI/
├── docs/
│   ├── ai-english-coach-architecture.md    # Technical architecture overview
│   ├── ai-english-coach-prd.md            # Product Requirements Document
│   ├── ai-english-coach-epics-stories.md  # Epic breakdown and user stories
│   ├── ai-english-coach-figma-spec.md     # UI/UX design specifications
│   ├── ai-english-coach-roadmap.md        # Development roadmap
│   ├── ai-english-coach-stakeholder-brief.md # Stakeholder summary
│   ├── ai-english-coach-test-plan.md      # Testing strategy
│   ├── ai-english-coach-ui-review.md      # UI review guidelines
│   └── ai-english-coach-ux-wireframes.md  # UX wireframes and flows
```

## Project Status

**Current State**: Initial implementation completed
- ✅ Basic project structure and configuration
- ✅ TypeScript + React + Vite setup
- ✅ Firebase integration configured
- ✅ Core sentence correction foundation
- ✅ Basic UI components and styling
- ✅ Voice playback functionality
- 📋 Ready for feature expansion and Firebase deployment

## Architecture Overview

### Technology Stack (Implemented)
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Firebase (Auth, Firestore, Functions) - configured
- **Database**: Firebase Firestore with security rules
- **Voice**: Web Speech API for text-to-speech
- **AI**: Simulation service ready for Azure AI integration
- **Build**: Vite with TypeScript and ESLint
- **Testing**: Jest configuration ready

### Core Features
1. **Real-time Sentence Correction**: Input in English or native languages (Telugu, Tamil, etc.)
2. **Tone Improvement**: Professional, Friendly, Direct tone suggestions
3. **Voice Playback**: Corrected English with native language explanations
4. **Communication Profiles**: GPS, Barista, Dance Partner interaction styles
5. **Practice Modes**: Simulated client escalation scenarios
6. **Progress Tracking**: Confidence feedback and improvement metrics

## Development Workflow

### Getting Started
1. Clone the repository and install dependencies: `npm install`
2. Copy environment variables: `cp .env.example .env`
3. Start development server: `npm run dev`
4. Visit http://localhost:3000 to see the application

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run typecheck    # Type checking
```

### Implementation Status
- ✅ **Epic 1**: Foundation & Setup - Complete
  - Project structure with TypeScript + React + Vite
  - Firebase configuration (firestore.rules, firebase.json)
  - Basic UI components and styling system
  - Voice service integration
  
- 🔄 **Epic 2**: Sentence Correction Engine - In Progress
  - ✅ Basic correction service with simulation
  - ✅ Multi-language input support
  - ✅ Tone selection functionality
  - ⏳ Azure AI integration needed
  
- ⏳ **Epic 3**: Profile Modes & UI - Planned
  - GPS/Barista/Dance interface modes
  - Advanced UI components
  
- ⏳ **Epic 4**: Real-time Practice + Daily Tools - Planned
  - Practice scenarios and drills
  - Progress dashboard

### Key Design Principles
- **User Experience**: Conversational, supportive tone (not formal tutor)
- **Performance**: Response time < 3s for corrections, voice latency < 2s
- **Accessibility**: WCAG AA compliance
- **Personalization**: Save common corrections and sentence patterns
- **Mobile-First**: Responsive design for NOC shift workers

## Technical Requirements

### Non-Functional Requirements
- Mobile and desktop responsive
- Firebase hosting compatibility
- Secure personalized data storage
- Real-time correction performance
- Offline caching for recent corrections

### Integration Points
- Azure AI Agent infrastructure
- Multi-language voice synthesis
- Firebase authentication and Firestore
- Cross-platform deployment

## Target Users

Primary users are Signatech engineers who:
- Are technically competent but experience stress during client interactions
- Need support for USA client calls and escalations
- Work NOC shifts requiring mobile/web access
- Speak native languages (Telugu, Tamil, etc.) alongside English
- Require real-time communication improvement

## Current Implementation

### File Structure
```
src/
├── components/
│   ├── ui/                    # Button, Input, Card components
│   ├── features/              # SentenceCorrector component
│   └── layout/                # Layout components (planned)
├── services/
│   ├── firebase.ts           # Firebase configuration
│   ├── correctionService.ts  # Sentence correction logic
│   └── voiceService.ts       # Text-to-speech functionality
├── types/index.ts            # TypeScript type definitions
├── pages/HomePage.tsx        # Main application page
└── App.tsx                   # React app entry point
```

### Key Components
- **SentenceCorrector**: Main correction interface with voice playback
- **HomePage**: Landing page with features showcase
- **UI Components**: Button, Input, Card with Tailwind styling
- **Services**: Firebase, correction simulation, voice synthesis

### Next Steps
1. Set up Firebase project and deploy configuration
2. Integrate Azure AI services for real corrections
3. Implement user authentication
4. Add communication profile modes
5. Create practice scenarios and progress tracking

## Documentation Navigation

- **Implementation**: See `README.md` for setup instructions
- **Planning**: `docs/ai-english-coach-prd.md` - Core requirements and goals
- **Architecture**: `docs/ai-english-coach-architecture.md` - Technical design
- **Development**: `docs/ai-english-coach-epics-stories.md` - Implementation roadmap
- **Design**: `docs/ai-english-coach-figma-spec.md` + `docs/ai-english-coach-ux-wireframes.md`
- **Testing**: `docs/ai-english-coach-test-plan.md` - Testing strategy