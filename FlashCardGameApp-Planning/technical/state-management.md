# State Management Documentation

## Overview
This document outlines the comprehensive state management architecture for the Flash Card Game Store application, implementing modern patterns for scalable, performant, and maintainable state handling across authentication, games, user preferences, and UI state.

## State Management Philosophy

### Core Principles
1. **Single Source of Truth**: Each piece of state has one authoritative source
2. **Predictable Updates**: State changes follow consistent, traceable patterns
3. **Performance Optimized**: Minimal re-renders and efficient subscriptions
4. **Offline-First**: State persists locally with cloud synchronization
5. **Type Safety**: Full TypeScript support for compile-time error prevention
6. **Testable**: Isolated, mockable state logic for comprehensive testing

### Architecture Strategy
- **Zustand**: Primary state management for application state
- **React Query**: Server state management and caching
- **AsyncStorage**: Local persistence layer
- **Context API**: Theme and user preferences
- **Reducer Pattern**: Complex state transitions in games

## State Architecture Overview

### State Domains
```
Application State
├── Authentication State
│   ├── User Identity
│   ├── Session Management
│   └── Authorization Status
│
├── Game State
│   ├── Current Game Session
│   ├── Card Navigation
│   ├── Timer & Scoring
│   └── Game Settings
│
├── User Data State
│   ├── Profile Information
│   ├── Game Statistics
│   ├── Achievements
│   └── Favorites
│
├── UI State
│   ├── Navigation State
│   ├── Modal States
│   ├── Loading States
│   └── Error Handling
│
└── App Preferences
    ├── Theme Settings
    ├── Accessibility Options
    ├── Notification Preferences
    └── Language Settings
```

## Core State Stores

### Authentication Store
```typescript
// stores/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthService } from '../services/authService'

interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  provider: 'google' | 'facebook' | 'apple' | 'guest'
  isEmailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
}

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isGuest: boolean
  error: string | null
  
  // Actions
  signIn: (provider: string) => Promise<void>
  signInAsGuest: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  clearError: () => void
  deleteAccount: () => Promise<void>
  linkAccount: (provider: string) => Promise<void>
  
  // Selectors
  getUserDisplayName: () => string
  isProfileComplete: () => boolean
  getAuthProvider: () => string
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isGuest: false,
      error: null,
      
      // Actions
      signIn: async (provider: string) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })
        
        try {
          const user = await AuthService.signIn(provider)
          set((state) => {
            state.user = user
            state.isAuthenticated = true
            state.isGuest = false
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
            state.isLoading = false
          })
        }
      },
      
      signInAsGuest: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })
        
        try {
          const guestUser = await AuthService.createGuestSession()
          set((state) => {
            state.user = guestUser
            state.isAuthenticated = true
            state.isGuest = true
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
            state.isLoading = false
          })
        }
      },
      
      signOut: async () => {
        try {
          await AuthService.signOut()
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.isGuest = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
          })
        }
      },
      
      updateProfile: async (updates: Partial<User>) => {
        const { user } = get()
        if (!user) return
        
        try {
          const updatedUser = await AuthService.updateProfile(user.uid, updates)
          set((state) => {
            state.user = updatedUser
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
          })
        }
      },
      
      clearError: () => {
        set((state) => {
          state.error = null
        })
      },
      
      deleteAccount: async () => {
        const { user } = get()
        if (!user) return
        
        try {
          await AuthService.deleteAccount(user.uid)
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.isGuest = false
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
          })
        }
      },
      
      linkAccount: async (provider: string) => {
        const { user } = get()
        if (!user || !get().isGuest) return
        
        try {
          const linkedUser = await AuthService.linkAccount(user.uid, provider)
          set((state) => {
            state.user = linkedUser
            state.isGuest = false
          })
        } catch (error) {
          set((state) => {
            state.error = error.message
          })
        }
      },
      
      // Selectors
      getUserDisplayName: () => {
        const { user } = get()
        return user?.displayName || user?.email?.split('@')[0] || 'Guest User'
      },
      
      isProfileComplete: () => {
        const { user } = get()
        return !!(user?.displayName && user?.email)
      },
      
      getAuthProvider: () => {
        const { user } = get()
        return user?.provider || 'none'
      },
    })),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
)
```

### Game State Store
```typescript
// stores/gameStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface GameCard {
  id: string
  type: 'text' | 'image' | 'choice'
  title: string
  content: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  imageUrl?: string
  imageAlt?: string
  instructions?: string
  hint?: string
  metadata: Record<string, any>
}

interface GameSession {
  id: string
  gameId: string
  startTime: Date
  endTime?: Date
  cardsViewed: number
  cardsCompleted: number
  score: number
  difficulty: string
  settings: GameSettings
}

interface GameSettings {
  timerEnabled: boolean
  timerDuration: number
  soundEnabled: boolean
  hapticsEnabled: boolean
  autoAdvance: boolean
  showHints: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

interface GameState {
  // Current game session
  currentSession: GameSession | null
  currentCardIndex: number
  cards: GameCard[]
  
  // Game state
  isPlaying: boolean
  isPaused: boolean
  isRevealed: boolean
  timer: number
  score: number
  
  // Settings
  settings: GameSettings
  
  // Actions
  startGame: (gameId: string, cards: GameCard[]) => void
  pauseGame: () => void
  resumeGame: () => void
  endGame: () => void
  nextCard: () => void
  previousCard: () => void
  revealCard: () => void
  hideCard: () => void
  updateScore: (points: number) => void
  updateSettings: (settings: Partial<GameSettings>) => void
  resetTimer: () => void
  tickTimer: () => void
  
  // Selectors
  getCurrentCard: () => GameCard | null
  getProgress: () => { current: number; total: number; percentage: number }
  canGoNext: () => boolean
  canGoPrevious: () => boolean
  getSessionDuration: () => number
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      currentSession: null,
      currentCardIndex: 0,
      cards: [],
      isPlaying: false,
      isPaused: false,
      isRevealed: false,
      timer: 60,
      score: 0,
      
      settings: {
        timerEnabled: true,
        timerDuration: 60,
        soundEnabled: true,
        hapticsEnabled: true,
        autoAdvance: false,
        showHints: true,
        difficulty: 'medium',
      },
      
      // Actions
      startGame: (gameId: string, cards: GameCard[]) => {
        set((state) => {
          const session: GameSession = {
            id: `session_${Date.now()}`,
            gameId,
            startTime: new Date(),
            cardsViewed: 0,
            cardsCompleted: 0,
            score: 0,
            difficulty: state.settings.difficulty,
            settings: { ...state.settings },
          }
          
          state.currentSession = session
          state.cards = cards
          state.currentCardIndex = 0
          state.isPlaying = true
          state.isPaused = false
          state.isRevealed = false
          state.timer = state.settings.timerDuration
          state.score = 0
        })
      },
      
      pauseGame: () => {
        set((state) => {
          state.isPaused = true
        })
      },
      
      resumeGame: () => {
        set((state) => {
          state.isPaused = false
        })
      },
      
      endGame: () => {
        set((state) => {
          if (state.currentSession) {
            state.currentSession.endTime = new Date()
            state.currentSession.cardsViewed = state.currentCardIndex + 1
            state.currentSession.score = state.score
          }
          
          state.isPlaying = false
          state.isPaused = false
        })
      },
      
      nextCard: () => {
        set((state) => {
          const { cards, currentCardIndex } = state
          
          if (currentCardIndex < cards.length - 1) {
            state.currentCardIndex += 1
            state.isRevealed = false
            state.timer = state.settings.timerDuration
            
            if (state.currentSession) {
              state.currentSession.cardsViewed = Math.max(
                state.currentSession.cardsViewed,
                state.currentCardIndex + 1
              )
            }
          }
        })
      },
      
      previousCard: () => {
        set((state) => {
          if (state.currentCardIndex > 0) {
            state.currentCardIndex -= 1
            state.isRevealed = false
            state.timer = state.settings.timerDuration
          }
        })
      },
      
      revealCard: () => {
        set((state) => {
          state.isRevealed = true
        })
      },
      
      hideCard: () => {
        set((state) => {
          state.isRevealed = false
        })
      },
      
      updateScore: (points: number) => {
        set((state) => {
          state.score += points
          
          if (state.currentSession) {
            state.currentSession.score = state.score
          }
        })
      },
      
      updateSettings: (newSettings: Partial<GameSettings>) => {
        set((state) => {
          state.settings = { ...state.settings, ...newSettings }
          
          // Update timer if duration changed
          if (newSettings.timerDuration) {
            state.timer = newSettings.timerDuration
          }
        })
      },
      
      resetTimer: () => {
        set((state) => {
          state.timer = state.settings.timerDuration
        })
      },
      
      tickTimer: () => {
        set((state) => {
          if (state.timer > 0) {
            state.timer -= 1
          }
        })
      },
      
      // Selectors
      getCurrentCard: () => {
        const { cards, currentCardIndex } = get()
        return cards[currentCardIndex] || null
      },
      
      getProgress: () => {
        const { currentCardIndex, cards } = get()
        const current = currentCardIndex + 1
        const total = cards.length
        const percentage = total > 0 ? (current / total) * 100 : 0
        
        return { current, total, percentage }
      },
      
      canGoNext: () => {
        const { currentCardIndex, cards } = get()
        return currentCardIndex < cards.length - 1
      },
      
      canGoPrevious: () => {
        const { currentCardIndex } = get()
        return currentCardIndex > 0
      },
      
      getSessionDuration: () => {
        const { currentSession } = get()
        if (!currentSession) return 0
        
        const endTime = currentSession.endTime || new Date()
        return endTime.getTime() - currentSession.startTime.getTime()
      },
    }))
  )
)

// Timer subscription for automatic countdown
useGameStore.subscribe(
  (state) => ({
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    timer: state.timer,
    timerEnabled: state.settings.timerEnabled,
  }),
  (state) => {
    if (state.isPlaying && !state.isPaused && state.timerEnabled && state.timer > 0) {
      const interval = setInterval(() => {
        useGameStore.getState().tickTimer()
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }
)
```

### User Data Store
```typescript
// stores/userDataStore.ts
interface UserStatistics {
  totalGamesPlayed: number
  totalCardsViewed: number
  totalTimePlayed: number // in seconds
  gamesPlayedByType: Record<string, number>
  favoriteGames: string[]
  achievements: Achievement[]
  streaks: {
    current: number
    longest: number
    lastPlayDate: Date
  }
  preferences: {
    preferredDifficulty: string
    preferredCategories: string[]
    avgSessionLength: number
  }
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  type: 'milestone' | 'streak' | 'variety' | 'time' | 'social'
  progress?: {
    current: number
    target: number
  }
}

interface UserDataState {
  // User statistics
  statistics: UserStatistics
  achievements: Achievement[]
  favorites: string[]
  
  // Loading states
  isLoading: boolean
  lastSynced: Date | null
  syncError: string | null
  
  // Actions
  updateStatistics: (update: Partial<UserStatistics>) => void
  addGameSession: (session: GameSession) => void
  toggleFavorite: (gameId: string) => void
  unlockAchievement: (achievementId: string) => void
  syncWithCloud: () => Promise<void>
  exportUserData: () => Promise<string>
  importUserData: (data: string) => Promise<void>
  
  // Selectors
  getAchievementProgress: (achievementId: string) => number
  getFavoriteGames: () => string[]
  getPlayTimeByGame: () => Record<string, number>
  getCurrentStreak: () => number
}

export const useUserDataStore = create<UserDataState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      statistics: {
        totalGamesPlayed: 0,
        totalCardsViewed: 0,
        totalTimePlayed: 0,
        gamesPlayedByType: {},
        favoriteGames: [],
        achievements: [],
        streaks: {
          current: 0,
          longest: 0,
          lastPlayDate: new Date(),
        },
        preferences: {
          preferredDifficulty: 'medium',
          preferredCategories: [],
          avgSessionLength: 0,
        },
      },
      achievements: [],
      favorites: [],
      isLoading: false,
      lastSynced: null,
      syncError: null,
      
      // Actions
      updateStatistics: (update: Partial<UserStatistics>) => {
        set((state) => {
          state.statistics = { ...state.statistics, ...update }
        })
      },
      
      addGameSession: (session: GameSession) => {
        set((state) => {
          const stats = state.statistics
          
          // Update basic statistics
          stats.totalGamesPlayed += 1
          stats.totalCardsViewed += session.cardsViewed
          
          if (session.endTime && session.startTime) {
            const sessionDuration = session.endTime.getTime() - session.startTime.getTime()
            stats.totalTimePlayed += Math.floor(sessionDuration / 1000)
          }
          
          // Update game type statistics
          if (!stats.gamesPlayedByType[session.gameId]) {
            stats.gamesPlayedByType[session.gameId] = 0
          }
          stats.gamesPlayedByType[session.gameId] += 1
          
          // Update streaks
          const today = new Date().toDateString()
          const lastPlayDate = stats.streaks.lastPlayDate.toDateString()
          
          if (today === lastPlayDate) {
            // Same day, don't change streak
          } else if (new Date(today).getTime() - new Date(lastPlayDate).getTime() === 86400000) {
            // Next day, increment streak
            stats.streaks.current += 1
            stats.streaks.longest = Math.max(stats.streaks.longest, stats.streaks.current)
          } else {
            // Streak broken, reset
            stats.streaks.current = 1
          }
          
          stats.streaks.lastPlayDate = new Date()
          
          // Update preferences
          const totalSessions = stats.totalGamesPlayed
          const totalTime = stats.totalTimePlayed
          stats.preferences.avgSessionLength = totalTime / totalSessions
        })
      },
      
      toggleFavorite: (gameId: string) => {
        set((state) => {
          const currentFavorites = state.favorites
          const index = currentFavorites.indexOf(gameId)
          
          if (index >= 0) {
            state.favorites.splice(index, 1)
          } else {
            state.favorites.push(gameId)
          }
          
          state.statistics.favoriteGames = [...state.favorites]
        })
      },
      
      unlockAchievement: (achievementId: string) => {
        set((state) => {
          const existing = state.achievements.find(a => a.id === achievementId)
          if (existing) return
          
          // This would typically fetch achievement details from a service
          const achievement: Achievement = {
            id: achievementId,
            name: 'Achievement Name',
            description: 'Achievement Description',
            icon: 'trophy',
            unlockedAt: new Date(),
            type: 'milestone',
          }
          
          state.achievements.push(achievement)
        })
      },
      
      syncWithCloud: async () => {
        const { user } = useAuthStore.getState()
        if (!user || useAuthStore.getState().isGuest) return
        
        set((state) => {
          state.isLoading = true
          state.syncError = null
        })
        
        try {
          // Implement cloud sync logic here
          await new Promise(resolve => setTimeout(resolve, 1000)) // Mock sync
          
          set((state) => {
            state.lastSynced = new Date()
            state.isLoading = false
          })
        } catch (error) {
          set((state) => {
            state.syncError = error.message
            state.isLoading = false
          })
        }
      },
      
      exportUserData: async () => {
        const state = get()
        const exportData = {
          statistics: state.statistics,
          achievements: state.achievements,
          favorites: state.favorites,
          exportDate: new Date().toISOString(),
        }
        
        return JSON.stringify(exportData, null, 2)
      },
      
      importUserData: async (data: string) => {
        try {
          const importData = JSON.parse(data)
          
          set((state) => {
            state.statistics = importData.statistics || state.statistics
            state.achievements = importData.achievements || state.achievements
            state.favorites = importData.favorites || state.favorites
          })
        } catch (error) {
          throw new Error('Invalid import data format')
        }
      },
      
      // Selectors
      getAchievementProgress: (achievementId: string) => {
        const achievement = get().achievements.find(a => a.id === achievementId)
        if (!achievement?.progress) return 100
        
        return (achievement.progress.current / achievement.progress.target) * 100
      },
      
      getFavoriteGames: () => {
        return get().favorites
      },
      
      getPlayTimeByGame: () => {
        const { statistics } = get()
        // This would calculate play time per game from session data
        return statistics.gamesPlayedByType
      },
      
      getCurrentStreak: () => {
        return get().statistics.streaks.current
      },
    })),
    {
      name: 'user-data-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

## UI State Management

### Modal and Navigation State
```typescript
// stores/uiStore.ts
interface ModalState {
  isVisible: boolean
  type: 'settings' | 'share' | 'achievement' | 'help' | 'confirmation'
  data?: any
  onClose?: () => void
}

interface NotificationState {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    onPress: () => void
  }>
}

interface UIState {
  // Modal management
  modals: Record<string, ModalState>
  
  // Notifications
  notifications: NotificationState[]
  
  // Loading states
  globalLoading: boolean
  loadingMessages: string[]
  
  // Error handling
  errors: Record<string, string>
  
  // Navigation state
  currentScreen: string
  navigationHistory: string[]
  
  // Actions
  showModal: (id: string, modal: Omit<ModalState, 'isVisible'>) => void
  hideModal: (id: string) => void
  hideAllModals: () => void
  
  showNotification: (notification: Omit<NotificationState, 'id'>) => string
  hideNotification: (id: string) => void
  clearNotifications: () => void
  
  setGlobalLoading: (loading: boolean, message?: string) => void
  setError: (key: string, error: string) => void
  clearError: (key: string) => void
  clearAllErrors: () => void
  
  setCurrentScreen: (screen: string) => void
  navigateBack: () => string | null
}

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    // Initial state
    modals: {},
    notifications: [],
    globalLoading: false,
    loadingMessages: [],
    errors: {},
    currentScreen: 'Home',
    navigationHistory: [],
    
    // Actions
    showModal: (id: string, modal: Omit<ModalState, 'isVisible'>) => {
      set((state) => {
        state.modals[id] = { ...modal, isVisible: true }
      })
    },
    
    hideModal: (id: string) => {
      set((state) => {
        if (state.modals[id]) {
          state.modals[id].isVisible = false
          state.modals[id].onClose?.()
        }
      })
    },
    
    hideAllModals: () => {
      set((state) => {
        Object.keys(state.modals).forEach(id => {
          state.modals[id].isVisible = false
          state.modals[id].onClose?.()
        })
      })
    },
    
    showNotification: (notification: Omit<NotificationState, 'id'>) => {
      const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      set((state) => {
        state.notifications.push({ ...notification, id })
      })
      
      // Auto-hide notification after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          get().hideNotification(id)
        }, notification.duration || 5000)
      }
      
      return id
    },
    
    hideNotification: (id: string) => {
      set((state) => {
        const index = state.notifications.findIndex(n => n.id === id)
        if (index >= 0) {
          state.notifications.splice(index, 1)
        }
      })
    },
    
    clearNotifications: () => {
      set((state) => {
        state.notifications = []
      })
    },
    
    setGlobalLoading: (loading: boolean, message?: string) => {
      set((state) => {
        state.globalLoading = loading
        
        if (loading && message) {
          state.loadingMessages.push(message)
        } else if (!loading) {
          state.loadingMessages = []
        }
      })
    },
    
    setError: (key: string, error: string) => {
      set((state) => {
        state.errors[key] = error
      })
    },
    
    clearError: (key: string) => {
      set((state) => {
        delete state.errors[key]
      })
    },
    
    clearAllErrors: () => {
      set((state) => {
        state.errors = {}
      })
    },
    
    setCurrentScreen: (screen: string) => {
      set((state) => {
        state.navigationHistory.push(state.currentScreen)
        state.currentScreen = screen
        
        // Limit history to last 10 screens
        if (state.navigationHistory.length > 10) {
          state.navigationHistory = state.navigationHistory.slice(-10)
        }
      })
    },
    
    navigateBack: () => {
      const { navigationHistory } = get()
      const previousScreen = navigationHistory.pop()
      
      if (previousScreen) {
        set((state) => {
          state.currentScreen = previousScreen
        })
      }
      
      return previousScreen || null
    },
  }))
)
```

## Server State Management with React Query

### Query Configuration
```typescript
// queries/queryClient.ts
import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client-core'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})
```

### Game Content Queries
```typescript
// queries/gameQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GameService } from '../services/gameService'

export const useGameContent = (gameId: string, difficulty: string) => {
  return useQuery({
    queryKey: ['game-content', gameId, difficulty],
    queryFn: () => GameService.getGameContent(gameId, difficulty),
    enabled: !!gameId,
    staleTime: 30 * 60 * 1000, // 30 minutes (game content doesn't change often)
  })
}

export const useGameCategories = () => {
  return useQuery({
    queryKey: ['game-categories'],
    queryFn: GameService.getGameCategories,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useSubmitGameSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: GameService.submitGameSession,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      
      // Optimistically update user statistics
      queryClient.setQueryData(['user-statistics'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            totalGamesPlayed: oldData.totalGamesPlayed + 1,
            totalCardsViewed: oldData.totalCardsViewed + variables.cardsViewed,
          }
        }
        return oldData
      })
    },
    onError: (error) => {
      useUIStore.getState().showNotification({
        type: 'error',
        title: 'Failed to save game session',
        message: 'Your progress may not be saved. Please check your connection.',
      })
    },
  })
}
```

## State Persistence Strategy

### Persistence Configuration
```typescript
// utils/persistence.ts
interface PersistenceConfig {
  key: string
  storage: any
  whitelist?: string[]
  blacklist?: string[]
  serialize?: (data: any) => string
  deserialize?: (data: string) => any
}

export const createPersistenceConfig = (key: string): PersistenceConfig => ({
  key,
  storage: AsyncStorage,
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
})

// Store-specific persistence configurations
export const authPersistenceConfig = createPersistenceConfig('auth-store')
export const userDataPersistenceConfig = createPersistenceConfig('user-data-store')
export const gameSettingsPersistenceConfig = createPersistenceConfig('game-settings-store')
```

### Offline/Online Sync
```typescript
// hooks/useOfflineSync.ts
import { useEffect } from 'react'
import NetInfo from '@react-native-netinfo'
import { useQueryClient } from '@tanstack/react-query'

export const useOfflineSync = () => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // Refetch important queries when coming back online
        queryClient.invalidateQueries({ queryKey: ['user-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['achievements'] })
        
        // Sync local changes with cloud
        useUserDataStore.getState().syncWithCloud()
      }
    })
    
    return unsubscribe
  }, [queryClient])
}
```

## State Testing Strategy

### Store Testing
```typescript
// __tests__/stores/gameStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useGameStore } from '../stores/gameStore'

describe('Game Store', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentSession: null,
      currentCardIndex: 0,
      cards: [],
      isPlaying: false,
      isPaused: false,
    })
  })
  
  it('should start a game correctly', () => {
    const { result } = renderHook(() => useGameStore())
    const mockCards = [
      { id: '1', title: 'Card 1', content: 'Test content' },
      { id: '2', title: 'Card 2', content: 'Test content 2' },
    ]
    
    act(() => {
      result.current.startGame('test-game', mockCards)
    })
    
    expect(result.current.isPlaying).toBe(true)
    expect(result.current.cards).toEqual(mockCards)
    expect(result.current.currentCardIndex).toBe(0)
    expect(result.current.currentSession).toBeTruthy()
  })
  
  it('should navigate cards correctly', () => {
    const { result } = renderHook(() => useGameStore())
    const mockCards = [
      { id: '1', title: 'Card 1' },
      { id: '2', title: 'Card 2' },
    ]
    
    act(() => {
      result.current.startGame('test-game', mockCards)
    })
    
    act(() => {
      result.current.nextCard()
    })
    
    expect(result.current.currentCardIndex).toBe(1)
    
    act(() => {
      result.current.previousCard()
    })
    
    expect(result.current.currentCardIndex).toBe(0)
  })
})
```

### Integration Testing
```typescript
// __tests__/integration/stateFlow.test.ts
describe('State Flow Integration', () => {
  it('should handle complete game flow', async () => {
    // Test authentication -> game start -> game play -> game end -> statistics update
    const authStore = useAuthStore.getState()
    const gameStore = useGameStore.getState()
    const userDataStore = useUserDataStore.getState()
    
    // Authenticate user
    await authStore.signInAsGuest()
    expect(authStore.isAuthenticated).toBe(true)
    
    // Start game
    const mockCards = [{ id: '1', title: 'Test' }]
    gameStore.startGame('test-game', mockCards)
    expect(gameStore.isPlaying).toBe(true)
    
    // Complete game
    gameStore.endGame()
    expect(gameStore.isPlaying).toBe(false)
    
    // Check statistics update
    userDataStore.addGameSession(gameStore.currentSession!)
    expect(userDataStore.statistics.totalGamesPlayed).toBe(1)
  })
})
```

This comprehensive state management system provides a robust foundation for the Flash Card Game Store application, ensuring data consistency, optimal performance, and a great user experience across all features and platforms.