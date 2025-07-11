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

## Architecture Overview

### Technology Stack
- **Framework**: React Native with Expo SDK ~53.0
- **Language**: TypeScript with strict mode enabled
- **Navigation**: React Navigation v7 (Bottom Tabs + Stack)
- **State Management**: Zustand with Immer middleware
- **Authentication**: Firebase Auth (Google, Apple, Facebook)
- **Database**: Firebase Firestore
- **UI Components**: Custom atomic design system
- **Animations**: React Native Reanimated 3
- **Vector Icons**: react-native-vector-icons

### Project Structure
```
DeckZone/src/
├── components/           # Atomic design components
│   ├── atoms/           # Button, Text, Icon
│   ├── molecules/       # GameCard, compound components
│   ├── organisms/       # Complex UI sections
│   └── templates/       # Screen layouts
├── navigation/          # React Navigation setup
│   ├── AuthStack.tsx    # Authentication flow
│   ├── MainNavigator.tsx # Main app navigation
│   └── RootNavigator.tsx # Root navigation wrapper
├── screens/             # Screen components
│   ├── WelcomeScreen.tsx
│   ├── Home.tsx
│   └── GameScreen.tsx
├── stores/              # Zustand state management
│   ├── authStore.ts     # Authentication state
│   └── gameStore.ts     # Game session state
├── services/            # External service integrations
│   ├── firebase.ts      # Firebase configuration
│   └── authService.ts   # Authentication logic
├── theme/               # Design system
│   ├── colors.ts        # Color palette
│   ├── spacing.ts       # Spacing scale
│   ├── typography.ts    # Font definitions
│   └── ThemeProvider.tsx # Theme context
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── data/                # Game content and data
```

### State Management Pattern

#### Zustand Stores
- **authStore.ts**: User authentication state, login/logout
- **gameStore.ts**: Active game session, cards, timer, navigation

#### Game Store Structure
```typescript
interface GameState {
  cards: GameCard[];           // Current game cards
  currentCardIndex: number;    // Active card index
  isPlaying: boolean;          // Game session status
  timer: number;               // Card timer (60s default)
  startGame: (cards) => void;  // Initialize game session
  nextCard: () => void;        // Navigate to next card
  previousCard: () => void;    // Navigate to previous card
  tickTimer: () => void;       // Decrement timer
  resetTimer: () => void;      // Reset timer to 60s
}
```

### Component Architecture

#### Atomic Design System
- **Atoms**: Button, Text, Icon (reusable primitives)
- **Molecules**: GameCard, NavigationItem (compound components)
- **Organisms**: GameInterface, complex UI sections
- **Templates**: ScreenTemplate, layout components

#### Button Component Features
- 5 variants: primary, secondary, tertiary, danger, ghost
- 4 sizes: small, medium, large, extraLarge
- Accessibility: proper ARIA roles, labels, hints
- Loading states with ActivityIndicator
- Icon support (left/right positioning)
- Full-width option

### Navigation Structure

#### Bottom Tab Navigation
- **Home**: Game selection and main interface
- **Game**: Active game session interface
- Additional tabs planned for profile, settings

#### Authentication Flow
- **AuthStack**: Welcome screen, login options
- **MainNavigator**: Authenticated user interface
- **RootNavigator**: Route between auth and main app

### Firebase Integration

#### Authentication Methods
- Google Sign-In
- Apple Sign-In  
- Facebook Login
- Guest mode (temporary users)

#### Configuration
Firebase config located in `src/services/firebase.ts` - requires actual API keys for production use.

### Development Workflow

#### Component Development
1. Follow atomic design principles
2. Include proper TypeScript interfaces
3. Add accessibility props (accessibilityLabel, accessibilityHint)
4. Use theme values for consistent styling
5. Test with both light/dark modes

#### Game Implementation
1. Define GameCard interface for game content
2. Create game-specific JSON data files
3. Implement game logic in gameStore
4. Add timer and navigation functionality
5. Test card transitions and animations

### Code Quality Standards

#### TypeScript Configuration
- Strict mode enabled
- Extends Expo TypeScript base configuration
- Type safety enforced throughout codebase

#### ESLint Configuration
- React Native Community config
- TypeScript ESLint rules
- Prettier integration for formatting
- Jest plugin for testing

### Testing Strategy

#### Unit Testing
- Component rendering and prop handling
- Store state management logic
- Hook functionality
- Utility functions

#### Integration Testing
- Navigation flow between screens
- Authentication integration
- Game session management
- Firebase service integration

### Performance Considerations

#### Optimization Targets
- Smooth 60fps animations
- Fast navigation transitions
- Efficient memory usage
- Minimal bundle size

#### Current Implementation
- Immer middleware for immutable state updates
- React Navigation for performant screen transitions
- Expo optimizations for native performance

### Accessibility Implementation

#### Current Standards
- Proper accessibilityRole on interactive elements
- accessibilityLabel for screen readers
- accessibilityHint for context
- accessibilityState for dynamic states
- Keyboard navigation support

### Working with Planning Documentation

The `FlashCardGameApp-Planning/` directory contains comprehensive specifications:
- **Technical architecture** in `technical/architecture.md`
- **Game specifications** in `games/` folder
- **Screen designs** in `screens/` folder
- **Implementation roadmap** in existing `CLAUDE.md`

When implementing new features, reference the planning documentation for detailed specifications and requirements.

### Common Development Tasks

#### Adding New Games
1. Create game JSON data file in `src/data/`
2. Define game-specific interfaces
3. Add game logic to gameStore
4. Create game-specific UI components
5. Test game flow and accessibility

#### Implementing New Screens
1. Create screen component in `src/screens/`
2. Add navigation route to appropriate navigator
3. Implement screen-specific state management
4. Add accessibility and theming support
5. Test navigation and data flow

#### Firebase Configuration
Replace placeholder values in `src/services/firebase.ts` with actual Firebase project configuration before deploying.

### Development Environment

#### Prerequisites
- Node.js 16+ 
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

#### Getting Started
1. `cd DeckZone`
2. `npm install`
3. `expo start`
4. Choose development platform (iOS/Android/Web)

This implementation follows the comprehensive planning documentation while providing a working React Native/Expo foundation for the DeckZone flash card game application.