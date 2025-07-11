# Navigation System Documentation

## Overview
This document outlines the complete navigation architecture for the Flash Card Game Store application, implementing TikTok-style gesture-based navigation with accessibility, performance, and platform-specific optimizations.

## Navigation Philosophy

### Core Principles
1. **Gesture-First**: Primary navigation through intuitive swipe gestures
2. **Contextual**: Navigation adapts to current game state and user context
3. **Accessible**: Full keyboard and screen reader navigation support
4. **Performant**: Smooth 60fps transitions with optimized animations
5. **Predictable**: Consistent navigation patterns across all screens

### Navigation Patterns
- **Vertical Swiping**: Primary card navigation (up/down)
- **Horizontal Gestures**: Secondary actions (like, share, settings)
- **Tab Navigation**: Main app sections (Home, Games, Profile)
- **Modal Presentation**: Settings, help, and temporary content
- **Stack Navigation**: Hierarchical content navigation

## Architecture Overview

### Navigation Stack Structure
```
Root Navigator (Stack)
├── Auth Stack
│   ├── Welcome Screen
│   ├── Login Screen
│   └── Onboarding Flow
│
├── Main Tab Navigator
│   ├── Home Stack
│   │   ├── Home Screen
│   │   ├── Game Selection
│   │   └── Game Categories
│   │
│   ├── Game Stack
│   │   ├── Game Interface
│   │   ├── Game Settings
│   │   └── Game Results
│   │
│   ├── Profile Stack
│   │   ├── Profile Screen
│   │   ├── Statistics
│   │   ├── Achievements
│   │   └── Edit Profile
│   │
│   └── Settings Stack
│       ├── Settings Screen
│       ├── Preferences
│       ├── About
│       └── Help
│
└── Modal Stack
    ├── Game Settings Modal
    ├── Share Modal
    ├── Achievement Modal
    └── Help Modal
```

## Implementation

### Root Navigation Setup
```typescript
// navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthState } from '../hooks/useAuthState'
import { AuthStack } from './AuthStack'
import { MainNavigator } from './MainNavigator'
import { navigationTheme } from '../theme/navigation'

const Stack = createNativeStackNavigator()

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthState()
  
  if (isLoading) {
    return <SplashScreen />
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        >
          {isAuthenticated ? (
            <Stack.Screen
              name="Main"
              component={MainNavigator}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
          ) : (
            <Stack.Screen
              name="Auth"
              component={AuthStack}
              options={{
                animationTypeForReplace: 'pop',
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}
```

### Main Tab Navigator
```typescript
// navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HomeStack } from './HomeStack'
import { GameStack } from './GameStack'
import { ProfileStack } from './ProfileStack'
import { SettingsStack } from './SettingsStack'
import { TabBar } from '../components/navigation/TabBar'

const Tab = createBottomTabNavigator()

export const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets()
  
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        lazy: true,
        unmountOnBlur: false,
      }}
      sceneContainerStyle={{
        backgroundColor: 'transparent',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: 'home',
          tabBarTestID: 'home-tab',
        }}
      />
      
      <Tab.Screen
        name="Games"
        component={GameStack}
        options={{
          tabBarLabel: 'Games',
          tabBarIcon: 'gamepad',
          tabBarTestID: 'games-tab',
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: 'user',
          tabBarTestID: 'profile-tab',
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: 'settings',
          tabBarTestID: 'settings-tab',
        }}
      />
    </Tab.Navigator>
  )
}
```

### Game Stack with Card Navigation
```typescript
// navigation/GameStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CardStackNavigator } from './CardStackNavigator'
import { GameSelectionScreen } from '../screens/GameSelectionScreen'
import { GameResultsScreen } from '../screens/GameResultsScreen'

const Stack = createNativeStackNavigator()

export const GameStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'card',
      }}
    >
      <Stack.Screen
        name="GameSelection"
        component={GameSelectionScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen
        name="GamePlay"
        component={CardStackNavigator}
        options={{
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animationDuration: 300,
          presentation: 'fullScreenModal',
        }}
      />
      
      <Stack.Screen
        name="GameResults"
        component={GameResultsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  )
}
```

### Card Stack Navigator (TikTok-style)
```typescript
// navigation/CardStackNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack'
import { CardTransition } from './transitions/CardTransition'
import { GameScreen } from '../screens/GameScreen'

const Stack = createStackNavigator()

export const CardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'vertical',
        cardStyleInterpolator: CardTransition,
        transitionSpec: {
          open: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
          close: {
            animation: 'spring',
            config: {
              stiffness: 1000,
              damping: 500,
              mass: 3,
              overshootClamping: true,
              restDisplacementThreshold: 0.01,
              restSpeedThreshold: 0.01,
            },
          },
        },
      }}
    >
      <Stack.Screen name="GameScreen" component={GameScreen} />
    </Stack.Navigator>
  )
}
```

## Gesture-Based Navigation

### Card Swipe Navigation Hook
```typescript
// hooks/useCardNavigation.ts
import { useSharedValue, useAnimatedGestureHandler, useAnimatedStyle, runOnJS, withSpring } from 'react-native-reanimated'
import { PanGestureHandler } from 'react-native-gesture-handler'

interface UseCardNavigationProps {
  onSwipeUp: () => void
  onSwipeDown: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  enabled?: boolean
}

export const useCardNavigation = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  threshold = 150,
  enabled = true,
}: UseCardNavigationProps) => {
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  const rotation = useSharedValue(0)
  
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value
      context.startY = translateY.value
    },
    
    onActive: (event, context) => {
      if (!enabled) return
      
      translateX.value = context.startX + event.translationX
      translateY.value = context.startY + event.translationY
      
      // Calculate progress for visual feedback
      const progressX = Math.abs(event.translationX) / 300
      const progressY = Math.abs(event.translationY) / 300
      const progress = Math.max(progressX, progressY)
      
      // Apply visual effects
      scale.value = 1 - progress * 0.1
      opacity.value = 1 - progress * 0.3
      rotation.value = (event.translationX / 300) * 10 // Max 10 degrees
    },
    
    onEnd: (event) => {
      if (!enabled) return
      
      const velocityThreshold = 1000
      const distanceThreshold = threshold
      
      const absX = Math.abs(event.translationX)
      const absY = Math.abs(event.translationY)
      const absVelocityX = Math.abs(event.velocityX)
      const absVelocityY = Math.abs(event.velocityY)
      
      // Determine swipe direction
      let swipeDetected = false
      
      // Vertical swipes (primary navigation)
      if (absY > absX && (absY > distanceThreshold || absVelocityY > velocityThreshold)) {
        if (event.translationY < 0) {
          runOnJS(onSwipeUp)()
          swipeDetected = true
        } else {
          runOnJS(onSwipeDown)()
          swipeDetected = true
        }
      }
      
      // Horizontal swipes (secondary actions)
      else if (absX > absY && (absX > distanceThreshold || absVelocityX > velocityThreshold)) {
        if (event.translationX > 0 && onSwipeRight) {
          runOnJS(onSwipeRight)()
          swipeDetected = true
        } else if (event.translationX < 0 && onSwipeLeft) {
          runOnJS(onSwipeLeft)()
          swipeDetected = true
        }
      }
      
      if (swipeDetected) {
        // Animate card out
        const finalX = event.translationX > 0 ? 400 : event.translationX < 0 ? -400 : 0
        const finalY = event.translationY > 0 ? 800 : event.translationY < 0 ? -800 : 0
        
        translateX.value = withSpring(finalX, { duration: 300 })
        translateY.value = withSpring(finalY, { duration: 300 })
        opacity.value = withSpring(0, { duration: 300 })
        scale.value = withSpring(0.8, { duration: 300 })
      } else {
        // Snap back to center
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
        scale.value = withSpring(1)
        opacity.value = withSpring(1)
        rotation.value = withSpring(0)
      }
    },
  })
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }))
  
  const resetAnimation = () => {
    translateX.value = withSpring(0)
    translateY.value = withSpring(0)
    scale.value = withSpring(1)
    opacity.value = withSpring(1)
    rotation.value = withSpring(0)
  }
  
  return {
    gestureHandler,
    animatedStyle,
    resetAnimation,
  }
}
```

### Custom Tab Bar Component
```typescript
// components/navigation/TabBar.tsx
import { View, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Text } from '../atoms/Text'
import { Icon } from '../atoms/Icon'
import { useTheme } from '../../hooks/useTheme'

export const TabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.colors.surface,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          paddingBottom: insets.bottom + 8,
          paddingTop: 12,
          paddingHorizontal: 16,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel || route.name
        const iconName = options.tabBarIcon
        const isFocused = state.index === index
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }
        
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          })
        }
        
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={`${label} tab`}
            testID={options.tabBarTestID}
          >
            <Icon
              name={iconName}
              size="lg"
              color={isFocused ? theme.colors.primary : theme.colors.outline}
            />
            
            <Text
              variant="caption"
              color={isFocused ? theme.colors.primary : theme.colors.outline}
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: isFocused ? '600' : '400',
              }}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
```

## Navigation Transitions

### Card Transition Animation
```typescript
// navigation/transitions/CardTransition.ts
import { StackCardInterpolationProps } from '@react-navigation/stack'

export const CardTransition = ({
  current,
  next,
  inverted,
  layouts: { screen },
}: StackCardInterpolationProps) => {
  const progress = current.progress
  const nextProgress = next?.progress
  
  return {
    cardStyle: {
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [screen.height, 0],
            extrapolate: 'clamp',
          }),
        },
        {
          scale: nextProgress
            ? nextProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.95],
                extrapolate: 'clamp',
              })
            : 1,
        },
      ],
      opacity: progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp',
      }),
    },
    overlayStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.3],
        extrapolate: 'clamp',
      }),
    },
  }
}
```

### Modal Transition Animation
```typescript
// navigation/transitions/ModalTransition.ts
export const ModalTransition = ({
  current,
  layouts: { screen },
}: StackCardInterpolationProps) => {
  return {
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [screen.height, 0],
            extrapolate: 'clamp',
          }),
        },
      ],
    },
    overlayStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    },
  }
}
```

## Accessibility Features

### Keyboard Navigation
```typescript
// hooks/useKeyboardNavigation.ts
import { useEffect } from 'react'
import { Keyboard } from 'react-native'

export const useKeyboardNavigation = (
  onUp: () => void,
  onDown: () => void,
  onLeft: () => void,
  onRight: () => void,
  onSelect: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Re-enable gesture navigation when keyboard is hidden
    })
    
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Disable gesture navigation when keyboard is shown
    })
    
    return () => {
      keyboardDidHideListener.remove()
      keyboardDidShowListener.remove()
    }
  }, [enabled])
  
  // TV remote and external keyboard support would be implemented here
  // This is a placeholder for the actual keyboard event handling
}
```

### Screen Reader Navigation
```typescript
// hooks/useScreenReaderNavigation.ts
import { AccessibilityInfo } from 'react-native'
import { useEffect, useState } from 'react'

export const useScreenReaderNavigation = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false)
  
  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled()
      setIsScreenReaderEnabled(enabled)
    }
    
    checkScreenReader()
    
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    )
    
    return () => subscription.remove()
  }, [])
  
  const announceNavigation = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message)
    }
  }
  
  return {
    isScreenReaderEnabled,
    announceNavigation,
  }
}
```

## Deep Linking Support

### URL Structure
```
flashcardgame://
├── /home
├── /games
│   ├── /picture-charades
│   ├── /would-you-rather
│   ├── /movie-mania
│   ├── /ice-breakers
│   └── /animal-kingdom
├── /profile
│   ├── /statistics
│   ├── /achievements
│   └── /settings
└── /share
    └── /card/:cardId
```

### Deep Link Configuration
```typescript
// navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native'

export const linking: LinkingOptions<any> = {
  prefixes: ['flashcardgame://', 'https://flashcardgame.app'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Games: {
            screens: {
              GameSelection: 'games',
              GamePlay: 'games/:gameId',
            },
          },
          Profile: {
            screens: {
              Profile: 'profile',
              Statistics: 'profile/statistics',
              Achievements: 'profile/achievements',
            },
          },
          Settings: 'settings',
        },
      },
      Share: 'share/card/:cardId',
    },
  },
}
```

## Performance Optimization

### Navigation Performance
```typescript
// hooks/useNavigationPerformance.ts
import { useEffect } from 'react'
import { InteractionManager } from 'react-native'

export const useNavigationPerformance = (screenName: string) => {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      // Heavy operations after navigation animation completes
      console.log(`${screenName} navigation completed`)
    })
    
    return () => task.cancel()
  }, [screenName])
}
```

### Memory Management
```typescript
// hooks/useNavigationMemory.ts
import { useEffect } from 'react'
import { AppState } from 'react-native'

export const useNavigationMemory = () => {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // Clear navigation cache
        // Release heavy resources
      }
    }
    
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    return () => subscription.remove()
  }, [])
}
```

## Testing Strategy

### Navigation Testing
```typescript
// __tests__/navigation.test.tsx
import { render, fireEvent } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { RootNavigator } from '../navigation/RootNavigator'

describe('Navigation', () => {
  it('should navigate between tabs', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    )
    
    // Test tab navigation
    fireEvent.press(getByTestId('games-tab'))
    expect(getByTestId('games-screen')).toBeTruthy()
    
    fireEvent.press(getByTestId('profile-tab'))
    expect(getByTestId('profile-screen')).toBeTruthy()
  })
  
  it('should handle deep links correctly', () => {
    // Test deep link navigation
  })
  
  it('should support accessibility navigation', () => {
    // Test screen reader navigation
  })
})
```

This navigation system provides a comprehensive foundation for the TikTok-style interface while maintaining accessibility, performance, and platform consistency standards required for a professional mobile application.