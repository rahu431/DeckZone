# Picture Charades - Game Specification

## Game Overview
Visual acting game where players act out images shown on cards without speaking, while others guess the answer.

## Core Mechanics

### Gameplay Flow
1. **Setup**: Select difficulty level (Easy/Medium/Hard)
2. **Card Display**: Full-screen image with subtle hint text
3. **Acting Phase**: Current player acts out the image
4. **Guessing Phase**: Other players guess the answer
5. **Reveal**: Swipe up to show answer and next card
6. **Scoring**: Optional point tracking

### Card Structure
```json
{
  "id": "charades_001",
  "game": "picture_charades",
  "difficulty": "easy|medium|hard",
  "category": "animals|objects|actions|movies|food",
  "image": "assets/images/charades/elephant.jpg",
  "answer": "Elephant",
  "hint": "Large African animal",
  "alternativeAnswers": ["Mammoth", "Big animal"],
  "tags": ["animal", "safari", "trunk"],
  "duration": 60
}
```

### Difficulty Levels

#### Easy (Family-Friendly)
- **Target**: Ages 6+ 
- **Content**: Common animals, basic objects, simple actions
- **Examples**: Dog, Cat, Eating, Sleeping, Car, House
- **Hint Level**: Clear, descriptive hints

#### Medium (Standard Party)
- **Target**: Ages 13+
- **Content**: Pop culture, complex actions, abstract concepts
- **Examples**: Netflix, Yoga, Smartphone, Cooking, Dancing
- **Hint Level**: Moderate hints, some wordplay

#### Hard (Challenge Mode)
- **Target**: Adults
- **Content**: Obscure references, complex concepts, wordplay
- **Examples**: Cryptocurrency, Existential Crisis, Déjà Vu
- **Hint Level**: Minimal or cryptic hints

## Categories

### Animals (50+ cards)
- **Easy**: Common pets, farm animals, zoo animals
- **Medium**: Exotic animals, specific breeds, animal behaviors
- **Hard**: Extinct animals, scientific names, animal sounds

### Objects (60+ cards)
- **Easy**: Household items, tools, furniture
- **Medium**: Electronics, vehicles, sports equipment
- **Hard**: Abstract objects, technical equipment, vintage items

### Actions (40+ cards)
- **Easy**: Basic movements, daily activities
- **Medium**: Sports actions, emotional expressions
- **Hard**: Complex actions, professional activities

### Movies & TV (30+ cards)
- **Easy**: Classic Disney, popular franchises
- **Medium**: Recent blockbusters, TV shows
- **Hard**: Independent films, foreign cinema

### Food & Drink (35+ cards)
- **Easy**: Basic foods, fruits, vegetables
- **Medium**: International cuisine, cooking methods
- **Hard**: Exotic foods, cooking techniques

## User Interface Specifications

### Card Display
- **Layout**: Full-screen vertical orientation
- **Image**: Centered, max 70% of screen height
- **Answer Text**: Hidden until reveal
- **Hint Text**: Small, bottom overlay (optional)
- **Timer**: Circular progress indicator (top-right)

### Navigation
- **Primary**: Swipe up/down for next/previous
- **Secondary**: Tap to pause/settings
- **Gesture**: Long press for answer reveal
- **Accessibility**: Voice commands, large text options

### Visual Design
- **Background**: Dark gradient to focus on image
- **Image Frame**: Subtle border with rounded corners
- **Typography**: High contrast, large readable fonts
- **Colors**: Vibrant accent colors for categories

## Game Features

### Timer System
- **Default**: 60 seconds per card
- **Options**: 30s, 60s, 90s, unlimited
- **Visual**: Circular countdown with color change
- **Audio**: Optional countdown beeps

### Scoring (Optional)
- **Points**: 1 point per correct guess
- **Bonus**: Time bonus for quick guesses
- **Tracking**: Session total, personal best
- **Display**: Minimal overlay, full screen on game end

### Social Features
- **Share**: Share funny moments (image + caption)
- **Favorites**: Save favorite cards
- **Custom**: User-submitted cards (future feature)

## Content Guidelines

### Image Requirements
- **Resolution**: Minimum 800x600px
- **Format**: JPEG, PNG optimized for mobile
- **Style**: Clear, recognizable, family-friendly
- **Accessibility**: High contrast, clear subjects

### Content Standards
- **Inclusive**: Diverse representation
- **Appropriate**: Age-appropriate for target audience
- **Cultural**: Avoid culturally insensitive content
- **Legal**: Royalty-free or properly licensed images

## Technical Implementation

### Data Storage
- **Local**: AsyncStorage for offline access
- **Cloud**: Firebase for user favorites, stats
- **Images**: Bundled with app for offline play
- **Updates**: Over-the-air content updates

### Performance
- **Loading**: Preload next 3 cards
- **Memory**: Optimize image sizes
- **Animation**: Smooth transitions (60fps)
- **Responsive**: Adapt to different screen sizes

### Analytics
- **Engagement**: Most played cards, skip rates
- **Difficulty**: Success rates per difficulty
- **Categories**: Most popular categories
- **Session**: Average session length, cards per session