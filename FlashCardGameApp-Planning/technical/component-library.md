# Component Library Documentation

## Overview
This document outlines the complete component library for the Flash Card Game Store application, providing reusable, accessible, and performant UI components that follow our design system standards.

## Component Architecture

### Design Principles
1. **Atomic Design**: Components built from atoms to organisms
2. **Accessibility First**: WCAG 2.1 AA compliance baked into every component
3. **Performance Optimized**: Minimal re-renders and efficient animations
4. **Theme Aware**: Seamless light/dark mode transitions
5. **Platform Adaptive**: iOS and Android specific optimizations

### Component Hierarchy
```
Atoms (Basic building blocks)
├── Button
├── Text
├── Icon
├── Input
├── Avatar
└── Badge

Molecules (Simple component combinations)
├── SearchBar
├── NavigationItem
├── GameCard
├── StatCard
└── SettingItem

Organisms (Complex component groups)
├── Navigation
├── GameInterface
├── ProfileHeader
├── SettingsPanel
└── GameGrid

Templates (Layout structures)
├── ScreenTemplate
├── ModalTemplate
├── CardTemplate
└── ListTemplate

Pages (Complete screens)
├── HomeScreen
├── GameScreen
├── ProfileScreen
└── SettingsScreen
```

## Atomic Components

### Button Component

#### Purpose
Primary interactive element for user actions, available in multiple variants and sizes with consistent touch targets and accessibility support.

#### Anatomy
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
  size: 'small' | 'medium' | 'large' | 'extraLarge'
  children: React.ReactNode
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  testID?: string
  accessibilityLabel?: string
  accessibilityHint?: string
}
```

#### Implementation
```typescript
// components/atoms/Button.tsx
import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import { sizing, spacing, colors } from '../theme'

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onPress,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const theme = useTheme()
  
  const buttonStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    tertiary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outline,
      borderWidth: 1,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
    },
  }
  
  const sizeStyles = {
    small: {
      height: sizing.button.small.height,
      paddingHorizontal: sizing.button.small.paddingHorizontal,
      paddingVertical: sizing.button.small.paddingVertical,
      minWidth: sizing.button.small.minWidth,
    },
    medium: {
      height: sizing.button.medium.height,
      paddingHorizontal: sizing.button.medium.paddingHorizontal,
      paddingVertical: sizing.button.medium.paddingVertical,
      minWidth: sizing.button.medium.minWidth,
    },
    large: {
      height: sizing.button.large.height,
      paddingHorizontal: sizing.button.large.paddingHorizontal,
      paddingVertical: sizing.button.large.paddingVertical,
      minWidth: sizing.button.large.minWidth,
    },
    extraLarge: {
      height: sizing.button.extraLarge.height,
      paddingHorizontal: sizing.button.extraLarge.paddingHorizontal,
      paddingVertical: sizing.button.extraLarge.paddingVertical,
      minWidth: sizing.button.extraLarge.minWidth,
    },
  }
  
  const textColors = {
    primary: theme.colors.onPrimary,
    secondary: theme.colors.primary,
    tertiary: theme.colors.onSurface,
    danger: theme.colors.onError,
    ghost: theme.colors.primary,
  }
  
  return (
    <Pressable
      style={({ pressed }) => [
        {
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
          width: fullWidth ? '100%' : 'auto',
        },
        buttonStyles[variant],
        sizeStyles[size],
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColors[variant]} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: spacing[2] }}>
              {icon}
            </View>
          )}
          
          <Text
            style={{
              color: textColors[variant],
              fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {children}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: spacing[2] }}>
              {icon}
            </View>
          )}
        </>
      )}
    </Pressable>
  )
}
```

#### Usage Examples
```typescript
// Basic usage
<Button onPress={() => console.log('pressed')}>
  Continue
</Button>

// Primary CTA
<Button
  variant="primary"
  size="large"
  fullWidth
  onPress={handleStart}
  accessibilityLabel="Start playing games"
>
  Start Playing
</Button>

// Secondary action with icon
<Button
  variant="secondary"
  icon={<ShareIcon />}
  iconPosition="left"
  onPress={handleShare}
>
  Share
</Button>

// Loading state
<Button
  variant="primary"
  loading={isLoading}
  disabled={isLoading}
  onPress={handleSubmit}
>
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

### Text Component

#### Purpose
Standardized text rendering with consistent typography, theming, and accessibility support across the application.

#### Implementation
```typescript
// components/atoms/Text.tsx
interface TextProps {
  variant: 'display' | 'headline' | 'title' | 'body' | 'caption' | 'overline'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'thin' | 'light' | 'normal' | 'medium' | 'semiBold' | 'bold' | 'extraBold'
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  numberOfLines?: number
  children: React.ReactNode
  style?: any
  testID?: string
  accessibilityRole?: string
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  size,
  weight,
  color,
  align = 'left',
  numberOfLines,
  children,
  style,
  testID,
  accessibilityRole = 'text',
}) => {
  const theme = useTheme()
  
  const variantStyles = {
    display: {
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 1.1,
      letterSpacing: -1,
    },
    headline: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 1.25,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 1.25,
      letterSpacing: -0.25,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 1.375,
      letterSpacing: 0.4,
    },
    overline: {
      fontSize: 11,
      fontWeight: '600',
      lineHeight: 1.25,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  }
  
  return (
    <RNText
      style={[
        {
          color: color || theme.colors.onSurface,
          textAlign: align,
          fontFamily: theme.fonts.primary,
        },
        variantStyles[variant],
        size && { fontSize: typography.fontSize[size] },
        weight && { fontWeight: typography.fontWeight[weight] },
        style,
      ]}
      numberOfLines={numberOfLines}
      testID={testID}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </RNText>
  )
}
```

### Icon Component

#### Purpose
Consistent icon rendering with size scaling, color theming, and accessibility support.

#### Implementation
```typescript
// components/atoms/Icon.tsx
interface IconProps {
  name: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  color?: string
  style?: any
  testID?: string
  accessibilityLabel?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'base',
  color,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme()
  const iconSize = sizing.icon[size]
  
  return (
    <IconComponent
      name={name}
      size={iconSize}
      color={color || theme.colors.onSurface}
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    />
  )
}
```

## Molecular Components

### GameCard Component

#### Purpose
Core component for displaying game content in the TikTok-style full-screen interface with swipe navigation support.

#### Implementation
```typescript
// components/molecules/GameCard.tsx
interface GameCardProps {
  game: GameData
  isActive: boolean
  onSwipe: (direction: 'up' | 'down') => void
  onPause: () => void
  onReveal: () => void
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isActive,
  onSwipe,
  onPause,
  onReveal,
}) => {
  const theme = useTheme()
  const { gestureHandler, animatedStyle } = useCardNavigation(onSwipe)
  
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.background,
          },
          animatedStyle,
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Card Header */}
          <View style={styles.header}>
            <Pressable
              onPress={onPause}
              style={styles.pauseButton}
              accessibilityRole="button"
              accessibilityLabel="Pause game"
            >
              <Icon name="pause" size="lg" />
            </Pressable>
          </View>
          
          {/* Card Content */}
          <View style={styles.content}>
            {game.type === 'image' && (
              <Image
                source={{ uri: game.imageUrl }}
                style={styles.gameImage}
                accessibilityLabel={game.imageAlt}
              />
            )}
            
            <Text
              variant="headline"
              align="center"
              style={styles.gameTitle}
            >
              {game.title}
            </Text>
            
            {game.subtitle && (
              <Text
                variant="body"
                align="center"
                style={styles.gameSubtitle}
              >
                {game.subtitle}
              </Text>
            )}
            
            {game.instructions && (
              <Text
                variant="caption"
                align="center"
                style={styles.instructions}
              >
                {game.instructions}
              </Text>
            )}
          </View>
          
          {/* Card Footer */}
          <View style={styles.footer}>
            <Text variant="caption" color={theme.colors.outline}>
              {game.category}
            </Text>
            
            <Pressable
              onLongPress={onReveal}
              style={styles.revealHint}
              accessibilityRole="button"
              accessibilityLabel="Long press to reveal answer"
              accessibilityHint="Hold down to see the answer"
            >
              <Text variant="caption" color={theme.colors.outline}>
                Hold to reveal
              </Text>
            </Pressable>
          </View>
          
          {/* Navigation Hints */}
          <View style={styles.navigationHints}>
            <Text variant="caption" color={theme.colors.outline}>
              ↕ Swipe up/down
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  
  gameImage: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  
  gameTitle: {
    marginTop: spacing[4],
  },
  
  gameSubtitle: {
    opacity: 0.8,
  },
  
  instructions: {
    opacity: 0.6,
    marginTop: spacing[2],
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  
  revealHint: {
    padding: spacing[2],
  },
  
  navigationHints: {
    position: 'absolute',
    bottom: spacing[8],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
})
```

### NavigationItem Component

#### Purpose
Standardized navigation element for tab bars and menu systems with accessibility and theming support.

#### Implementation
```typescript
// components/molecules/NavigationItem.tsx
interface NavigationItemProps {
  icon: string
  label: string
  isActive?: boolean
  onPress: () => void
  badge?: number
  testID?: string
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  icon,
  label,
  isActive = false,
  onPress,
  badge,
  testID,
}) => {
  const theme = useTheme()
  
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.iconContainer}>
        <Icon
          name={icon}
          size="lg"
          color={isActive ? theme.colors.primary : theme.colors.outline}
        />
        
        {badge && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
            <Text
              variant="caption"
              color={theme.colors.onError}
              style={styles.badgeText}
            >
              {badge > 99 ? '99+' : badge.toString()}
            </Text>
          </View>
        )}
      </View>
      
      <Text
        variant="caption"
        color={isActive ? theme.colors.primary : theme.colors.outline}
        style={styles.label}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    minWidth: 60,
  },
  
  iconContainer: {
    position: 'relative',
  },
  
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  label: {
    marginTop: spacing[1],
    textAlign: 'center',
  },
})
```

## Organism Components

### GameInterface Component

#### Purpose
Complete game interface managing card stack, navigation, timer, and game controls.

#### Implementation
```typescript
// components/organisms/GameInterface.tsx
interface GameInterfaceProps {
  gameId: string
  cards: GameCard[]
  onComplete: () => void
  onExit: () => void
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  gameId,
  cards,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [timer, setTimer] = useState(60)
  const [showSettings, setShowSettings] = useState(false)
  
  const handleSwipe = useCallback((direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else if (direction === 'down' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else if (direction === 'up' && currentIndex === cards.length - 1) {
      onComplete()
    }
  }, [currentIndex, cards.length, onComplete])
  
  const handlePause = useCallback(() => {
    setIsPaused(true)
    setShowSettings(true)
  }, [])
  
  const handleReveal = useCallback(() => {
    // Implement reveal logic
  }, [])
  
  // Timer logic
  useEffect(() => {
    if (!isPaused && timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [isPaused, timer])
  
  return (
    <View style={{ flex: 1 }}>
      {/* Timer Overlay */}
      <TimerOverlay
        time={timer}
        isPaused={isPaused}
        onTimeUp={() => handleSwipe('up')}
      />
      
      {/* Card Stack */}
      <View style={{ flex: 1 }}>
        {cards.map((card, index) => (
          <GameCard
            key={card.id}
            game={card}
            isActive={index === currentIndex}
            onSwipe={handleSwipe}
            onPause={handlePause}
            onReveal={handleReveal}
            style={{
              zIndex: cards.length - Math.abs(index - currentIndex),
              opacity: index === currentIndex ? 1 : 0.3,
              transform: [
                {
                  scale: index === currentIndex ? 1 : 0.95,
                },
                {
                  translateY: (index - currentIndex) * 20,
                },
              ],
            }}
          />
        ))}
      </View>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}
      >
        <GameSettingsPanel
          gameId={gameId}
          onResume={() => {
            setIsPaused(false)
            setShowSettings(false)
          }}
          onExit={onExit}
        />
      </Modal>
      
      {/* Progress Indicator */}
      <ProgressIndicator
        current={currentIndex + 1}
        total={cards.length}
        style={styles.progressIndicator}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  progressIndicator: {
    position: 'absolute',
    top: 60,
    left: spacing[4],
    right: spacing[4],
  },
})
```

## Template Components

### ScreenTemplate Component

#### Purpose
Consistent screen layout structure with safe area handling, navigation, and common screen patterns.

#### Implementation
```typescript
// components/templates/ScreenTemplate.tsx
interface ScreenTemplateProps {
  title?: string
  showBackButton?: boolean
  showCloseButton?: boolean
  headerActions?: React.ReactNode
  children: React.ReactNode
  backgroundColor?: string
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[]
  testID?: string
}

export const ScreenTemplate: React.FC<ScreenTemplateProps> = ({
  title,
  showBackButton = false,
  showCloseButton = false,
  headerActions,
  children,
  backgroundColor,
  safeAreaEdges = ['top', 'bottom'],
  testID,
}) => {
  const theme = useTheme()
  const navigation = useNavigation()
  
  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: backgroundColor || theme.colors.background,
        },
      ]}
      edges={safeAreaEdges}
      testID={testID}
    >
      {/* Header */}
      {(title || showBackButton || showCloseButton || headerActions) && (
        <View style={styles.header}>
          {/* Left Actions */}
          <View style={styles.headerLeft}>
            {showBackButton && (
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Icon name="chevron-left" size="lg" />
              </Pressable>
            )}
            
            {showCloseButton && (
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Icon name="x" size="lg" />
              </Pressable>
            )}
          </View>
          
          {/* Title */}
          {title && (
            <View style={styles.headerCenter}>
              <Text
                variant="title"
                numberOfLines={1}
                style={styles.headerTitle}
              >
                {title}
              </Text>
            </View>
          )}
          
          {/* Right Actions */}
          <View style={styles.headerRight}>
            {headerActions}
          </View>
        </View>
      )}
      
      {/* Content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  
  headerTitle: {
    textAlign: 'center',
  },
})
```

## Usage Guidelines

### Component Selection
1. **Start with Atoms**: Use basic components for simple UI elements
2. **Combine to Molecules**: Group atoms for specific functionality
3. **Build Organisms**: Create complex sections with molecules
4. **Structure with Templates**: Define consistent page layouts
5. **Compose Pages**: Combine all levels for complete screens

### Accessibility Implementation
```typescript
// Example of accessible component usage
<Button
  variant="primary"
  onPress={handleSubmit}
  accessibilityLabel="Submit your game score"
  accessibilityHint="Uploads your score to the leaderboard"
  accessibilityState={{ disabled: isSubmitting }}
>
  Submit Score
</Button>

<Text
  variant="headline"
  accessibilityRole="header"
  accessibilityLevel={1}
>
  Game Results
</Text>
```

### Performance Considerations
1. **Memoization**: Use `React.memo` for expensive components
2. **Lazy Loading**: Implement lazy loading for heavy components
3. **Virtualization**: Use `FlatList` for large data sets
4. **Image Optimization**: Implement proper image loading and caching

### Testing Strategy
```typescript
// Component testing example
describe('Button Component', () => {
  it('renders correctly with all variants', () => {
    const variants = ['primary', 'secondary', 'tertiary', 'danger', 'ghost']
    
    variants.forEach(variant => {
      const { getByRole } = render(
        <Button variant={variant} onPress={jest.fn()}>
          Test Button
        </Button>
      )
      
      expect(getByRole('button')).toBeTruthy()
    })
  })
  
  it('handles accessibility correctly', () => {
    const { getByRole } = render(
      <Button
        onPress={jest.fn()}
        accessibilityLabel="Custom label"
        accessibilityHint="Custom hint"
      >
        Test
      </Button>
    )
    
    const button = getByRole('button')
    expect(button).toHaveAccessibilityLabel('Custom label')
    expect(button).toHaveAccessibilityHint('Custom hint')
  })
})
```

This component library provides a comprehensive foundation for building consistent, accessible, and performant user interfaces while maintaining the flexibility needed for the diverse game content and interactions in our flash card application.