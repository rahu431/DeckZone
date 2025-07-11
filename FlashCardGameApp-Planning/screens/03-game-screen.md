# Game Screen - UI/UX Specification

## Screen Overview
Core gameplay interface featuring TikTok-style full-screen card display with swipe navigation. Optimized for group interaction and immersive experience.

## Layout Structure

### Visual Hierarchy
1. **Status Bar**: Timer, score, progress (minimal overlay)
2. **Card Content**: Full-screen game content
3. **Navigation Hints**: Subtle swipe indicators
4. **Action Controls**: Pause, settings, reveal (hidden by default)
5. **Footer Info**: Game name, card count (auto-hide)

### Component Layout
```
┌─────────────────────────────────────┐
│  ⏱️ 45s    📊 5/50    [⏸️] [⚙️]    │
│                                     │
│                                     │
│        [GAME CONTENT]               │
│                                     │
│     🎭 Picture Charades             │
│                                     │
│     [Large centered image           │
│      or text content]               │
│                                     │
│     "Act this out!"                 │
│                                     │
│     [Hint: Use your whole body]     │
│                                     │
│                                     │
│  ↕️ Swipe up/down                   │
│  👆 Tap to pause                    │
│  🔄 Long press to reveal            │
│                                     │
│  Picture Charades • Card 5 of 50   │
└─────────────────────────────────────┘
```

## Visual Design

### Full-Screen Immersion
- **Background**: Dynamic gradients matching game theme
- **Content**: Maximized screen real estate
- **Overlays**: Minimal, auto-hiding interface elements
- **Focus**: Game content is primary visual element

### Color Schemes by Game
- **Picture Charades**: Warm gradients (orange to red)
- **Would You Rather**: Split gradients (blue to red)
- **Movie Mania**: Cinema-inspired (dark with gold)
- **Ice Breakers**: Friendly pastels (blue to green)
- **Animal Kingdom**: Nature tones (green to brown)

### Typography
- **Game Content**: 24-32px, bold, high contrast
- **Instructions**: 18px, medium, readable
- **Hints**: 14px, regular, subtle
- **Status**: 12px, regular, minimal

## Interactive Elements

### Primary Navigation
- **Swipe Up**: Next card (primary action)
- **Swipe Down**: Previous card (secondary action)
- **Tap**: Pause/resume (emergency action)
- **Long Press**: Reveal answer (help action)

### Touch Zones
```
┌─────────────────────────────────────┐
│  [Settings Zone - 10%]              │
│                                     │
│  [Content Zone - 70%]               │
│  • Tap to pause                     │
│  • Long press to reveal             │
│  • Swipe up/down to navigate        │
│                                     │
│  [Info Zone - 20%]                  │
│  • Game info and hints              │
└─────────────────────────────────────┘
```

### Gesture Feedback
- **Swipe**: Card slides with finger, smooth animation
- **Tap**: Brief screen flash or pulse
- **Long Press**: Progressive reveal animation
- **Edge Cases**: Bounce animation at first/last card

## Game-Specific Layouts

### Picture Charades
- **Image**: Centered, max 60% screen height
- **Title**: Hidden until reveal
- **Hint**: Optional, bottom overlay
- **Instructions**: "Act this out!" prominent display

### Would You Rather
- **Split Layout**: Option A (left) vs Option B (right)
- **Divider**: Central "OR" with contrasting background
- **Options**: Large, readable text blocks
- **Voting**: Tap left/right to vote (optional)

### Movie Mania
- **Movie Poster**: Full-screen or prominent display
- **Challenge**: Acting, describing, or trivia prompt
- **Metadata**: Year, genre, rating (small overlay)
- **Hint Button**: Accessible but not intrusive

### Ice Breakers
- **Question**: Centered, large text
- **Instructions**: Below question, medium size
- **Time Estimate**: Small indicator
- **Category**: Subtle visual identifier

### Animal Kingdom
- **Animal Image**: Full-screen or prominent
- **Acting Hints**: Overlay with movement suggestions
- **Sound Button**: Optional animal sound playback
- **Fun Facts**: Reveal panel with education content

## Status and Progress

### Timer Display
- **Visual**: Circular progress indicator
- **Position**: Top-right corner
- **Colors**: Green → Yellow → Red progression
- **Behavior**: Smooth countdown animation
- **Options**: 30s, 60s, 90s, unlimited

### Progress Tracking
- **Card Counter**: "5 of 50" format
- **Visual Progress**: Subtle progress bar
- **Game Time**: Total session time
- **Score**: Optional point tracking

### Settings Overlay
- **Quick Access**: Pause, timer, difficulty
- **Full Settings**: Game rules, preferences
- **Minimal**: Slide-in panel, quick dismiss
- **Accessibility**: Voice commands, large buttons

## Accessibility Features

### Visual Accessibility
- **High Contrast**: Enhanced contrast mode
- **Large Text**: Scalable fonts up to 200%
- **Color Independence**: No color-only information
- **Focus Indicators**: Clear focus for keyboard nav

### Motor Accessibility
- **Large Touch Areas**: Minimum 44px targets
- **Gesture Alternatives**: Button alternatives to swipes
- **Timing**: Adjustable or unlimited timers
- **Simplified**: Reduced complexity options

### Cognitive Accessibility
- **Clear Instructions**: Simple, direct language
- **Consistent**: Predictable interaction patterns
- **Feedback**: Clear success/error indicators
- **Help**: Always available assistance

## Loading and Transitions

### Card Transitions
- **Swipe Animation**: Smooth slide transition
- **Loading**: Brief loading for next card
- **Preloading**: Next 3 cards ready
- **Error**: Graceful error handling

### Game Launch
- **Preparation**: Brief game setup screen
- **Instructions**: Optional tutorial on first play
- **Smooth Entry**: Seamless transition from home
- **Resume**: Continue from last position

## Error Handling

### Content Errors
- **Missing Image**: Fallback text-only mode
- **Loading Failures**: Retry with user feedback
- **Network Issues**: Offline mode continuation
- **Corrupted Data**: Skip card with notification

### Interaction Errors
- **Gesture Failures**: Alternative input methods
- **Timer Issues**: Manual time control
- **Audio Problems**: Visual-only fallback
- **Performance**: Reduced animation mode

## Performance Optimization

### Memory Management
- **Card Preloading**: Limited to 3-5 cards
- **Image Compression**: Optimized for mobile
- **Cleanup**: Remove unused resources
- **Monitoring**: Performance metrics tracking

### Animation Performance
- **60fps Target**: Smooth animations
- **GPU Acceleration**: Hardware-accelerated transitions
- **Reduced Motion**: Respect system preferences
- **Fallbacks**: Simpler animations on low-end devices

## Analytics Integration

### Gameplay Metrics
- **Card Views**: Time spent per card
- **Navigation**: Swipe patterns and frequency
- **Completion**: Cards completed vs. skipped
- **Engagement**: Session length and depth

### User Behavior
- **Game Preferences**: Most played games
- **Difficulty**: Success rates per difficulty
- **Features**: Most used features
- **Errors**: Common failure points

## Technical Implementation

### Component Architecture
```jsx
GameScreen
├── StatusBar
│   ├── Timer
│   ├── Progress
│   └── Settings
├── CardContainer
│   ├── GameCard
│   │   ├── ContentArea
│   │   ├── InstructionsArea
│   │   └── HintArea
│   └── NavigationGestures
├── SettingsOverlay
│   ├── QuickSettings
│   └── FullSettings
└── ProgressIndicator
```

### State Management
- **Current Card**: Active card data
- **Game State**: Timer, score, progress
- **Settings**: User preferences
- **Navigation**: History and preloaded cards

### Gesture Handling
- **Swipe Detection**: Velocity and direction
- **Tap Recognition**: Single vs. long press
- **Conflict Resolution**: Gesture priority
- **Accessibility**: Alternative input methods