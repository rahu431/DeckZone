# Design System Documentation

## Overview
This document defines the complete design system for the Flash Card Game Store mobile application, ensuring consistency, accessibility, and modern social media aesthetics across all platforms.

## Design Philosophy

### Core Principles
1. **Social Media First**: TikTok-inspired full-screen experience with modern aesthetics
2. **Accessibility-Driven**: WCAG 2.1 AA compliance with inclusive design patterns
3. **Performance-Focused**: Optimized for 60fps interactions on mid-range devices
4. **Cross-Platform Consistency**: Unified experience across iOS and Android
5. **Scalable Architecture**: Modular system supporting future feature expansion

### Visual Language
- **Immersive**: Full-screen card interfaces that eliminate distractions
- **Vibrant**: High-energy colors inspired by social platforms
- **Gestural**: Touch-first interactions with intuitive swipe patterns
- **Contextual**: Game-specific theming with category color coding
- **Adaptive**: Responsive to user preferences and system settings

## Color System Architecture

### Color Palette Strategy
Our color system is built on a foundation of semantic meaning, accessibility compliance, and social media aesthetic inspiration.

#### Primary Brand Colors
```css
/* TikTok-inspired primary palette */
--primary-50: #FFF1F2;   /* Ultra light backgrounds */
--primary-100: #FFE4E6;  /* Light tint overlays */
--primary-200: #FECDD3;  /* Subtle accent areas */
--primary-300: #FCA5A5;  /* Disabled state fills */
--primary-400: #F87171;  /* Hover state colors */
--primary-500: #EF4444;  /* Base primary color */
--primary-600: #DC2626;  /* Primary button pressed */
--primary-700: #B91C1C;  /* Dark theme primary */
--primary-800: #991B1B;  /* High contrast mode */
--primary-900: #7F1D1D;  /* Maximum contrast */
```

#### Usage Context
- **50-200**: Background tints, subtle highlights, notification backgrounds
- **300-400**: Interactive element hover states, secondary actions
- **500**: Primary CTAs, active states, brand elements
- **600-700**: Pressed states, dark mode adaptations
- **800-900**: High contrast mode, accessibility overrides

#### Semantic Color Implementation
```css
/* Success states - Nature-inspired greens */
--success-base: #22C55E;     /* Confirmation messages, positive feedback */
--success-light: #BBF7D0;    /* Success background tints */
--success-dark: #15803D;     /* Dark mode success states */

/* Error states - Attention-grabbing reds */
--error-base: #EF4444;       /* Error messages, destructive actions */
--error-light: #FECACA;      /* Error background tints */
--error-dark: #B91C1C;       /* Dark mode error states */

/* Warning states - Alert yellows */
--warning-base: #F59E0B;     /* Caution messages, important notices */
--warning-light: #FDE68A;    /* Warning background tints */
--warning-dark: #D97706;     /* Dark mode warning states */
```

### Game Category Color Coding
Each game type has a distinct color for immediate recognition and user wayfinding.

```css
/* Game category identification */
--game-party: #FF6B6B;       /* High-energy red for party games */
--game-brain: #4ECDC4;       /* Calming teal for brain games */
--game-learning: #45B7D1;    /* Trust-building blue for educational */
--game-social: #96CEB4;      /* Friendly green for social games */
--game-trivia: #FFEAA7;      /* Warm yellow for trivia challenges */
--game-action: #DDA0DD;      /* Energetic purple for active games */
--game-family: #FF8C69;      /* Warm coral for family-friendly */
```

### Accessibility Color Standards

#### Contrast Ratio Requirements
- **Normal Text (18px and below)**: Minimum 4.5:1, Target 7:1
- **Large Text (19px and above)**: Minimum 3.0:1, Target 4.5:1
- **Interactive Elements**: Minimum 3.0:1, Target 4.5:1
- **Graphical Objects**: Minimum 3.0:1, Target 4.5:1

#### High Contrast Mode Support
```css
/* High contrast overrides for accessibility */
@media (prefers-contrast: high) {
  --text-primary: #000000;
  --text-secondary: #000000;
  --background-primary: #FFFFFF;
  --border-color: #000000;
  --focus-indicator: #0066CC;
}
```

## Typography Architecture

### Font Strategy
Our typography system prioritizes readability, performance, and cross-platform consistency.

#### Font Family Hierarchy
```css
/* Primary font stack - System optimized */
--font-primary: 'SF Pro Display', 'Roboto', system-ui, sans-serif;

/* Heading font stack - Brand personality */
--font-heading: 'Inter', 'SF Pro Display', 'Roboto', system-ui, sans-serif;

/* Monospace stack - Code and data */
--font-mono: 'SF Mono', 'Roboto Mono', 'Consolas', monospace;
```

#### Type Scale with Purpose
```css
/* Mobile-optimized type scale */
--text-xs: 12px;     /* Captions, metadata, small labels */
--text-sm: 14px;     /* Body text, secondary information */
--text-base: 16px;   /* Primary body text, default size */
--text-lg: 18px;     /* Emphasized body text, card subtitles */
--text-xl: 20px;     /* Card titles, important content */
--text-2xl: 24px;    /* Section headers, game titles */
--text-3xl: 30px;    /* Page titles, welcome messages */
--text-4xl: 36px;    /* Hero text, app branding */
--text-5xl: 48px;    /* Display text, full-screen content */
--text-6xl: 60px;    /* Massive displays, special occasions */
```

#### Line Height and Spacing
```css
/* Optimal reading and touch experiences */
--leading-none: 1;       /* Tight headlines, display text */
--leading-tight: 1.25;   /* Card titles, compact layouts */
--leading-snug: 1.375;   /* Subtitles, emphasized text */
--leading-normal: 1.5;   /* Body text, comfortable reading */
--leading-relaxed: 1.625; /* Long-form content, accessibility */
--leading-loose: 2;      /* Extremely comfortable reading */
```

#### Component-Specific Typography
```css
/* Card interface typography */
.card-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

.card-body {
  font-size: var(--text-base);
  font-weight: 400;
  line-height: var(--leading-normal);
  letter-spacing: 0;
}

.card-hint {
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: var(--leading-snug);
  letter-spacing: 0.025em;
  opacity: 0.8;
}
```

### Accessibility Typography Features

#### Dynamic Type Support
```css
/* iOS Dynamic Type scaling */
@media (prefers-font-size: small) {
  :root { --scale-factor: 0.875; }
}

@media (prefers-font-size: large) {
  :root { --scale-factor: 1.125; }
}

@media (prefers-font-size: accessibility-large) {
  :root { --scale-factor: 1.4; }
}
```

#### Reading Assistance
```css
/* Dyslexia-friendly alternatives */
.font-dyslexia-friendly {
  font-family: 'OpenDyslexic', var(--font-primary);
  letter-spacing: 0.12em;
  word-spacing: 0.16em;
  line-height: var(--leading-relaxed);
}
```

## Spacing and Layout System

### 8px Grid Foundation
All spacing values are based on an 8px grid system for mathematical consistency and visual harmony.

```css
/* Base spacing scale */
--space-0: 0px;      /* No spacing */
--space-1: 4px;      /* Minimal spacing, tight elements */
--space-2: 8px;      /* Base unit, standard spacing */
--space-3: 12px;     /* Small component spacing */
--space-4: 16px;     /* Standard component spacing */
--space-5: 20px;     /* Medium component spacing */
--space-6: 24px;     /* Large component spacing */
--space-8: 32px;     /* Section spacing */
--space-10: 40px;    /* Major section spacing */
--space-12: 48px;    /* Extra large spacing */
--space-16: 64px;    /* Massive spacing, special layouts */
--space-20: 80px;    /* Maximum spacing values */
```

### Component Spacing Standards

#### Card Interface Spacing
```css
/* Full-screen card layout */
.card-container {
  padding: var(--space-6) var(--space-4);
  gap: var(--space-4);
}

.card-content {
  padding: var(--space-8);
  gap: var(--space-6);
}

.card-actions {
  margin-top: var(--space-8);
  gap: var(--space-4);
}
```

#### Navigation Component Spacing
```css
/* Tab bar and navigation */
.tab-bar {
  height: 80px;
  padding: var(--space-2) var(--space-4) var(--space-5);
}

.nav-item {
  padding: var(--space-3) var(--space-4);
  gap: var(--space-1);
}
```

### Responsive Spacing Strategy

#### Breakpoint-Aware Spacing
```css
/* Mobile-first responsive spacing */
.responsive-container {
  padding: var(--space-4);
}

@media (min-width: 375px) {
  .responsive-container {
    padding: var(--space-6);
  }
}

@media (min-width: 768px) {
  .responsive-container {
    padding: var(--space-8);
    max-width: 600px;
    margin: 0 auto;
  }
}
```

## Component Sizing Standards

### Touch Target Optimization
All interactive elements meet or exceed platform accessibility standards.

```css
/* Platform-specific touch targets */
.touch-target-minimum {
  min-width: 44px;   /* iOS minimum */
  min-height: 44px;
}

.touch-target-android {
  min-width: 48px;   /* Android minimum */
  min-height: 48px;
}

.touch-target-recommended {
  min-width: 48px;   /* Recommended for all platforms */
  min-height: 48px;
}

.touch-target-large {
  min-width: 60px;   /* Enhanced accessibility */
  min-height: 60px;
}
```

### Button Sizing Hierarchy
```css
/* Button size variants */
.button-small {
  height: 32px;
  padding: 0 var(--space-3);
  min-width: 80px;
  font-size: var(--text-sm);
}

.button-medium {
  height: 44px;
  padding: 0 var(--space-4);
  min-width: 120px;
  font-size: var(--text-base);
}

.button-large {
  height: 52px;
  padding: 0 var(--space-6);
  min-width: 160px;
  font-size: var(--text-lg);
}
```

### Card Aspect Ratios
```css
/* TikTok-style card proportions */
.card-fullscreen {
  aspect-ratio: 9 / 16;  /* Vertical mobile orientation */
  width: 100vw;
  height: 100vh;
}

.card-preview {
  aspect-ratio: 9 / 16;
  width: 90%;
  height: 80vh;
}

.card-thumbnail {
  aspect-ratio: 3 / 4;
  width: 120px;
  height: 160px;
}
```

## Visual Hierarchy Framework

### Z-Index Management
Systematic layering ensures proper element stacking across the application.

```css
/* Z-index scale for consistent layering */
:root {
  --z-background: -1;
  --z-base: 0;
  --z-content: 1;
  --z-sticky: 10;
  --z-fixed: 20;
  --z-overlay: 100;
  --z-modal: 200;
  --z-popover: 300;
  --z-tooltip: 400;
  --z-notification: 500;
}
```

### Focus State Management
```css
/* Consistent focus indicators */
.focus-indicator {
  outline: 3px solid var(--focus-color);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Card focus states for swipe navigation */
.card-active {
  z-index: var(--z-fixed);
  transform: scale(1) translateY(0);
  opacity: 1;
}

.card-next {
  z-index: var(--z-content);
  transform: scale(0.95) translateY(20px);
  opacity: 0.7;
}

.card-previous {
  z-index: var(--z-base);
  transform: scale(0.9) translateY(-20px);
  opacity: 0.3;
}
```

### Content Hierarchy Patterns
```css
/* Information architecture */
.hierarchy-primary {
  font-weight: 700;
  color: var(--text-primary);
  opacity: 1;
}

.hierarchy-secondary {
  font-weight: 600;
  color: var(--text-secondary);
  opacity: 0.8;
}

.hierarchy-tertiary {
  font-weight: 500;
  color: var(--text-tertiary);
  opacity: 0.6;
}

.hierarchy-supplementary {
  font-weight: 400;
  color: var(--text-hint);
  opacity: 0.5;
}
```

## Animation and Motion Design

### Animation Principles
1. **Purposeful**: Every animation serves a functional purpose
2. **Responsive**: Animations feel immediate and connected to user input
3. **Consistent**: Timing and easing create a cohesive experience
4. **Accessible**: Respects reduced motion preferences

### Timing and Easing Standards
```css
/* Animation timing system */
:root {
  --duration-instant: 100ms;
  --duration-quick: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 700ms;
  
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Card Transition Patterns
```css
/* Swipe-based card transitions */
@keyframes cardSlideUp {
  from {
    transform: translateY(100vh) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardSlideDown {
  from {
    transform: translateY(-100vh) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.card-enter {
  animation: cardSlideUp var(--duration-normal) var(--ease-out);
}
```

### Reduced Motion Support
```css
/* Accessibility-first motion handling */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .card-transition {
    transform: none !important;
  }
}
```

## Implementation Guidelines

### CSS Custom Properties Usage
```css
/* Component-scoped CSS variables */
.game-card {
  --card-bg: var(--surface-primary);
  --card-text: var(--text-primary);
  --card-border: var(--border-subtle);
  
  background-color: var(--card-bg);
  color: var(--card-text);
  border: 1px solid var(--card-border);
}

/* Theme-aware variations */
[data-theme="dark"] .game-card {
  --card-bg: var(--surface-dark);
  --card-text: var(--text-dark);
  --card-border: var(--border-dark);
}
```

### Component Documentation Standards
Each component should include:
1. **Purpose**: What problem the component solves
2. **Anatomy**: Visual breakdown of component parts
3. **Behavior**: How the component responds to interaction
4. **Accessibility**: ARIA labels, keyboard support, screen reader guidance
5. **Responsive**: How the component adapts across screen sizes
6. **Theming**: Dark mode and high contrast considerations

### Quality Assurance Checklist
- [ ] WCAG 2.1 AA color contrast compliance
- [ ] Touch target size meets platform standards
- [ ] Typography scales appropriately with system settings
- [ ] Dark mode implementation complete
- [ ] High contrast mode support verified
- [ ] Reduced motion preferences respected
- [ ] Cross-platform consistency validated
- [ ] Performance impact assessed (60fps target)

This design system serves as the foundation for creating a cohesive, accessible, and performant user experience that rivals the quality of leading social media applications while maintaining the unique character of our flash card gaming platform.