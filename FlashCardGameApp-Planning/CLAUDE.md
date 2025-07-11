# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Context
**Important**: This is a planning and documentation repository for the DeckZone project. The actual React Native/Expo implementation has not been created yet. This repository contains comprehensive planning documents, technical specifications, and implementation guides.

## Project Overview
DeckZone is a planned React Native mobile application built with Expo, featuring TikTok-style full-screen card interfaces for social party games. The app will include social authentication, offline gameplay, and comprehensive accessibility support.

## Planning Documentation Structure

### Core Planning Documents
```
FlashCardGameApp-Planning/
├── docs/                    # High-level project documentation
│   ├── app-overview.md     # Project vision and features
│   └── development-phases.md # 6-8 month timeline
├── games/                   # Game specifications
│   ├── picture-charades.md
│   ├── would-you-rather.md
│   ├── movie-mania.md
│   ├── ice-breakers.md
│   └── animal-kingdom.md
├── screens/                 # UI/UX specifications
│   ├── 01-welcome-screen.md
│   ├── 02-home-screen.md
│   ├── 03-game-screen.md
│   ├── 04-profile-screen.md
│   └── 05-settings-screen.md
├── technical/               # Implementation guides
│   ├── architecture.md
│   ├── design-system.md
│   ├── component-library.md
│   ├── navigation-system.md
│   ├── state-management.md
│   ├── performance-optimization.md
│   └── accessibility-implementation.md
└── authentication/
    └── social-login-spec.md
```

### Development Commands (Future Implementation)
When the React Native project is created, these commands will be used:

```bash
# Initial project setup
npx create-expo-app DeckZone --template

# Install dependencies
npm install

# Start development server
expo start

# Build commands (via EAS)
eas build --profile development --platform all
```

## Architecture Overview

### Technology Stack
- **Frontend**: React Native with Expo SDK 49+
- **Navigation**: React Navigation v6 with custom TikTok-style transitions
- **State Management**: Zustand with persistence middleware
- **UI Library**: Tamagui for performance-optimized components
- **Animations**: React Native Reanimated 3 with gesture handling
- **Authentication**: Firebase Auth (Google, Facebook, Apple, Guest)
- **Database**: Firebase Firestore with offline support
- **Storage**: AsyncStorage for local data, Firebase for cloud sync

### Planned Project Structure (Future Implementation)
```
src/
├── components/           # Atomic design pattern
│   ├── atoms/           # Button, Text, Icon (see component-library.md)
│   ├── molecules/       # GameCard, NavigationItem
│   ├── organisms/       # GameInterface, ProfileHeader
│   └── templates/       # ScreenTemplate, ModalTemplate
├── screens/             # Screen components (see screens/ folder)
├── navigation/          # TikTok-style navigation (see navigation-system.md)
├── stores/             # Zustand state stores (see state-management.md)
├── services/           # Firebase integration
├── hooks/              # Custom React hooks
├── utils/              # Performance and accessibility utilities
├── theme/              # Design system (see design-system.md)
└── data/               # Game content JSON files
```

### State Management Pattern
- **Authentication**: Use `useAuthStore` for user authentication state
- **Game Sessions**: Use `useGameStore` for active gameplay state
- **User Data**: Use `useUserDataStore` for statistics and preferences
- **UI State**: Use `useUIStore` for modals, notifications, and loading states
- **Server Data**: Use React Query for API data fetching and caching

### Component Development Guidelines
1. **Atomic Design**: Build components from atoms → molecules → organisms → templates
2. **Accessibility First**: Include WCAG 2.1 AA compliance in every component
3. **Performance Optimized**: Use React.memo, useMemo, and useCallback appropriately
4. **Theme Aware**: Support light/dark mode and high contrast themes
5. **Platform Adaptive**: Handle iOS/Android differences gracefully

## Key Planning Documents Reference

### Game Specifications
Each game has detailed specifications in the `games/` folder:
- **Picture Charades**: Visual acting game with difficulty levels and image cards
- **Would You Rather**: Decision-making game with philosophical and funny choices  
- **Movie Mania**: Film trivia with acting, describing, and trivia challenges
- **Ice Breakers**: Social conversation starters for different group sizes
- **Animal Kingdom**: Family-friendly animal acting with educational content

### Technical Implementation Guides
Comprehensive implementation documentation in `technical/`:
- **architecture.md**: Complete system architecture, data models, and Firebase setup
- **design-system.md**: Color palettes, typography, spacing with accessibility compliance
- **component-library.md**: Atomic design components with TypeScript examples
- **navigation-system.md**: TikTok-style gesture navigation implementation
- **state-management.md**: Zustand stores with persistence and React Query integration
- **performance-optimization.md**: 60fps targets, memory management, bundle optimization
- **accessibility-implementation.md**: WCAG 2.1 AA compliance with screen reader support

### Game Implementation Process (Future)
1. Reference game specification in `games/[game-name].md`
2. Create game data JSON based on card structure in spec
3. Implement game-specific components following `component-library.md`
4. Add game navigation per `navigation-system.md`
5. Integrate with game store per `state-management.md`
6. Test accessibility per `accessibility-implementation.md`

### Card Interface Standards
- **Full-Screen**: Use entire viewport with safe area handling
- **Swipe Navigation**: Vertical swipes for primary navigation
- **Accessibility**: Provide button alternatives for screen readers
- **Animation**: Smooth 60fps transitions with reduced motion support
- **Content**: Support text, images, and interactive elements

## Performance Requirements

### Target Metrics
- **App Startup**: <3 seconds cold start, <1 second warm start
- **Navigation**: <300ms screen transitions
- **Animation**: Consistent 60fps during gestures and transitions
- **Memory**: <150MB peak usage
- **Bundle Size**: <50MB total app size

### Optimization Strategies
1. **Code Splitting**: Lazy load screens and heavy components
2. **Image Optimization**: Use appropriate sizes and formats
3. **List Virtualization**: Use FlashList for large datasets
4. **Gesture Optimization**: Use native driver for animations
5. **Memory Management**: Clean up resources on app background

## Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: Minimum 44px (iOS) / 48px (Android)
- **Screen Reader**: Full VoiceOver/TalkBack support
- **Keyboard Navigation**: Complete keyboard accessibility
- **Font Scaling**: Support system font size preferences

### Implementation Checklist
- [ ] Accessibility labels on all interactive elements
- [ ] Proper heading hierarchy (accessibilityRole="heading")
- [ ] Alternative text for images
- [ ] Focus management for modals and navigation
- [ ] Screen reader announcements for state changes
- [ ] High contrast mode support
- [ ] Reduced motion preference handling

## Testing Strategy

### Unit Testing
- **Components**: Test rendering, props, and user interactions
- **Hooks**: Test custom hook logic and state changes
- **Utils**: Test utility functions and edge cases
- **Stores**: Test state management logic

### Integration Testing
- **Navigation**: Test screen transitions and deep linking
- **Game Flow**: Test complete game sessions
- **Authentication**: Test login/logout flows
- **Data Sync**: Test online/offline synchronization

### Accessibility Testing
- **Automated**: Use jest-axe for automated accessibility testing
- **Manual**: Test with screen readers and keyboard navigation
- **Real Users**: Conduct testing with assistive technology users

### Performance Testing
- **Bundle Analysis**: Monitor bundle size and composition
- **Runtime Performance**: Track frame rates and memory usage
- **Network**: Test offline functionality and data sync

## Common Patterns

### Error Handling
```typescript
// Use UI store for error management
const { setError, clearError } = useUIStore()

try {
  await someAsyncOperation()
} catch (error) {
  setError('operation-key', error.message)
  // Error will be displayed in UI
}
```

### Loading States
```typescript
// Use UI store for loading states
const { setGlobalLoading } = useUIStore()

setGlobalLoading(true, 'Loading game content...')
try {
  const data = await loadGameData()
} finally {
  setGlobalLoading(false)
}
```

### Accessibility Implementation
```typescript
// Always include accessibility props
<Pressable
  onPress={handlePress}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Start new game"
  accessibilityHint="Begins a new game session"
>
  <Text>Start Game</Text>
</Pressable>
```

### Navigation
```typescript
// Use typed navigation
const navigation = useNavigation<GameStackNavigationProp>()

// Navigate with proper screen names
navigation.navigate('GamePlay', { gameId: 'picture-charades' })
```

## Working with Planning Documentation

### Understanding the Documentation
- **Start with**: `docs/app-overview.md` for project vision and features
- **For Development**: Read `docs/development-phases.md` for 6-8 month timeline
- **For Technical Setup**: Study `technical/architecture.md` for complete system design
- **For UI Implementation**: Reference `screens/` folder for detailed screen specifications
- **For Game Logic**: Each game in `games/` folder has complete implementation specs

### Document Cross-References
- Game specifications reference UI patterns from `technical/design-system.md`
- Screen specifications reference components from `technical/component-library.md`
- All technical docs assume architecture from `technical/architecture.md`
- Navigation flows detailed in `technical/navigation-system.md`
- Accessibility requirements span all documents per `technical/accessibility-implementation.md`

### Implementation Priority
1. **Phase 1 (Months 1-3)**: Focus on `technical/architecture.md`, `authentication/`, and `screens/01-welcome-screen.md`
2. **Phase 2 (Months 4-5)**: Implement all games per `games/` specifications
3. **Phase 3 (Months 6-7)**: Polish per `technical/performance-optimization.md` and accessibility guides

### Step-by-Step Implementation Order
Follow this exact order to build DeckZone from base React Native app to complete implementation:

#### Phase 1: Base App Setup (Week 1-2)
1. **Create Expo Project**: `npx create-expo-app DeckZone --template blank-typescript`
2. **Install Core Dependencies**: Follow `technical/architecture.md` dependency list
3. **Setup Project Structure**: Create folder structure per `technical/architecture.md`
4. **Configure TypeScript**: Setup strict TypeScript configuration
5. **Setup EAS**: Configure `app.json` and `eas.json` for builds

#### Phase 2: Design System & Foundation (Week 3-4)
6. **Implement Design System**: Build complete system from `technical/design-system.md`
7. **Create Base Components**: Implement atoms per `technical/component-library.md`
8. **Setup Theme Provider**: Dark/light mode and accessibility support
9. **Create Screen Templates**: Base layouts from `technical/component-library.md`
10. **Setup Safe Area Handling**: Proper iOS/Android safe areas

#### Phase 3: Navigation & State (Week 5-6)
11. **Implement Navigation**: TikTok-style navigation from `technical/navigation-system.md`
12. **Setup State Management**: Zustand stores from `technical/state-management.md`
13. **Create Navigation Structure**: Tab and stack navigators
14. **Add Gesture Handling**: Swipe navigation implementation
15. **Test Navigation Flow**: Ensure smooth transitions

#### Phase 4: Authentication (Week 7-8)
16. **Setup Firebase**: Configure Firebase project per `authentication/social-login-spec.md`
17. **Implement Auth Screens**: Welcome screen per `screens/01-welcome-screen.md`
18. **Add Social Login**: Google, Facebook, Apple Sign-In
19. **Create Guest Mode**: Temporary user functionality
20. **Test Authentication**: Complete auth flow testing

#### Phase 5: Core Game Interface (Week 9-10)
21. **Build Game Screen**: Core interface per `screens/03-game-screen.md`
22. **Implement Card Components**: Game card displays with accessibility
23. **Add Swipe Gestures**: Card navigation with animations
24. **Create Game Store**: Game session state management
25. **Test Card Interface**: Ensure 60fps performance

#### Phase 6: First Game Implementation (Week 11-12)
26. **Picture Charades Data**: Create JSON data per `games/picture-charades.md`
27. **Picture Charades UI**: Game-specific components
28. **Game Logic**: Timer, scoring, card progression
29. **Accessibility Testing**: Screen reader and keyboard support
30. **Performance Testing**: Memory and animation optimization

#### Phase 7: Additional Games (Week 13-16)
31. **Would You Rather**: Implement per `games/would-you-rather.md`
32. **Movie Mania**: Implement per `games/movie-mania.md`
33. **Ice Breakers**: Implement per `games/ice-breakers.md`
34. **Animal Kingdom**: Implement per `games/animal-kingdom.md`
35. **Test All Games**: Comprehensive game testing

#### Phase 8: User Features (Week 17-18)
36. **Profile Screen**: User stats per `screens/04-profile-screen.md`
37. **Settings Screen**: App config per `screens/05-settings-screen.md`
38. **Home Screen**: Game selection per `screens/02-home-screen.md`
39. **User Data Sync**: Firebase integration for user data
40. **Achievement System**: User progress tracking

#### Phase 9: Polish & Testing (Week 19-20)
41. **Performance Optimization**: Apply `technical/performance-optimization.md`
42. **Accessibility Audit**: Full `technical/accessibility-implementation.md` compliance
43. **E2E Testing**: Complete user flow testing
44. **Bug Fixes**: Address all discovered issues
45. **App Store Prep**: Screenshots, metadata, review prep

### Next Steps for Implementation
Start with Phase 1, Step 1: Create the base Expo project and begin building DeckZone systematically following this 45-step roadmap.

This planning documentation serves as the complete blueprint for implementing the DeckZone mobile application.