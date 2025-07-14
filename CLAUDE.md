# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains two main parts:
1. **DeckZone/** - Active React Native/Expo implementation
2. **FlashCardGameApp-Planning/** - Comprehensive planning documentation

## Development Commands

### Core Development
```bash
# Navigate to the main app directory
cd DeckZone

# Install dependencies
npm install

# Start development server
npm start
# or
expo start

# Platform-specific development
npm run android  # Android development
npm run ios      # iOS development
npm run web      # Web development

# Code quality
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
```

### EAS Build Commands
```bash
# Build for development
eas build --profile development --platform all

# Build for production
eas build --profile production --platform all
```

## Current Implementation Status

### Technology Stack
- **Framework**: React Native with Expo SDK ~53.0
- **Language**: TypeScript with strict mode enabled
- **Navigation**: React Navigation v7 (Stack + Bottom Tabs)
- **State Management**: Zustand with Immer middleware
- **Internationalization**: react-i18next with 13 language support
- **UI Components**: Custom React Native components
- **Animations**: React Native Reanimated 3
- **Vector Icons**: react-native-vector-icons (Ionicons)
- **Storage**: AsyncStorage for settings persistence

### Current Project Structure
```
DeckZone/src/
├── components/
│   └── molecules/
│       ├── GameCard.tsx         # Main game card component with blur effects
│       └── GameInstructions.tsx # Game instructions modal popup
├── hooks/
│   └── useLanguageChange.ts     # Hook for handling language updates
├── i18n/                        # Internationalization setup
│   ├── i18n.ts                  # i18next configuration
│   └── locales/                 # 13 language files (en, es, fr, de, it, pt, ja, ko, zh, ar, hi, ta, te)
├── navigation/
│   ├── RootNavigator.tsx        # Root stack navigator (Welcome → MainTabs → Game)
│   └── MainTabNavigator.tsx     # Bottom tab navigation (Dashboard, Games, Profile, Settings)
├── screens/                     # Screen components
│   ├── WelcomeScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── GameScreen.tsx           # Complete game experience with timer, refresh, instructions
│   ├── GameSelectionScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SettingsScreen.tsx
│   └── GalleryScreen.tsx
├── stores/
│   └── settingsStore.ts         # Settings state management with persistence
└── theme/
    └── colors.ts                # Color palette definition
```

### Navigation Architecture

#### Current Navigation Flow
1. **RootNavigator** (Stack):
   - Welcome Screen (initial)
   - MainTabs (main app)
   - Game Screen (modal-style game session)

2. **MainTabNavigator** (Bottom Tabs):
   - Dashboard Tab
   - Games Tab
   - Profile Tab  
   - Settings Tab

#### Navigation Features
- TypeScript navigation param definitions
- Internationalized tab and header titles
- Animated tab icons with scale effects
- Custom styling with theme colors
- Modal-style game screen presentation

### State Management

#### Settings Store (settingsStore.ts)
```typescript
interface SettingsState {
  language: Language;           // 13 supported languages
  theme: ThemeMode;            // 'light' | 'dark' | 'system'
  notifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  countdownDuration: number;   // Game timer duration
  // Actions for updating settings
  setLanguage: (language) => void;
  setTheme: (theme) => void;
  // ... other toggles and persistence methods
}
```

#### Key Features
- AsyncStorage persistence for all settings
- Automatic i18n language switching
- Immer middleware for immutable updates
- Default settings with graceful fallbacks

### Internationalization

#### Language Support
Supports 13 languages with full locale files:
- English (en), Spanish (es), French (fr), German (de)
- Italian (it), Portuguese (pt), Japanese (ja), Korean (ko)
- Chinese (zh), Arabic (ar), Hindi (hi), Tamil (ta), Telugu (te)

#### Implementation
- Automatic device locale detection with fallback to English
- Dynamic language switching through settings store
- useTranslation hook for component translations
- expo-localization integration for device locale

### Component Architecture

#### GameCard Component
- Responsive design with device width adaptation
- Image background support with overlay effects
- Blur effect for reveal/conceal functionality (expo-blur)
- Responsive typography and layout
- Memoized for performance optimization

#### GameInstructions Component
- Modal popup with game-specific instructions
- Blur background overlay with touch-to-dismiss
- Scrollable content with step-by-step game rules
- General tips section with helpful hints
- Game-specific instructions for all 5 game categories

#### Design System
- Centralized color palette in `theme/colors.ts`
- Consistent styling patterns across components
- Theme-aware component implementations

### Code Quality Standards

#### TypeScript Configuration
- Strict mode enabled with ES2020 lib support
- Extends Expo TypeScript base configuration
- NodeJS types for complete type coverage

#### ESLint Configuration
- Custom configuration with TypeScript support
- Warns on unused variables (allows underscore prefix)
- Console warnings for development feedback
- JSX and modern JavaScript support

### Testing Infrastructure

#### Current Setup
- Jest configured in package.json devDependencies
- TypeScript testing support with ts-jest
- No current test files in main src/ directory
- Test infrastructure ready for implementation

### Performance Optimizations

#### Current Implementations
- React.memo on GameCard component
- react-native-screens enabled for navigation performance
- Zustand with Immer for efficient state updates
- Responsive design calculations cached

### Development Workflow

#### Component Development
1. Use TypeScript interfaces for all props and state
2. Implement responsive design with device width calculations
3. Follow theme color system for consistent styling
4. Add internationalization support using useTranslation
5. Consider performance with React.memo for expensive components

#### Adding New Languages
1. Create new locale file in `src/i18n/locales/`
2. Add language to resources object in `i18n.ts`
3. Update Language type in `settingsStore.ts`
4. Test language switching functionality

### Working with Planning Documentation

The `FlashCardGameApp-Planning/` directory contains comprehensive specifications that guide future development:
- **Technical architecture** in `technical/architecture.md`
- **Game specifications** in `games/` folder  
- **Screen designs** in `screens/` folder
- **Implementation roadmap** for planned features

### Development Environment

#### Prerequisites
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

#### Getting Started
1. `cd DeckZone`
2. `npm install`
3. `expo start`
4. Choose development platform (iOS/Android/Web)

### Key Implementation Notes

#### Current vs Planned Architecture
- The current implementation has a working foundation with navigation, i18n, and settings
- Firebase authentication and Firestore database are planned but not yet implemented
- Game logic and timer functionality are outlined in planning docs but not yet built
- Atomic design system is planned but currently has minimal component structure

### Game Mechanics Implementation

#### Image Guessing Game Flow
1. **Image Display**: Each game shows relevant images for guessing
2. **Timer Countdown**: Configurable countdown timer (default 10s) automatically advances cards
3. **Answer Reveal**: Tap card to reveal blurred answer text and descriptions
4. **Image Refresh**: Refresh button loads random images from multiple sources if current image is unclear
5. **Game Instructions**: Info icon shows game-specific instructions and tips

#### Game Categories with Specific Data
- **Animal Kingdom** (ID: 1): Animal images with names and descriptions
- **Ice Breakers** (ID: 2): Conversation starter questions with context
- **Movie Mania** (ID: 3): Movie scenes with titles and descriptions  
- **Picture Charades** (ID: 4): Activity images for acting out
- **Would You Rather** (ID: 5): Decision scenarios with detailed explanations

#### Refresh System
- Multiple image sources (Unsplash, Picsum) for reliability
- Automatic fallback between sources
- Loading animation with spinning icon
- Timeout protection to prevent hanging
- Cache-busting for fresh random images

#### Next Development Priorities
Based on the current implementation state, future development should focus on:
1. Implementing Firebase authentication and database integration
2. Building out the atomic design system with reusable components
3. Adding scoring and progress tracking functionality
4. Creating comprehensive test suite
5. Implementing remaining planned features from the planning documentation