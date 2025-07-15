# Signatech AI English Coach - Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Help technically skilled employees improve real-time English communication confidence
- Reduce anxiety during USA client calls and escalations
- Deliver personalized, context-aware communication improvement
- Enable day-to-day sentence correction from native language prompts
- Encourage adoption through a friendly, conversational interface
- Provide mobile and web access for use during NOC shifts
- Support integration with Azure AI agent infrastructure

### Background Context
Signatech’s engineers are highly competent technically but experience stress during real-time client interactions, especially with USA clients in critical NOC scenarios. Traditional English coaching does not align with shift schedules or practical needs. A real-time, emotionally intelligent, language-aware AI assistant can help bridge this confidence gap by guiding employees through everyday communication challenges.

## Requirements

### Functional Requirements
1. FR1: Provide real-time sentence correction with input in English or native languages (Telugu, Tamil, etc.)
2. FR2: Offer tone improvement suggestions (Professional, Friendly, Direct)
3. FR3: Voice playback in corrected English and native language explanation
4. FR4: Daily confidence boosters like short phrase makeovers and drills
5. FR5: Save personal common corrections and frequently used sentence patterns
6. FR6: Track user improvement through confidence feedback
7. FR7: Offer communication style profiles (GPS, Barista, Dance Partner)
8. FR8: Include simulated client escalation prompts for practice

### Non-Functional Requirements
1. NFR1: Must be mobile and desktop responsive
2. NFR2: Should support Firebase hosting compatibility
3. NFR3: Must support secure storage of personalized data
4. NFR4: Response time < 3s for real-time corrections
5. NFR5: Voice response latency < 2s for smooth conversation flow
6. NFR6: Should allow optional Azure AI Agent integration

## User Interface Design Goals

### Overall UX Vision
Make users feel like they are interacting with a friendly, professional peer — not a formal tutor. The tone should be supportive, informal, and context-aware.

### Key Interaction Paradigms
- Conversational chat and voice modes
- Visual tone maps and route alternatives
- Personal “communication blend” profiles
- Real-time correction while typing or speaking

### Core Screens and Views
- Sentence Correction Console
- Blend Setup (Barista Mode)
- GPS Navigator with Route Suggestions
- Dance Mode Live Practice
- Daily Toolkit & Phrase Journal

### Accessibility
WCAG AA

### Branding
- Simple, clean, confidence-focused design
- Use metaphors (GPS, Coffee, Dance) in UI visuals

### Target Device and Platforms
Cross-platform (Mobile + Web)

## Technical Assumptions

### Repository Structure
Monorepo (web, mobile, backend together)

### Service Architecture
Serverless functions (Firebase Cloud Functions + Optional Azure AI agent callouts)

### Testing Requirements
Unit + Integration

### Additional Technical Assumptions and Requests
- Voice synthesis in multiple languages
- Offline caching for recent corrections

## Epic List

1. Epic 1: Foundation & Setup - Project setup, Firebase deployment, voice/text input framework
2. Epic 2: Sentence Correction Engine - NLP, multilingual input processing, tone logic
3. Epic 3: Profile Modes & UI - Implement GPS/Barista/Dance interfaces
4. Epic 4: Real-time Practice + Daily Tools - Practice drills, daily boosters, progress dashboard