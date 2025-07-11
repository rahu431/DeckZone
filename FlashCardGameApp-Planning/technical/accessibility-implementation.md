# Accessibility Implementation Guide

## Overview
This document provides comprehensive accessibility implementation guidelines for the Flash Card Game Store application, ensuring WCAG 2.1 AA compliance and inclusive design for users with diverse abilities and assistive technologies.

## Accessibility Philosophy

### Core Principles
1. **Universal Design**: Features work for all users, regardless of ability
2. **Inclusive by Default**: Accessibility considerations from initial design phase
3. **Progressive Enhancement**: Core functionality works without advanced features
4. **User Agency**: Users control their experience and accessibility preferences
5. **Testing with Users**: Regular testing with real assistive technology users

### Compliance Standards
- **WCAG 2.1 AA**: Full compliance with Web Content Accessibility Guidelines
- **Section 508**: US federal accessibility requirements
- **Platform Guidelines**: iOS Accessibility and Android TalkBack best practices
- **ISO/IEC 40500**: International accessibility standard

## Visual Accessibility

### Color and Contrast Implementation
```typescript
// utils/colorContrast.ts
interface ColorContrastChecker {
  foreground: string
  background: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
}

class AccessibilityColorManager {
  // WCAG contrast ratio calculations
  private calculateLuminance(rgb: [number, number, number]): number {
    const [r, g, b] = rgb.map(color => {
      color = color / 255
      return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0]
  }
  
  checkContrastRatio({ foreground, background, fontSize, fontWeight }: ColorContrastChecker): {
    ratio: number
    passes: { AA: boolean; AAA: boolean }
    level: 'fail' | 'AA' | 'AAA'
  } {
    const fgLuminance = this.calculateLuminance(this.hexToRgb(foreground))
    const bgLuminance = this.calculateLuminance(this.hexToRgb(background))
    
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05)
    
    // Large text is 18pt+ or 14pt+ bold
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight === 'bold')
    
    const aaRequirement = isLargeText ? 3.0 : 4.5
    const aaaRequirement = isLargeText ? 4.5 : 7.0
    
    const passes = {
      AA: ratio >= aaRequirement,
      AAA: ratio >= aaaRequirement,
    }
    
    const level = passes.AAA ? 'AAA' : passes.AA ? 'AA' : 'fail'
    
    return { ratio, passes, level }
  }
  
  // Generate accessible color variations
  generateAccessibleVariant(
    baseColor: string,
    backgroundColor: string,
    targetRatio: number = 4.5
  ): string {
    const baseLuminance = this.calculateLuminance(this.hexToRgb(baseColor))
    const bgLuminance = this.calculateLuminance(this.hexToRgb(backgroundColor))
    
    // Determine if we need to go lighter or darker
    const shouldGoLighter = baseLuminance < bgLuminance
    
    // Binary search for the right color
    let low = 0
    let high = 255
    let bestColor = baseColor
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const testColor = shouldGoLighter 
        ? this.lightenColor(baseColor, mid / 255)
        : this.darkenColor(baseColor, mid / 255)
      
      const ratio = this.checkContrastRatio({
        foreground: testColor,
        background: backgroundColor,
        fontSize: 16,
        fontWeight: 'normal',
      }).ratio
      
      if (ratio >= targetRatio) {
        bestColor = testColor
        if (shouldGoLighter) {
          high = mid - 1
        } else {
          low = mid + 1
        }
      } else {
        if (shouldGoLighter) {
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
    }
    
    return bestColor
  }
  
  private lightenColor(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex)
    return `#${[r, g, b].map(color => {
      const lightened = Math.round(color + (255 - color) * amount)
      return Math.min(255, lightened).toString(16).padStart(2, '0')
    }).join('')}`
  }
  
  private darkenColor(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex)
    return `#${[r, g, b].map(color => {
      const darkened = Math.round(color * (1 - amount))
      return Math.max(0, darkened).toString(16).padStart(2, '0')
    }).join('')}`
  }
}

export const colorManager = new AccessibilityColorManager()

// High contrast color scheme
export const highContrastColors = {
  background: '#FFFFFF',
  foreground: '#000000',
  primary: '#0000FF',
  secondary: '#FF0000',
  success: '#008000',
  warning: '#FFA500',
  error: '#FF0000',
  border: '#000000',
  focus: '#0066CC',
}

// Component for accessible color usage
export const AccessibleText: React.FC<{
  children: React.ReactNode
  backgroundColor?: string
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  style?: any
}> = ({ 
  children, 
  backgroundColor = '#FFFFFF', 
  color = '#000000',
  fontSize = 16,
  fontWeight = 'normal',
  style 
}) => {
  const { isHighContrastEnabled } = useAccessibilitySettings()
  
  const finalColor = useMemo(() => {
    if (isHighContrastEnabled) {
      return highContrastColors.foreground
    }
    
    const contrastCheck = colorManager.checkContrastRatio({
      foreground: color,
      background: backgroundColor,
      fontSize,
      fontWeight,
    })
    
    if (!contrastCheck.passes.AA) {
      return colorManager.generateAccessibleVariant(color, backgroundColor)
    }
    
    return color
  }, [color, backgroundColor, fontSize, fontWeight, isHighContrastEnabled])
  
  return (
    <Text
      style={[
        {
          color: finalColor,
          fontSize,
          fontWeight,
          backgroundColor: isHighContrastEnabled ? highContrastColors.background : backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </Text>
  )
}
```

### Font Scaling and Typography
```typescript
// hooks/useAccessibleTypography.ts
import { useWindowDimensions } from 'react-native'
import { AccessibilityInfo } from 'react-native'

interface TypographyScale {
  xs: number
  sm: number
  base: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

export const useAccessibleTypography = () => {
  const [fontScale, setFontScale] = useState(1)
  const [boldTextEnabled, setBoldTextEnabled] = useState(false)
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false)
  
  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      // Check font scale
      const scale = await AccessibilityInfo.getMultiplier?.() || 1
      setFontScale(scale)
      
      // Check bold text preference
      const isBoldEnabled = await AccessibilityInfo.isBoldTextEnabled?.() || false
      setBoldTextEnabled(isBoldEnabled)
      
      // Check reduce motion preference
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled?.() || false
      setReduceMotionEnabled(isReduceMotionEnabled)
    }
    
    checkAccessibilitySettings()
    
    // Listen for changes
    const fontScaleSubscription = AccessibilityInfo.addEventListener(
      'announcementFinished',
      checkAccessibilitySettings
    )
    
    return () => fontScaleSubscription?.remove()
  }, [])
  
  const getScaledFont = useCallback((baseSize: number): number => {
    // Apply system font scaling
    const scaledSize = baseSize * fontScale
    
    // Ensure minimum and maximum font sizes
    const minSize = 12
    const maxSize = 48
    
    return Math.max(minSize, Math.min(maxSize, scaledSize))
  }, [fontScale])
  
  const getAccessibleTypography = useCallback((): TypographyScale => {
    return {
      xs: getScaledFont(12),
      sm: getScaledFont(14),
      base: getScaledFont(16),
      lg: getScaledFont(18),
      xl: getScaledFont(20),
      '2xl': getScaledFont(24),
      '3xl': getScaledFont(30),
    }
  }, [getScaledFont])
  
  const getAccessibleFontWeight = useCallback((baseWeight: string): string => {
    if (boldTextEnabled) {
      const weightMap: Record<string, string> = {
        '300': '500',
        '400': '600',
        '500': '700',
        '600': '800',
        '700': '900',
        'normal': 'bold',
        'bold': '900',
      }
      return weightMap[baseWeight] || baseWeight
    }
    return baseWeight
  }, [boldTextEnabled])
  
  return {
    fontScale,
    boldTextEnabled,
    reduceMotionEnabled,
    getScaledFont,
    getAccessibleTypography,
    getAccessibleFontWeight,
  }
}

// Accessible typography component
export const AccessibleText: React.FC<{
  variant: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700'
  children: React.ReactNode
  style?: any
  accessibilityRole?: string
  accessibilityLevel?: number
}> = ({ 
  variant, 
  weight = 'normal', 
  children, 
  style,
  accessibilityRole,
  accessibilityLevel 
}) => {
  const { getAccessibleTypography, getAccessibleFontWeight } = useAccessibleTypography()
  const typography = getAccessibleTypography()
  
  return (
    <Text
      style={[
        {
          fontSize: typography[variant],
          fontWeight: getAccessibleFontWeight(weight),
        },
        style,
      ]}
      accessibilityRole={accessibilityRole as any}
      accessibilityLevel={accessibilityLevel}
    >
      {children}
    </Text>
  )
}
```

## Screen Reader Support

### Screen Reader Navigation
```typescript
// hooks/useScreenReader.ts
import { AccessibilityInfo } from 'react-native'

export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false)
  const [announcements, setAnnouncements] = useState<string[]>([])
  
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
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!isScreenReaderEnabled) return
    
    AccessibilityInfo.announceForAccessibility(message)
    
    setAnnouncements(prev => [
      ...prev.slice(-4), // Keep last 5 announcements
      `${new Date().toISOString()}: ${message}`,
    ])
  }, [isScreenReaderEnabled])
  
  const announcePageLoad = useCallback((screenName: string) => {
    announce(`${screenName} screen loaded`, 'polite')
  }, [announce])
  
  const announceStateChange = useCallback((change: string) => {
    announce(change, 'assertive')
  }, [announce])
  
  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive')
  }, [announce])
  
  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])
  
  return {
    isScreenReaderEnabled,
    announce,
    announcePageLoad,
    announceStateChange,
    announceError,
    announceSuccess,
    announcements,
  }
}

// Accessible game card component
export const AccessibleGameCard: React.FC<{
  game: GameData
  isActive: boolean
  onSwipe: (direction: 'up' | 'down') => void
  onPause: () => void
}> = ({ game, isActive, onSwipe, onPause }) => {
  const { announce, isScreenReaderEnabled } = useScreenReader()
  const [hasBeenAnnounced, setHasBeenAnnounced] = useState(false)
  
  // Announce card content when it becomes active
  useEffect(() => {
    if (isActive && !hasBeenAnnounced && isScreenReaderEnabled) {
      const announcement = `Game card: ${game.title}. ${game.content}. ${
        game.instructions ? `Instructions: ${game.instructions}` : ''
      }. Swipe up for next card, swipe down for previous card.`
      
      announce(announcement, 'polite')
      setHasBeenAnnounced(true)
    }
    
    if (!isActive) {
      setHasBeenAnnounced(false)
    }
  }, [isActive, hasBeenAnnounced, game, announce, isScreenReaderEnabled])
  
  const handleSwipeUp = useCallback(() => {
    onSwipe('up')
    announce('Moving to next card', 'polite')
  }, [onSwipe, announce])
  
  const handleSwipeDown = useCallback(() => {
    onSwipe('down')
    announce('Moving to previous card', 'polite')
  }, [onSwipe, announce])
  
  const handlePause = useCallback(() => {
    onPause()
    announce('Game paused', 'assertive')
  }, [onPause, announce])
  
  return (
    <View
      style={styles.cardContainer}
      accessible={true}
      accessibilityRole="article"
      accessibilityLabel={`Game card: ${game.title}`}
      accessibilityHint="Double tap to reveal answer, swipe to navigate"
      accessibilityState={{ selected: isActive }}
    >
      {/* Card header with pause button */}
      <View style={styles.cardHeader}>
        <Pressable
          onPress={handlePause}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Pause game"
          accessibilityHint="Pauses the current game session"
          style={styles.pauseButton}
        >
          <Icon name="pause" accessibilityHidden={true} />
        </Pressable>
      </View>
      
      {/* Main card content */}
      <View style={styles.cardContent}>
        <AccessibleText
          variant="2xl"
          weight="bold"
          accessibilityRole="heading"
          accessibilityLevel={1}
          style={styles.cardTitle}
        >
          {game.title}
        </AccessibleText>
        
        {game.imageUrl && (
          <Image
            source={{ uri: game.imageUrl }}
            style={styles.cardImage}
            accessible={true}
            accessibilityLabel={game.imageAlt || `Image for ${game.title}`}
          />
        )}
        
        <AccessibleText
          variant="lg"
          style={styles.cardText}
        >
          {game.content}
        </AccessibleText>
        
        {game.instructions && (
          <AccessibleText
            variant="base"
            style={styles.instructions}
            accessibilityRole="text"
          >
            Instructions: {game.instructions}
          </AccessibleText>
        )}
      </View>
      
      {/* Navigation hints for screen readers */}
      {isScreenReaderEnabled && (
        <View style={styles.screenReaderHints}>
          <Text
            accessible={true}
            accessibilityLabel="Navigation: Swipe up for next card, swipe down for previous card, double tap to reveal answer"
            style={{ opacity: 0, height: 0 }}
          >
            Navigation instructions
          </Text>
        </View>
      )}
      
      {/* Hidden navigation buttons for screen reader users */}
      {isScreenReaderEnabled && (
        <View style={styles.hiddenButtons}>
          <Pressable
            onPress={handleSwipeUp}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Next card"
            style={styles.hiddenButton}
          >
            <Text style={{ opacity: 0 }}>Next</Text>
          </Pressable>
          
          <Pressable
            onPress={handleSwipeDown}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous card"
            style={styles.hiddenButton}
          >
            <Text style={{ opacity: 0 }}>Previous</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
```

### Focus Management
```typescript
// hooks/useFocusManagement.ts
import { useRef, useCallback } from 'react'
import { findNodeHandle, AccessibilityInfo } from 'react-native'

export const useFocusManagement = () => {
  const focusHistory = useRef<any[]>([])
  
  const setAccessibilityFocus = useCallback((ref: any) => {
    if (!ref?.current) return
    
    const nodeHandle = findNodeHandle(ref.current)
    if (nodeHandle) {
      AccessibilityInfo.setAccessibilityFocus(nodeHandle)
      focusHistory.current.push(ref)
    }
  }, [])
  
  const returnFocus = useCallback(() => {
    const previousRef = focusHistory.current.pop()
    if (previousRef?.current) {
      setAccessibilityFocus(previousRef)
    }
  }, [setAccessibilityFocus])
  
  const clearFocusHistory = useCallback(() => {
    focusHistory.current = []
  }, [])
  
  const trapFocus = useCallback((containerRef: any, focusableRefs: any[]) => {
    // Implementation for focus trapping within a container
    // This would typically be used for modals or dialogs
    
    const handleKeyPress = (event: any) => {
      if (event.key === 'Tab') {
        const currentIndex = focusableRefs.findIndex(ref => 
          ref.current === document.activeElement
        )
        
        if (event.shiftKey) {
          // Shift + Tab (previous)
          const previousIndex = currentIndex <= 0 ? focusableRefs.length - 1 : currentIndex - 1
          setAccessibilityFocus(focusableRefs[previousIndex])
        } else {
          // Tab (next)
          const nextIndex = currentIndex >= focusableRefs.length - 1 ? 0 : currentIndex + 1
          setAccessibilityFocus(focusableRefs[nextIndex])
        }
        
        event.preventDefault()
      }
    }
    
    // This would be implemented differently in React Native
    // as keyboard events work differently
    return handleKeyPress
  }, [setAccessibilityFocus])
  
  return {
    setAccessibilityFocus,
    returnFocus,
    clearFocusHistory,
    trapFocus,
  }
}

// Accessible modal component with focus management
export const AccessibleModal: React.FC<{
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}> = ({ visible, onClose, title, children }) => {
  const modalRef = useRef(null)
  const titleRef = useRef(null)
  const closeButtonRef = useRef(null)
  const { setAccessibilityFocus, returnFocus } = useFocusManagement()
  const { announce } = useScreenReader()
  
  useEffect(() => {
    if (visible) {
      // Focus on title when modal opens
      setTimeout(() => {
        setAccessibilityFocus(titleRef)
        announce(`Dialog opened: ${title}`, 'assertive')
      }, 100)
    } else {
      // Return focus when modal closes
      returnFocus()
      announce('Dialog closed', 'assertive')
    }
  }, [visible, title, setAccessibilityFocus, returnFocus, announce])
  
  if (!visible) return null
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.modalOverlay}>
        <View
          ref={modalRef}
          style={styles.modalContent}
          accessible={true}
          accessibilityRole="dialog"
          accessibilityLabel={title}
        >
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text
              ref={titleRef}
              style={styles.modalTitle}
              accessible={true}
              accessibilityRole="heading"
              accessibilityLevel={1}
            >
              {title}
            </Text>
            
            <Pressable
              ref={closeButtonRef}
              onPress={onClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
              accessibilityHint="Closes this dialog and returns to the previous screen"
            >
              <Icon name="x" accessibilityHidden={true} />
            </Pressable>
          </View>
          
          {/* Modal content */}
          <View style={styles.modalBody}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  )
}
```

## Touch and Motor Accessibility

### Touch Target Optimization
```typescript
// components/accessible/AccessibleTouchable.tsx
import { Pressable, View } from 'react-native'
import { Platform } from 'react-native'

interface AccessibleTouchableProps {
  onPress: () => void
  children: React.ReactNode
  accessibilityLabel: string
  accessibilityHint?: string
  accessibilityRole?: string
  disabled?: boolean
  style?: any
  minimumTouchSize?: number
  hapticFeedback?: boolean
}

export const AccessibleTouchable: React.FC<AccessibleTouchableProps> = ({
  onPress,
  children,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  style,
  minimumTouchSize = Platform.OS === 'ios' ? 44 : 48,
  hapticFeedback = true,
}) => {
  const { announceSuccess } = useScreenReader()
  const { reduceMotionEnabled } = useAccessibleTypography()
  
  const handlePress = useCallback(() => {
    if (disabled) return
    
    // Provide haptic feedback if enabled
    if (hapticFeedback && !reduceMotionEnabled) {
      if (Platform.OS === 'ios') {
        const { Haptics } = require('expo-haptics')
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } else {
        // Android vibration
        const { Vibration } = require('react-native')
        Vibration.vibrate(50)
      }
    }
    
    onPress()
    
    // Announce success for important actions
    if (accessibilityRole === 'button' && accessibilityLabel.includes('Submit')) {
      announceSuccess(`${accessibilityLabel} activated`)
    }
  }, [onPress, disabled, hapticFeedback, reduceMotionEnabled, accessibilityLabel, accessibilityRole, announceSuccess])
  
  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityRole={accessibilityRole as any}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled,
        busy: false,
      }}
      style={({ pressed }) => [
        {
          minWidth: minimumTouchSize,
          minHeight: minimumTouchSize,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  )
}

// Accessible swipe gesture handler
export const AccessibleSwipeArea: React.FC<{
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  children: React.ReactNode
  accessibilityLabel: string
  style?: any
}> = ({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  children,
  accessibilityLabel,
  style,
}) => {
  const { isScreenReaderEnabled } = useScreenReader()
  
  // For screen reader users, provide button alternatives
  if (isScreenReaderEnabled) {
    return (
      <View style={style}>
        {children}
        
        {/* Hidden navigation buttons for screen reader users */}
        <View style={styles.screenReaderControls}>
          {onSwipeUp && (
            <AccessibleTouchable
              onPress={onSwipeUp}
              accessibilityLabel="Swipe up action"
              style={styles.hiddenButton}
            >
              <Text style={{ opacity: 0 }}>Up</Text>
            </AccessibleTouchable>
          )}
          
          {onSwipeDown && (
            <AccessibleTouchable
              onPress={onSwipeDown}
              accessibilityLabel="Swipe down action"
              style={styles.hiddenButton}
            >
              <Text style={{ opacity: 0 }}>Down</Text>
            </AccessibleTouchable>
          )}
          
          {onSwipeLeft && (
            <AccessibleTouchable
              onPress={onSwipeLeft}
              accessibilityLabel="Swipe left action"
              style={styles.hiddenButton}
            >
              <Text style={{ opacity: 0 }}>Left</Text>
            </AccessibleTouchable>
          )}
          
          {onSwipeRight && (
            <AccessibleTouchable
              onPress={onSwipeRight}
              accessibilityLabel="Swipe right action"
              style={styles.hiddenButton}
            >
              <Text style={{ opacity: 0 }}>Right</Text>
            </AccessibleTouchable>
          )}
        </View>
      </View>
    )
  }
  
  // For non-screen reader users, use gesture handling
  const { gestureHandler } = useCardNavigation({
    onSwipeUp: onSwipeUp || (() => {}),
    onSwipeDown: onSwipeDown || (() => {}),
    onSwipeLeft: onSwipeLeft,
    onSwipeRight: onSwipeRight,
  })
  
  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={style}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Use swipe gestures to navigate"
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  )
}
```

### Alternative Input Methods
```typescript
// hooks/useAlternativeInput.ts
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

export const useAlternativeInput = () => {
  const [switchControlEnabled, setSwitchControlEnabled] = useState(false)
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false)
  const [externalKeyboardConnected, setExternalKeyboardConnected] = useState(false)
  
  useEffect(() => {
    const checkAlternativeInputs = async () => {
      if (Platform.OS === 'ios') {
        // Check for iOS switch control and voice control
        const switchControl = await AccessibilityInfo.isSwitchControlEnabled?.() || false
        setSwitchControlEnabled(switchControl)
        
        // Voice control detection would need native module
        // This is a placeholder
        setVoiceControlEnabled(false)
      }
      
      // Check for external keyboard
      // This would typically be done through a native module
      setExternalKeyboardConnected(false)
    }
    
    checkAlternativeInputs()
  }, [])
  
  const getOptimizedInteraction = () => {
    if (switchControlEnabled) {
      return {
        largerTouchTargets: true,
        reducedAnimations: true,
        simplerNavigation: true,
        longerTimeouts: true,
      }
    }
    
    if (voiceControlEnabled) {
      return {
        voiceLabels: true,
        clearInstructions: true,
        alternativeNavigation: true,
      }
    }
    
    if (externalKeyboardConnected) {
      return {
        keyboardShortcuts: true,
        focusManagement: true,
        skipLinks: true,
      }
    }
    
    return {
      standardInteraction: true,
    }
  }
  
  return {
    switchControlEnabled,
    voiceControlEnabled,
    externalKeyboardConnected,
    getOptimizedInteraction,
  }
}

// Voice command integration
export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  
  const commands = {
    'next card': () => useGameStore.getState().nextCard(),
    'previous card': () => useGameStore.getState().previousCard(),
    'pause game': () => useGameStore.getState().pauseGame(),
    'resume game': () => useGameStore.getState().resumeGame(),
    'reveal answer': () => useGameStore.getState().revealCard(),
    'go home': () => useNavigation().navigate('Home'),
    'open settings': () => useNavigation().navigate('Settings'),
  }
  
  const startListening = useCallback(() => {
    if (Platform.OS === 'ios') {
      // iOS Speech Recognition would be implemented here
      setIsListening(true)
    }
  }, [])
  
  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])
  
  const processCommand = useCallback((command: string) => {
    const normalizedCommand = command.toLowerCase().trim()
    setLastCommand(normalizedCommand)
    
    const action = commands[normalizedCommand as keyof typeof commands]
    if (action) {
      action()
      return true
    }
    
    return false
  }, [])
  
  return {
    isListening,
    lastCommand,
    startListening,
    stopListening,
    processCommand,
    availableCommands: Object.keys(commands),
  }
}
```

## Cognitive Accessibility

### Simplified Interface Mode
```typescript
// hooks/useSimplifiedMode.ts
export const useSimplifiedMode = () => {
  const [isSimplified, setIsSimplified] = useState(false)
  const [cognitiveLevel, setCognitiveLevel] = useState<'standard' | 'assisted' | 'simplified'>('standard')
  
  const getSimplifiedContent = useCallback((content: any) => {
    if (!isSimplified) return content
    
    return {
      ...content,
      instructions: simplifyText(content.instructions),
      description: simplifyText(content.description),
      title: content.title, // Keep titles as-is
    }
  }, [isSimplified])
  
  const simplifyText = (text: string): string => {
    if (!text) return text
    
    // Break down complex sentences
    const simplified = text
      .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Add line breaks after sentences
      .replace(/,\s+/g, '.\n') // Replace some commas with periods and line breaks
      .replace(/\b(however|nevertheless|furthermore|moreover)\b/gi, 'But') // Replace complex connectors
      .replace(/\b(approximately|approximately)\b/gi, 'about') // Simplify words
      .replace(/\b(utilize|utilise)\b/gi, 'use')
      .replace(/\b(commence)\b/gi, 'start')
      .replace(/\b(terminate)\b/gi, 'end')
    
    return simplified
  }
  
  const getSimplifiedNavigation = () => {
    if (!isSimplified) return null
    
    return {
      maxMenuItems: 4,
      largerButtons: true,
      clearLabels: true,
      reducedOptions: true,
      stepByStepInstructions: true,
    }
  }
  
  const getCognitiveSupports = () => {
    return {
      reminders: cognitiveLevel !== 'standard',
      progressIndicators: true,
      undoOptions: cognitiveLevel === 'simplified',
      confirmationDialogs: cognitiveLevel !== 'standard',
      timeExtensions: cognitiveLevel === 'simplified',
    }
  }
  
  return {
    isSimplified,
    setIsSimplified,
    cognitiveLevel,
    setCognitiveLevel,
    getSimplifiedContent,
    getSimplifiedNavigation,
    getCognitiveSupports,
  }
}

// Simplified game interface
export const SimplifiedGameCard: React.FC<{
  game: GameData
  onNext: () => void
  onPrevious: () => void
}> = ({ game, onNext, onPrevious }) => {
  const { getSimplifiedContent } = useSimplifiedMode()
  const { announce } = useScreenReader()
  const simplifiedGame = getSimplifiedContent(game)
  
  return (
    <View style={styles.simplifiedCard}>
      {/* Clear progress indicator */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Card {game.currentIndex + 1} of {game.totalCards}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(game.currentIndex / game.totalCards) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* Main content with larger text */}
      <View style={styles.mainContent}>
        <Text style={styles.simplifiedTitle}>
          {simplifiedGame.title}
        </Text>
        
        {simplifiedGame.imageUrl && (
          <Image
            source={{ uri: simplifiedGame.imageUrl }}
            style={styles.largeImage}
            accessible={true}
            accessibilityLabel={simplifiedGame.imageAlt}
          />
        )}
        
        <Text style={styles.simplifiedContent}>
          {simplifiedGame.content}
        </Text>
        
        {simplifiedGame.instructions && (
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsLabel}>How to play:</Text>
            <Text style={styles.simplifiedInstructions}>
              {simplifiedGame.instructions}
            </Text>
          </View>
        )}
      </View>
      
      {/* Large, clear navigation buttons */}
      <View style={styles.navigationButtons}>
        <AccessibleTouchable
          onPress={onPrevious}
          accessibilityLabel="Go to previous card"
          style={[styles.navButton, styles.previousButton]}
          minimumTouchSize={60}
        >
          <Icon name="chevron-left" size="xl" />
          <Text style={styles.navButtonText}>Previous</Text>
        </AccessibleTouchable>
        
        <AccessibleTouchable
          onPress={onNext}
          accessibilityLabel="Go to next card"
          style={[styles.navButton, styles.nextButton]}
          minimumTouchSize={60}
        >
          <Text style={styles.navButtonText}>Next</Text>
          <Icon name="chevron-right" size="xl" />
        </AccessibleTouchable>
      </View>
    </View>
  )
}
```

## Testing and Validation

### Accessibility Testing Framework
```typescript
// __tests__/accessibility/accessibilityTests.ts
import { render, fireEvent } from '@testing-library/react-native'
import { AccessibilityInfo } from 'react-native'
import { GameCard } from '../components/GameCard'

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Mock accessibility APIs
    jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(true)
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {})
  })
  
  it('should have proper accessibility labels', () => {
    const { getByRole } = render(
      <GameCard
        game={mockGameData}
        isActive={true}
        onSwipe={jest.fn()}
        onPause={jest.fn()}
        onReveal={jest.fn()}
      />
    )
    
    const card = getByRole('article')
    expect(card).toHaveAccessibilityLabel('Game card: Test Game')
    
    const pauseButton = getByRole('button')
    expect(pauseButton).toHaveAccessibilityLabel('Pause game')
  })
  
  it('should support keyboard navigation', () => {
    const mockOnSwipe = jest.fn()
    const { getByRole } = render(
      <GameCard
        game={mockGameData}
        isActive={true}
        onSwipe={mockOnSwipe}
        onPause={jest.fn()}
        onReveal={jest.fn()}
      />
    )
    
    // Simulate keyboard navigation
    fireEvent(getByRole('article'), 'onKeyPress', { nativeEvent: { key: 'ArrowUp' } })
    expect(mockOnSwipe).toHaveBeenCalledWith('up')
  })
  
  it('should announce state changes', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility')
    
    const { rerender } = render(
      <GameCard
        game={mockGameData}
        isActive={false}
        onSwipe={jest.fn()}
        onPause={jest.fn()}
        onReveal={jest.fn()}
      />
    )
    
    rerender(
      <GameCard
        game={mockGameData}
        isActive={true}
        onSwipe={jest.fn()}
        onPause={jest.fn()}
        onReveal={jest.fn()}
      />
    )
    
    expect(announceSpy).toHaveBeenCalledWith(
      expect.stringContaining('Game card: Test Game')
    )
  })
  
  it('should meet color contrast requirements', () => {
    const { colorManager } = require('../utils/colorContrast')
    
    const contrastCheck = colorManager.checkContrastRatio({
      foreground: '#000000',
      background: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'normal',
    })
    
    expect(contrastCheck.passes.AA).toBe(true)
    expect(contrastCheck.ratio).toBeGreaterThanOrEqual(4.5)
  })
  
  it('should provide alternative text for images', () => {
    const { getByRole } = render(
      <GameCard
        game={{
          ...mockGameData,
          imageUrl: 'test-image.jpg',
          imageAlt: 'Test image description',
        }}
        isActive={true}
        onSwipe={jest.fn()}
        onPause={jest.fn()}
        onReveal={jest.fn()}
      />
    )
    
    const image = getByRole('image')
    expect(image).toHaveAccessibilityLabel('Test image description')
  })
  
  it('should have proper touch target sizes', () => {
    const { getByRole } = render(
      <AccessibleTouchable
        onPress={jest.fn()}
        accessibilityLabel="Test button"
      >
        <Text>Test</Text>
      </AccessibleTouchable>
    )
    
    const button = getByRole('button')
    const style = button.props.style
    
    expect(style.minWidth).toBeGreaterThanOrEqual(44) // iOS minimum
    expect(style.minHeight).toBeGreaterThanOrEqual(44)
  })
})

// Automated accessibility audit
export const runAccessibilityAudit = (component: any) => {
  const issues: string[] = []
  
  // Check for missing accessibility labels
  const unlabeledElements = component.findAll(node => 
    node.props.accessible && !node.props.accessibilityLabel
  )
  
  if (unlabeledElements.length > 0) {
    issues.push(`Found ${unlabeledElements.length} elements without accessibility labels`)
  }
  
  // Check for insufficient color contrast
  // This would require more sophisticated color analysis
  
  // Check for touch target sizes
  const smallTouchTargets = component.findAll(node => {
    const style = node.props.style
    return (
      node.props.onPress &&
      (style?.minWidth < 44 || style?.minHeight < 44)
    )
  })
  
  if (smallTouchTargets.length > 0) {
    issues.push(`Found ${smallTouchTargets.length} touch targets smaller than 44px`)
  }
  
  return {
    passed: issues.length === 0,
    issues,
  }
}
```

### Real User Testing
```typescript
// utils/accessibilityUserTesting.ts
interface AccessibilityTestSession {
  userId: string
  assistiveTechnology: string[]
  testScenarios: TestScenario[]
  feedback: UserFeedback[]
  completionRate: number
  satisfactionScore: number
}

interface TestScenario {
  id: string
  description: string
  steps: string[]
  expectedOutcome: string
  actualOutcome?: string
  success: boolean
  timeToComplete: number
  difficultiesEncountered: string[]
}

class AccessibilityUserTestingManager {
  private testSessions: AccessibilityTestSession[] = []
  
  createTestSession(userId: string, assistiveTechnology: string[]): AccessibilityTestSession {
    const session: AccessibilityTestSession = {
      userId,
      assistiveTechnology,
      testScenarios: this.getDefaultScenarios(),
      feedback: [],
      completionRate: 0,
      satisfactionScore: 0,
    }
    
    this.testSessions.push(session)
    return session
  }
  
  private getDefaultScenarios(): TestScenario[] {
    return [
      {
        id: 'navigation_basic',
        description: 'Navigate through the app using screen reader',
        steps: [
          'Open the app',
          'Navigate to the games section',
          'Select a game',
          'Play through 3 cards',
          'Return to home screen',
        ],
        expectedOutcome: 'User can complete navigation without assistance',
        success: false,
        timeToComplete: 0,
        difficultiesEncountered: [],
      },
      {
        id: 'game_play',
        description: 'Complete a full game session',
        steps: [
          'Start a new game',
          'Navigate through at least 10 cards',
          'Use pause functionality',
          'Complete the game',
          'View results',
        ],
        expectedOutcome: 'User can play game independently',
        success: false,
        timeToComplete: 0,
        difficultiesEncountered: [],
      },
      {
        id: 'settings_access',
        description: 'Access and modify accessibility settings',
        steps: [
          'Navigate to settings',
          'Find accessibility options',
          'Change text size',
          'Enable high contrast mode',
          'Save changes',
        ],
        expectedOutcome: 'User can customize accessibility settings',
        success: false,
        timeToComplete: 0,
        difficultiesEncountered: [],
      },
    ]
  }
  
  recordScenarioResult(
    sessionId: string,
    scenarioId: string,
    result: Partial<TestScenario>
  ) {
    const session = this.testSessions.find(s => s.userId === sessionId)
    if (!session) return
    
    const scenario = session.testScenarios.find(s => s.id === scenarioId)
    if (!scenario) return
    
    Object.assign(scenario, result)
    
    // Update completion rate
    const completedScenarios = session.testScenarios.filter(s => s.success).length
    session.completionRate = completedScenarios / session.testScenarios.length
  }
  
  addFeedback(sessionId: string, feedback: UserFeedback) {
    const session = this.testSessions.find(s => s.userId === sessionId)
    if (session) {
      session.feedback.push(feedback)
    }
  }
  
  generateReport(sessionId: string): AccessibilityTestReport {
    const session = this.testSessions.find(s => s.userId === sessionId)
    if (!session) throw new Error('Session not found')
    
    const criticalIssues = session.feedback.filter(f => f.severity === 'critical')
    const moderateIssues = session.feedback.filter(f => f.severity === 'moderate')
    const minorIssues = session.feedback.filter(f => f.severity === 'minor')
    
    return {
      sessionId,
      completionRate: session.completionRate,
      satisfactionScore: session.satisfactionScore,
      criticalIssues: criticalIssues.length,
      moderateIssues: moderateIssues.length,
      minorIssues: minorIssues.length,
      recommendations: this.generateRecommendations(session),
      prioritizedFixes: this.prioritizeFixes(session.feedback),
    }
  }
  
  private generateRecommendations(session: AccessibilityTestSession): string[] {
    const recommendations: string[] = []
    
    if (session.completionRate < 0.8) {
      recommendations.push('Consider simplifying navigation structure')
    }
    
    if (session.satisfactionScore < 3) {
      recommendations.push('Focus on improving user experience quality')
    }
    
    const commonDifficulties = this.findCommonDifficulties(session)
    commonDifficulties.forEach(difficulty => {
      recommendations.push(`Address common difficulty: ${difficulty}`)
    })
    
    return recommendations
  }
  
  private findCommonDifficulties(session: AccessibilityTestSession): string[] {
    const allDifficulties = session.testScenarios.flatMap(s => s.difficultiesEncountered)
    const difficultyCount = allDifficulties.reduce((acc, difficulty) => {
      acc[difficulty] = (acc[difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(difficultyCount)
      .filter(([_, count]) => count >= 2)
      .map(([difficulty]) => difficulty)
  }
  
  private prioritizeFixes(feedback: UserFeedback[]): UserFeedback[] {
    return feedback.sort((a, b) => {
      const severityWeight = { critical: 3, moderate: 2, minor: 1 }
      return severityWeight[b.severity] - severityWeight[a.severity]
    })
  }
}

export const userTestingManager = new AccessibilityUserTestingManager()
```

This comprehensive accessibility implementation ensures the Flash Card Game Store provides an inclusive experience for all users, meeting international accessibility standards while maintaining the app's core functionality and visual appeal.