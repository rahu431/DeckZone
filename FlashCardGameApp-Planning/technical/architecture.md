# Technical Architecture & Data Structure

## System Architecture Overview

### Frontend Architecture
```
┌─────────────────────────────────────┐
│             React Native App       │
│  ┌─────────────────────────────────┐│
│  │          Expo SDK 49+          ││
│  │  ┌─────────────────────────────┐││
│  │  │      App Components        │││
│  │  │  ┌─────────────────────────┐│││
│  │  │  │    Screen Components   ││││
│  │  │  │    Game Components     ││││
│  │  │  │    UI Components       ││││
│  │  │  └─────────────────────────┘│││
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Backend Services
```
┌─────────────────────────────────────┐
│         Firebase Services          │
│  ┌─────────────────────────────────┐│
│  │     Firebase Auth             ││
│  │  • Google, Facebook, Apple     ││
│  │  • JWT token management        ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     Firebase Firestore        ││
│  │  • User profiles & settings    ││
│  │  • Game statistics & progress  ││
│  │  • Favorites & achievements    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │     Firebase Analytics        ││
│  │  • User behavior tracking      ││
│  │  • App performance metrics     ││
│  │  • Custom events logging       ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Data Architecture

### Local Data Storage
```typescript
// AsyncStorage Structure
{
  // User preferences (offline-first)
  userPreferences: {
    theme: 'dark' | 'light' | 'auto',
    language: string,
    soundEnabled: boolean,
    vibrationEnabled: boolean,
    defaultTimer: number,
    difficulty: 'easy' | 'medium' | 'hard'
  },
  
  // Game content (bundled with app)
  gameContent: {
    pictureCharades: GameCard[],
    wouldYouRather: GameCard[],
    movieMania: GameCard[],
    iceBreakers: GameCard[],
    animalKingdom: GameCard[]
  },
  
  // User session data
  sessionData: {
    currentGame: string,
    currentCardIndex: number,
    gameHistory: GameSession[],
    favorites: string[],
    statistics: UserStatistics
  }
}
```

### Cloud Data Structure (Firestore)
```typescript
// Collections structure
{
  // Users collection
  users: {
    [uid: string]: {
      email: string,
      displayName: string,
      photoURL: string,
      provider: 'google' | 'facebook' | 'apple',
      createdAt: Timestamp,
      lastLoginAt: Timestamp,
      preferences: UserPreferences,
      statistics: UserStatistics
    }
  },
  
  // User games subcollection
  'users/{uid}/games': {
    [gameId: string]: GameSession
  },
  
  // User favorites subcollection
  'users/{uid}/favorites': {
    [cardId: string]: FavoriteCard
  }
}
```

## Component Architecture

### App Component Hierarchy
```
App
├── AuthProvider
│   ├── WelcomeScreen
│   └── AuthenticatedApp
│       ├── NavigationContainer
│       │   ├── TabNavigator
│       │   │   ├── HomeStack
│       │   │   │   ├── HomeScreen
│       │   │   │   ├── GameScreen
│       │   │   │   └── GameDetailScreen
│       │   │   ├── ProfileStack
│       │   │   │   ├── ProfileScreen
│       │   │   │   └── EditProfileScreen
│       │   │   └── SettingsStack
│       │   │       ├── SettingsScreen
│       │   │       └── SettingsDetailScreen
│       │   └── ModalStack
│       │       ├── GameSettingsModal
│       │       ├── ShareModal
│       │       └── AchievementModal
│       ├── GameProvider
│       ├── ThemeProvider
│       └── NotificationProvider
```

### State Management Architecture
```typescript
// Context-based state management
interface AppState {
  // Authentication state
  auth: {
    user: User | null,
    loading: boolean,
    error: string | null
  },
  
  // Game state
  game: {
    currentGame: string | null,
    currentCard: GameCard | null,
    cardIndex: number,
    gameSession: GameSession | null,
    timer: number,
    isPaused: boolean
  },
  
  // User preferences
  preferences: {
    theme: Theme,
    language: string,
    soundEnabled: boolean,
    defaultTimer: number,
    difficulty: Difficulty
  },
  
  // UI state
  ui: {
    loading: boolean,
    error: string | null,
    notifications: Notification[],
    modals: ModalState
  }
}
```

## Data Models

### Core Data Types
```typescript
// User models
interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: 'google' | 'facebook' | 'apple' | 'guest';
  createdAt: Date;
  lastLoginAt: Date;
}

interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultTimer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  notificationsEnabled: boolean;
}

interface UserStatistics {
  totalGamesPlayed: number;
  totalCardsViewed: number;
  totalTimePlayed: number; // seconds
  gamesPlayedByType: Record<string, number>;
  achievements: Achievement[];
  favoriteGames: string[];
}

// Game models
interface GameCard {
  id: string;
  game: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  content: GameContent;
  metadata: CardMetadata;
}

interface GameContent {
  // Picture Charades
  image?: string;
  answer?: string;
  hint?: string;
  actingHints?: string[];
  
  // Would You Rather
  question?: string;
  optionA?: string;
  optionB?: string;
  context?: string;
  
  // Movie Mania
  title?: string;
  prompt?: string;
  funFact?: string;
  year?: number;
  genre?: string;
  
  // Ice Breakers
  instructions?: string;
  followUp?: string;
  timeEstimate?: string;
  
  // Animal Kingdom
  animal?: string;
  habitat?: string;
  soundHint?: string;
  funFacts?: string[];
}

interface CardMetadata {
  tags: string[];
  ageRating: 'everyone' | 'teen' | 'adult';
  groupSize: string;
  duration: number;
  popularity: number;
}

interface GameSession {
  id: string;
  game: string;
  startTime: Date;
  endTime?: Date;
  cardsViewed: number;
  cardsCompleted: number;
  totalTime: number;
  difficulty: string;
  score?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'milestone' | 'streak' | 'variety' | 'time';
}
```

## API Integration

### Firebase Configuration
```typescript
// Firebase config
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Service initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);
```

### API Service Layer
```typescript
// Authentication service
class AuthService {
  async signInWithGoogle(): Promise<User>;
  async signInWithFacebook(): Promise<User>;
  async signInWithApple(): Promise<User>;
  async signOut(): Promise<void>;
  async deleteAccount(): Promise<void>;
}

// User data service
class UserService {
  async getUserProfile(uid: string): Promise<UserProfile>;
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void>;
  async getUserStatistics(uid: string): Promise<UserStatistics>;
  async updateUserStatistics(uid: string, stats: UserStatistics): Promise<void>;
}

// Game service
class GameService {
  async getGameContent(game: string): Promise<GameCard[]>;
  async recordGameSession(uid: string, session: GameSession): Promise<void>;
  async getFavoriteCards(uid: string): Promise<string[]>;
  async updateFavoriteCards(uid: string, cardIds: string[]): Promise<void>;
}
```

## Security Architecture

### Authentication Flow
```
User Device                  Firebase Auth                 App Backend
     │                           │                             │
     │─── Social Login ──────────▶│                             │
     │                           │                             │
     │◀─── Auth Token ───────────│                             │
     │                           │                             │
     │─── API Request ───────────│──── Verify Token ──────────▶│
     │                           │                             │
     │◀─── Response ─────────────│◀─── Valid Response ────────│
```

### Data Security
- **Encryption**: All sensitive data encrypted at rest
- **Token Management**: JWT tokens with refresh mechanism
- **API Security**: Firebase security rules for data access
- **Privacy**: Minimal data collection, user consent
- **Compliance**: GDPR, CCPA compliance measures

## Performance Architecture

### Optimization Strategies
1. **Bundle Optimization**
   - Code splitting for game content
   - Lazy loading of non-essential components
   - Image optimization and compression
   - Asset bundling strategies

2. **Memory Management**
   - Efficient component lifecycle management
   - Image caching with size limits
   - Garbage collection optimization
   - Memory leak prevention

3. **Network Optimization**
   - Offline-first architecture
   - Efficient data synchronization
   - Caching strategies
   - Network retry mechanisms

4. **Rendering Optimization**
   - FlatList for large datasets
   - Memoization for expensive calculations
   - Optimized animation performance
   - Gesture handler optimization

## Deployment Architecture

### Build Process
```yaml
# Expo Application Services (EAS)
build:
  preview:
    distribution: internal
    ios:
      simulator: true
    android:
      buildType: apk
  
  production:
    distribution: store
    ios:
      bundleIdentifier: com.flashcardgame.app
    android:
      buildType: aab
```

### Environment Management
- **Development**: Local development with Firebase emulator
- **Staging**: Testing environment with limited Firebase resources
- **Production**: Live environment with full Firebase project
- **Analytics**: Environment-specific analytics tracking

## Scalability Considerations

### Horizontal Scaling
- **Content Delivery**: CDN for game assets
- **Database**: Firestore automatic scaling
- **Authentication**: Firebase Auth scaling
- **Analytics**: Firebase Analytics scaling

### Performance Monitoring
- **Crash Reporting**: Firebase Crashlytics
- **Performance**: Firebase Performance Monitoring
- **Analytics**: Custom metrics tracking
- **User Feedback**: In-app feedback collection

### Future Expansion
- **Content Management**: Admin panel for game content
- **Multiplayer**: Real-time multiplayer features
- **Social Features**: Friend system, leaderboards
- **Monetization**: In-app purchases, premium content