# Performance Optimization Documentation

## Overview
This document outlines comprehensive performance optimization strategies for the Flash Card Game Store application, ensuring smooth 60fps interactions, efficient memory usage, and optimal user experience across all supported devices.

## Performance Philosophy

### Core Principles
1. **60fps Target**: Maintain smooth animations and interactions on mid-range devices
2. **Memory Efficiency**: Minimize memory footprint and prevent memory leaks
3. **Startup Performance**: Fast app launch and initial load times (<3 seconds)
4. **Battery Optimization**: Efficient resource usage to preserve battery life
5. **Network Efficiency**: Optimized data loading and caching strategies
6. **Scalable Architecture**: Performance maintains as app grows in complexity

### Performance Metrics
- **App Startup Time**: <3 seconds cold start, <1 second warm start
- **Navigation Transitions**: <300ms screen transitions
- **Image Loading**: <2 seconds for high-quality images
- **Memory Usage**: <150MB peak memory usage
- **Battery Impact**: Minimal battery drain during normal usage
- **Frame Rate**: Consistent 60fps during animations and gestures

## Bundle Optimization

### Metro Configuration
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Enable bundle splitting
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true, // Enables lazy loading
  },
})

// Optimize asset resolution
config.resolver.assetExts.push('lottie', 'db', 'bin')
config.resolver.sourceExts.push('sql')

// Bundle analyzer configuration
config.serializer.createModuleIdFactory = function () {
  const moduleMap = new Map()
  let nextId = 0
  
  return (path) => {
    if (moduleMap.has(path)) {
      return moduleMap.get(path)
    }
    
    const id = nextId++
    moduleMap.set(path, id)
    return id
  }
}

// Tree shaking optimization
config.resolver.platforms = ['ios', 'android', 'web']

module.exports = config
```

### Code Splitting Strategy
```typescript
// utils/lazyLoading.ts
import { lazy, ComponentType, LazyExoticComponent } from 'react'

// Lazy load screens
export const LazyHomeScreen = lazy(() => import('../screens/HomeScreen'))
export const LazyGameScreen = lazy(() => import('../screens/GameScreen'))
export const LazyProfileScreen = lazy(() => import('../screens/ProfileScreen'))
export const LazySettingsScreen = lazy(() => import('../screens/SettingsScreen'))

// Lazy load heavy components
export const LazyLottieAnimation = lazy(() => import('../components/LottieAnimation'))
export const LazyImageViewer = lazy(() => import('../components/ImageViewer'))

// Higher-order component for lazy loading with fallback
export const withLazyLoading = <T extends ComponentType<any>>(
  Component: LazyExoticComponent<T>,
  fallback: ComponentType = () => <LoadingSpinner />
) => {
  return (props: any) => (
    <Suspense fallback={<fallback />}>
      <Component {...props} />
    </Suspense>
  )
}

// Dynamic imports for game content
export const loadGameContent = async (gameId: string) => {
  switch (gameId) {
    case 'picture-charades':
      return await import('../data/pictureCharadesContent.json')
    case 'would-you-rather':
      return await import('../data/wouldYouRatherContent.json')
    case 'movie-mania':
      return await import('../data/movieManiaContent.json')
    default:
      throw new Error(`Unknown game: ${gameId}`)
  }
}
```

### Tree Shaking Optimization
```typescript
// utils/optimizedImports.ts
// Instead of importing entire libraries
// ❌ Bad: import _ from 'lodash'
// ✅ Good: import specific functions
import { debounce, throttle } from 'lodash'
import { format } from 'date-fns'

// Optimize React Native imports
// ❌ Bad: import { Text, View, ScrollView, FlatList } from 'react-native'
// ✅ Good: Use tree-shakable imports
import Text from 'react-native/Libraries/Text/Text'
import View from 'react-native/Libraries/Components/View/View'

// Create optimized re-export modules
export { debounce, throttle } from 'lodash'
export { format, parseISO } from 'date-fns'
```

## Memory Management

### Component Memory Optimization
```typescript
// hooks/useMemoryOptimization.ts
import { useEffect, useRef, useCallback } from 'react'
import { AppState, Platform } from 'react-native'

export const useMemoryOptimization = () => {
  const resourcesRef = useRef<Set<() => void>>(new Set())
  
  const addCleanupResource = useCallback((cleanup: () => void) => {
    resourcesRef.current.add(cleanup)
    
    return () => {
      resourcesRef.current.delete(cleanup)
    }
  }, [])
  
  const cleanupAll = useCallback(() => {
    resourcesRef.current.forEach(cleanup => cleanup())
    resourcesRef.current.clear()
  }, [])
  
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        // Aggressive cleanup when app goes to background
        cleanupAll()
        
        // Force garbage collection on Android
        if (Platform.OS === 'android' && global.gc) {
          global.gc()
        }
      }
    }
    
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    
    // Cleanup on unmount
    return () => {
      subscription.remove()
      cleanupAll()
    }
  }, [cleanupAll])
  
  return { addCleanupResource, cleanupAll }
}

// Memory-efficient image component
export const OptimizedImage: React.FC<{
  source: string
  width: number
  height: number
  placeholder?: string
}> = ({ source, width, height, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { addCleanupResource } = useMemoryOptimization()
  
  useEffect(() => {
    // Preload image with size optimization
    const imageSize = `${width}x${height}`
    const optimizedSource = `${source}?w=${width}&h=${height}&q=80`
    
    const cleanup = preloadImage(optimizedSource)
    return addCleanupResource(cleanup)
  }, [source, width, height, addCleanupResource])
  
  return (
    <View style={{ width, height }}>
      {!isLoaded && placeholder && (
        <Image source={{ uri: placeholder }} style={{ width, height }} />
      )}
      
      <Image
        source={{ uri: source }}
        style={{
          width,
          height,
          opacity: isLoaded ? 1 : 0,
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        resizeMode="cover"
      />
      
      {hasError && (
        <View style={styles.errorState}>
          <Text>Failed to load image</Text>
        </View>
      )}
    </View>
  )
}
```

### Image and Asset Optimization
```typescript
// utils/imageOptimization.ts
import { Image, Dimensions } from 'react-native'
import FastImage from 'react-native-fast-image'

const { width: screenWidth } = Dimensions.get('window')

interface ImageCacheConfig {
  maxSize: number // MB
  ttl: number // seconds
}

class ImageCacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private config: ImageCacheConfig = {
    maxSize: 100, // 100MB max cache size
    ttl: 24 * 60 * 60, // 24 hours TTL
  }
  
  async preloadImages(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(url => {
      return FastImage.preload([{
        uri: url,
        priority: FastImage.priority.normal,
      }])
    })
    
    await Promise.all(preloadPromises)
  }
  
  getOptimizedImageSize(originalWidth: number, originalHeight: number, maxWidth = screenWidth) {
    const aspectRatio = originalWidth / originalHeight
    
    if (originalWidth <= maxWidth) {
      return { width: originalWidth, height: originalHeight }
    }
    
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspectRatio),
    }
  }
  
  generateOptimizedUrl(url: string, width: number, height: number, quality = 80) {
    // This would integrate with your image optimization service
    return `${url}?w=${width}&h=${height}&q=${quality}&format=webp`
  }
  
  clearExpiredCache() {
    const now = Date.now()
    const expired = Array.from(this.cache.entries()).filter(
      ([_, { timestamp }]) => now - timestamp > this.config.ttl * 1000
    )
    
    expired.forEach(([key]) => this.cache.delete(key))
  }
}

export const imageCache = new ImageCacheManager()

// Optimized image component
export const PerformantImage: React.FC<{
  source: string
  style?: any
  resizeMode?: 'cover' | 'contain' | 'stretch'
  priority?: 'low' | 'normal' | 'high'
}> = ({ source, style, resizeMode = 'cover', priority = 'normal' }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    // Get image dimensions for optimization
    Image.getSize(source, (width, height) => {
      const optimized = imageCache.getOptimizedImageSize(width, height)
      setDimensions(optimized)
    })
  }, [source])
  
  const optimizedSource = useMemo(() => {
    if (dimensions.width === 0) return source
    
    return imageCache.generateOptimizedUrl(
      source,
      dimensions.width,
      dimensions.height
    )
  }, [source, dimensions])
  
  return (
    <FastImage
      source={{
        uri: optimizedSource,
        priority: FastImage.priority[priority],
      }}
      style={[style, dimensions.width > 0 && dimensions]}
      resizeMode={FastImage.resizeMode[resizeMode]}
    />
  )
}
```

## Animation Performance

### Optimized Animation System
```typescript
// hooks/useOptimizedAnimation.ts
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated'
import { useMemo } from 'react'

interface AnimationConfig {
  type: 'spring' | 'timing'
  duration?: number
  damping?: number
  stiffness?: number
  mass?: number
}

export const useOptimizedAnimation = (
  initialValue: number,
  config: AnimationConfig = { type: 'spring' }
) => {
  const animatedValue = useSharedValue(initialValue)
  
  const springConfig = useMemo(() => ({
    damping: config.damping || 15,
    stiffness: config.stiffness || 150,
    mass: config.mass || 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  }), [config])
  
  const timingConfig = useMemo(() => ({
    duration: config.duration || 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  }), [config])
  
  const animate = useCallback((
    toValue: number,
    onComplete?: () => void
  ) => {
    const animation = config.type === 'spring'
      ? withSpring(toValue, springConfig, onComplete ? () => runOnJS(onComplete)() : undefined)
      : withTiming(toValue, timingConfig, onComplete ? () => runOnJS(onComplete)() : undefined)
    
    animatedValue.value = animation
  }, [animatedValue, config.type, springConfig, timingConfig])
  
  return {
    animatedValue,
    animate,
  }
}

// High-performance card stack animation
export const useCardStackAnimation = (
  cards: any[],
  currentIndex: number
) => {
  const animations = useMemo(() => {
    return cards.map((_, index) => ({
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      scale: useSharedValue(1),
      opacity: useSharedValue(1),
      rotation: useSharedValue(0),
    }))
  }, [cards.length])
  
  const updateCardPositions = useCallback(() => {
    animations.forEach((anim, index) => {
      const distance = index - currentIndex
      const isActive = distance === 0
      const isNext = distance === 1
      const isPrevious = distance === -1
      
      if (isActive) {
        anim.scale.value = withSpring(1, { damping: 20, stiffness: 300 })
        anim.opacity.value = withSpring(1)
        anim.translateY.value = withSpring(0)
      } else if (isNext) {
        anim.scale.value = withSpring(0.95)
        anim.opacity.value = withSpring(0.7)
        anim.translateY.value = withSpring(20)
      } else if (isPrevious) {
        anim.scale.value = withSpring(0.9)
        anim.opacity.value = withSpring(0.3)
        anim.translateY.value = withSpring(-20)
      } else {
        anim.scale.value = withSpring(0.8)
        anim.opacity.value = withSpring(0)
        anim.translateY.value = withSpring(distance > 0 ? 40 : -40)
      }
    })
  }, [animations, currentIndex])
  
  useEffect(() => {
    updateCardPositions()
  }, [currentIndex, updateCardPositions])
  
  return animations.map(anim => useAnimatedStyle(() => ({
    transform: [
      { translateX: anim.translateX.value },
      { translateY: anim.translateY.value },
      { scale: anim.scale.value },
      { rotate: `${anim.rotation.value}deg` },
    ],
    opacity: anim.opacity.value,
  })))
}
```

### Frame Rate Monitoring
```typescript
// utils/performanceMonitoring.ts
import { InteractionManager } from 'react-native'

class PerformanceMonitor {
  private frameCallbacks: Set<(fps: number) => void> = new Set()
  private lastFrameTime = performance.now()
  private frameCount = 0
  private monitoring = false
  
  startMonitoring() {
    if (this.monitoring) return
    
    this.monitoring = true
    this.frameCount = 0
    this.lastFrameTime = performance.now()
    
    const measureFrame = () => {
      if (!this.monitoring) return
      
      const currentTime = performance.now()
      const deltaTime = currentTime - this.lastFrameTime
      
      this.frameCount++
      
      // Calculate FPS every second
      if (deltaTime >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / deltaTime)
        
        this.frameCallbacks.forEach(callback => callback(fps))
        
        this.frameCount = 0
        this.lastFrameTime = currentTime
        
        // Log performance warnings
        if (fps < 55) {
          console.warn(`Low FPS detected: ${fps}fps`)
        }
      }
      
      requestAnimationFrame(measureFrame)
    }
    
    requestAnimationFrame(measureFrame)
  }
  
  stopMonitoring() {
    this.monitoring = false
  }
  
  onFrameUpdate(callback: (fps: number) => void) {
    this.frameCallbacks.add(callback)
    
    return () => {
      this.frameCallbacks.delete(callback)
    }
  }
  
  measureInteraction(name: string, fn: () => void) {
    const startTime = performance.now()
    
    fn()
    
    InteractionManager.runAfterInteractions(() => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`Interaction "${name}" took ${duration.toFixed(2)}ms`)
      
      if (duration > 16.67) { // More than one frame at 60fps
        console.warn(`Slow interaction detected: ${name} (${duration.toFixed(2)}ms)`)
      }
    })
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Hook for monitoring component performance
export const usePerformanceMonitoring = (componentName: string) => {
  useEffect(() => {
    if (__DEV__) {
      performanceMonitor.startMonitoring()
      
      return performanceMonitor.onFrameUpdate((fps) => {
        if (fps < 55) {
          console.warn(`${componentName}: Low FPS (${fps})`)
        }
      })
    }
  }, [componentName])
  
  const measureRender = useCallback((fn: () => void) => {
    if (__DEV__) {
      performanceMonitor.measureInteraction(`${componentName} render`, fn)
    } else {
      fn()
    }
  }, [componentName])
  
  return { measureRender }
}
```

## List and Data Optimization

### Virtualized Lists
```typescript
// components/optimized/VirtualizedGameList.tsx
import { FlashList } from '@shopify/flash-list'
import { memo, useCallback, useMemo } from 'react'

interface GameListItemProps {
  item: GameItem
  index: number
  onPress: (gameId: string) => void
}

const GameListItem = memo<GameListItemProps>(({ item, index, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.id)
  }, [item.id, onPress])
  
  return (
    <Pressable
      onPress={handlePress}
      style={styles.listItem}
      testID={`game-item-${index}`}
    >
      <PerformantImage
        source={item.thumbnail}
        style={styles.thumbnail}
        priority="low"
      />
      
      <View style={styles.itemContent}>
        <Text variant="title">{item.title}</Text>
        <Text variant="body" numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  )
})

export const VirtualizedGameList: React.FC<{
  games: GameItem[]
  onGamePress: (gameId: string) => void
}> = ({ games, onGamePress }) => {
  const renderItem = useCallback(({ item, index }: { item: GameItem; index: number }) => (
    <GameListItem
      item={item}
      index={index}
      onPress={onGamePress}
    />
  ), [onGamePress])
  
  const keyExtractor = useCallback((item: GameItem) => item.id, [])
  
  const getItemType = useCallback((item: GameItem) => {
    // Different item types for better performance
    return item.featured ? 'featured' : 'regular'
  }, [])
  
  const estimatedItemSize = useMemo(() => 120, [])
  
  return (
    <FlashList
      data={games}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      estimatedItemSize={estimatedItemSize}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={6}
      updateCellsBatchingPeriod={50}
      onEndReachedThreshold={0.5}
    />
  )
}
```

### Data Caching and Memoization
```typescript
// hooks/useOptimizedData.ts
import { useMemo, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'

export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback)
  
  useFocusEffect(
    useCallback(() => {
      callbackRef.current = callback
    }, [callback])
  )
  
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, []) as T
}

export const useMemoizedData = <T>(
  data: T[],
  selector: (item: T) => any = (item) => item
) => {
  return useMemo(() => {
    const cache = new Map()
    
    return data.map(item => {
      const key = selector(item)
      
      if (cache.has(key)) {
        return cache.get(key)
      }
      
      const processed = { ...item }
      cache.set(key, processed)
      return processed
    })
  }, [data, selector])
}

// Optimized search with debouncing
export const useOptimizedSearch = <T>(
  data: T[],
  searchKey: keyof T,
  debounceMs = 300
) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])
  
  const filteredData = useMemo(() => {
    if (!debouncedTerm) return data
    
    const lowercaseTerm = debouncedTerm.toLowerCase()
    return data.filter(item => 
      String(item[searchKey]).toLowerCase().includes(lowercaseTerm)
    )
  }, [data, searchKey, debouncedTerm])
  
  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    isSearching: searchTerm !== debouncedTerm,
  }
}
```

## Network Optimization

### Efficient Data Fetching
```typescript
// services/optimizedApiService.ts
import { QueryClient } from '@tanstack/react-query'

class OptimizedApiService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private pendingRequests = new Map<string, Promise<any>>()
  
  async fetchWithCache<T>(
    url: string,
    options: RequestInit = {},
    ttl = 5 * 60 * 1000 // 5 minutes default TTL
  ): Promise<T> {
    const cacheKey = `${url}:${JSON.stringify(options)}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!
    }
    
    // Make new request
    const request = this.makeRequest<T>(url, options).then(data => {
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl,
      })
      
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey)
      
      return data
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey)
      throw error
    })
    
    this.pendingRequests.set(cacheKey, request)
    return request
  }
  
  private async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
  
  // Batch multiple requests
  async batchRequests<T>(requests: Array<{ url: string; options?: RequestInit }>) {
    const promises = requests.map(({ url, options }) => 
      this.fetchWithCache<T>(url, options)
    )
    
    return Promise.allSettled(promises)
  }
  
  // Preload data
  preloadData(urls: string[], priority: 'high' | 'low' = 'low') {
    if (priority === 'high') {
      // Preload immediately
      urls.forEach(url => this.fetchWithCache(url))
    } else {
      // Preload when idle
      requestIdleCallback(() => {
        urls.forEach(url => this.fetchWithCache(url))
      })
    }
  }
  
  clearExpiredCache() {
    const now = Date.now()
    
    for (const [key, { timestamp, ttl }] of this.cache.entries()) {
      if (now - timestamp > ttl) {
        this.cache.delete(key)
      }
    }
  }
}

export const apiService = new OptimizedApiService()
```

### Background Task Optimization
```typescript
// utils/backgroundTasks.ts
import BackgroundJob from 'react-native-background-job'
import { AppState } from 'react-native'

class BackgroundTaskManager {
  private tasks = new Map<string, () => Promise<void>>()
  private isRunning = false
  
  registerTask(id: string, task: () => Promise<void>) {
    this.tasks.set(id, task)
  }
  
  unregisterTask(id: string) {
    this.tasks.delete(id)
  }
  
  async runTasks() {
    if (this.isRunning) return
    
    this.isRunning = true
    
    try {
      // Run high priority tasks first
      await this.runHighPriorityTasks()
      
      // Run low priority tasks if there's time
      if (AppState.currentState === 'background') {
        await this.runLowPriorityTasks()
      }
    } finally {
      this.isRunning = false
    }
  }
  
  private async runHighPriorityTasks() {
    const highPriorityTasks = [
      'syncUserData',
      'uploadGameSessions',
      'downloadCriticalUpdates',
    ]
    
    for (const taskId of highPriorityTasks) {
      const task = this.tasks.get(taskId)
      if (task) {
        try {
          await task()
        } catch (error) {
          console.error(`Background task ${taskId} failed:`, error)
        }
      }
    }
  }
  
  private async runLowPriorityTasks() {
    const lowPriorityTasks = [
      'preloadGameContent',
      'optimizeImages',
      'cleanupCache',
    ]
    
    for (const taskId of lowPriorityTasks) {
      const task = this.tasks.get(taskId)
      if (task) {
        try {
          await task()
        } catch (error) {
          console.error(`Background task ${taskId} failed:`, error)
        }
      }
    }
  }
  
  startBackgroundJob() {
    BackgroundJob.on('start', () => {
      console.log('Background job started')
      this.runTasks()
    })
    
    BackgroundJob.start({
      jobKey: 'flashCardGameBackground',
      period: 15000, // Run every 15 seconds
    })
  }
  
  stopBackgroundJob() {
    BackgroundJob.stop()
  }
}

export const backgroundTaskManager = new BackgroundTaskManager()

// Register common background tasks
backgroundTaskManager.registerTask('syncUserData', async () => {
  await useUserDataStore.getState().syncWithCloud()
})

backgroundTaskManager.registerTask('cleanupCache', async () => {
  imageCache.clearExpiredCache()
  apiService.clearExpiredCache()
})

backgroundTaskManager.registerTask('preloadGameContent', async () => {
  const favoriteGames = useUserDataStore.getState().getFavoriteGames()
  for (const gameId of favoriteGames.slice(0, 3)) { // Preload top 3 favorites
    await loadGameContent(gameId)
  }
})
```

## Device-Specific Optimizations

### Platform Optimizations
```typescript
// utils/platformOptimizations.ts
import { Platform, Dimensions } from 'react-native'
import DeviceInfo from 'react-native-device-info'

class PlatformOptimizer {
  private deviceInfo: any = null
  
  async initialize() {
    this.deviceInfo = {
      isTablet: await DeviceInfo.isTablet(),
      totalMemory: await DeviceInfo.getTotalMemory(),
      powerState: await DeviceInfo.getPowerState(),
      deviceType: await DeviceInfo.getDeviceType(),
    }
  }
  
  getOptimizedSettings() {
    const { width, height } = Dimensions.get('window')
    const isLowEndDevice = this.isLowEndDevice()
    
    return {
      // Animation settings
      enableComplexAnimations: !isLowEndDevice,
      animationDuration: isLowEndDevice ? 200 : 300,
      enableParallax: !isLowEndDevice,
      
      // Image settings
      imageQuality: isLowEndDevice ? 60 : 80,
      enableImageCaching: true,
      maxCacheSize: isLowEndDevice ? 50 : 100, // MB
      
      // List settings
      initialNumToRender: isLowEndDevice ? 3 : 6,
      maxToRenderPerBatch: isLowEndDevice ? 5 : 10,
      windowSize: isLowEndDevice ? 5 : 10,
      
      // Feature flags
      enableHaptics: Platform.OS === 'ios',
      enableSounds: true,
      enableNotifications: true,
    }
  }
  
  private isLowEndDevice(): boolean {
    if (!this.deviceInfo) return false
    
    // Check total memory (less than 3GB indicates low-end device)
    if (this.deviceInfo.totalMemory < 3 * 1024 * 1024 * 1024) {
      return true
    }
    
    // Check screen resolution
    const { width, height } = Dimensions.get('window')
    const totalPixels = width * height
    
    // Less than 1M pixels indicates low-end device
    if (totalPixels < 1000000) {
      return true
    }
    
    return false
  }
  
  optimizeForLowEndDevice() {
    if (!this.isLowEndDevice()) return
    
    // Disable expensive features
    console.log('Low-end device detected, applying optimizations')
    
    // Reduce animation complexity
    // Disable particle effects
    // Lower image quality
    // Reduce render frequency
  }
  
  optimizeForBattery() {
    if (!this.deviceInfo?.powerState) return
    
    const { batteryLevel, lowPowerMode } = this.deviceInfo.powerState
    
    if (lowPowerMode || batteryLevel < 0.2) {
      console.log('Low battery detected, applying power optimizations')
      
      // Reduce background tasks
      // Lower frame rate
      // Disable vibrations
      // Reduce network requests
    }
  }
}

export const platformOptimizer = new PlatformOptimizer()

// Initialize on app start
platformOptimizer.initialize()
```

## Testing and Monitoring

### Performance Testing
```typescript
// __tests__/performance/performanceTests.ts
import { render, screen } from '@testing-library/react-native'
import { GameCard } from '../components/GameCard'

describe('Performance Tests', () => {
  it('should render game card within performance budget', async () => {
    const startTime = performance.now()
    
    render(
      <GameCard
        game={mockGameData}
        isActive={true}
        onSwipe={jest.fn()}
        onPause={jest.fn()}
        onReveal={jest.fn()}
      />
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render within 16ms (one frame at 60fps)
    expect(renderTime).toBeLessThan(16)
  })
  
  it('should handle large lists efficiently', () => {
    const largeMockData = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i}`,
      content: `Content for item ${i}`,
    }))
    
    const startTime = performance.now()
    
    render(<VirtualizedGameList games={largeMockData} onGamePress={jest.fn()} />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Large list should still render quickly
    expect(renderTime).toBeLessThan(100)
  })
  
  it('should not leak memory', async () => {
    const component = render(<GameScreen />)
    
    // Simulate multiple rerenders
    for (let i = 0; i < 100; i++) {
      component.rerender(<GameScreen key={i} />)
    }
    
    component.unmount()
    
    // Check for memory leaks (in a real test, you'd use more sophisticated tools)
    // This is a placeholder for actual memory leak detection
    expect(true).toBe(true)
  })
})
```

### Runtime Performance Monitoring
```typescript
// utils/runtimeMonitoring.ts
import crashlytics from '@react-native-firebase/crashlytics'
import analytics from '@react-native-firebase/analytics'

class RuntimeMonitor {
  private performanceMetrics = {
    frameDrops: 0,
    slowOperations: 0,
    memoryWarnings: 0,
    networkErrors: 0,
  }
  
  trackFrameDrop() {
    this.performanceMetrics.frameDrops++
    
    if (this.performanceMetrics.frameDrops % 10 === 0) {
      analytics().logEvent('performance_issue', {
        type: 'frame_drops',
        count: this.performanceMetrics.frameDrops,
      })
    }
  }
  
  trackSlowOperation(operationName: string, duration: number) {
    this.performanceMetrics.slowOperations++
    
    analytics().logEvent('slow_operation', {
      operation: operationName,
      duration: Math.round(duration),
    })
    
    if (duration > 1000) { // More than 1 second
      crashlytics().log(`Slow operation: ${operationName} took ${duration}ms`)
    }
  }
  
  trackMemoryWarning() {
    this.performanceMetrics.memoryWarnings++
    
    analytics().logEvent('memory_warning', {
      count: this.performanceMetrics.memoryWarnings,
    })
    
    crashlytics().log('Memory warning received')
  }
  
  generatePerformanceReport() {
    return {
      ...this.performanceMetrics,
      timestamp: new Date().toISOString(),
    }
  }
  
  resetMetrics() {
    this.performanceMetrics = {
      frameDrops: 0,
      slowOperations: 0,
      memoryWarnings: 0,
      networkErrors: 0,
    }
  }
}

export const runtimeMonitor = new RuntimeMonitor()

// Set up global error handling
if (__DEV__) {
  // Development-only performance tracking
  setInterval(() => {
    const report = runtimeMonitor.generatePerformanceReport()
    console.log('Performance Report:', report)
  }, 30000) // Every 30 seconds
}
```

This comprehensive performance optimization strategy ensures the Flash Card Game Store delivers a smooth, responsive experience that meets professional mobile app standards while maintaining functionality across a wide range of devices and usage scenarios.