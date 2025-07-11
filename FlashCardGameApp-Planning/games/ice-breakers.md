# Ice Breakers - Game Specification

## Game Overview
Social conversation starter game designed to help groups get to know each other through fun questions, creative prompts, and engaging activities.

## Core Mechanics

### Gameplay Flow
1. **Card Display**: Question or prompt with optional instructions
2. **Reading**: One player reads the prompt aloud
3. **Response**: Designated player(s) answer the question
4. **Discussion**: Group discusses or reacts to answers
5. **Next Round**: Swipe up for next question

### Card Structure
```json
{
  "id": "ice_001",
  "game": "ice_breakers",
  "difficulty": "light|medium|deep",
  "category": "getting_to_know|hypothetical|creative|funny|values",
  "type": "individual|group|interactive",
  "question": "What's the most unusual food combination you actually enjoy?",
  "instructions": "Everyone answers, then vote on the weirdest combo",
  "followUp": "Would you recommend it to others?",
  "ageRating": "everyone|teen|adult",
  "groupSize": "2-4|5-8|8+",
  "timeEstimate": "1-2 min"
}
```

### Difficulty Levels

#### Light (Surface Level)
- **Target**: First meetings, casual groups
- **Content**: Safe, fun, easy-to-answer questions
- **Examples**: "What's your favorite pizza topping?", "Beach or mountains?"
- **Comfort**: Non-threatening, everyone can participate

#### Medium (Personal Sharing)
- **Target**: Friends, team building, social groups
- **Content**: Personal preferences, experiences, opinions
- **Examples**: "What's your hidden talent?", "Biggest fear you've overcome?"
- **Comfort**: Requires some vulnerability

#### Deep (Meaningful Connection)
- **Target**: Close friends, relationship building
- **Content**: Values, beliefs, life experiences
- **Examples**: "What's shaped your worldview?", "Your greatest life lesson?"
- **Comfort**: Requires trust and openness

## Categories

### Getting to Know You (40+ cards)
- **Focus**: Personal background, preferences, experiences
- **Examples**:
  - "What's a skill you'd love to learn?"
  - "Describe your perfect Saturday"
  - "What's something you're proud of but rarely talk about?"

### Hypothetical Scenarios (35+ cards)
- **Focus**: Imagination, decision-making, fun scenarios
- **Examples**:
  - "If you could have dinner with anyone, living or dead, who would it be?"
  - "You have 24 hours to spend $1 million, what do you do?"
  - "If you could master any skill instantly, what would it be?"

### Creative & Fun (30+ cards)
- **Focus**: Humor, creativity, silly questions
- **Examples**:
  - "Create a new holiday - what would it celebrate?"
  - "What would your superhero name and power be?"
  - "If animals could talk, which species would be the rudest?"

### Values & Beliefs (25+ cards)
- **Focus**: Personal values, life philosophy, meaningful topics
- **Examples**:
  - "What's the most important lesson you've learned?"
  - "What cause do you feel passionate about?"
  - "What does success mean to you?"

### Interactive Activities (20+ cards)
- **Focus**: Group activities, physical actions, demonstrations
- **Examples**:
  - "Show your best dance move"
  - "Draw your mood right now"
  - "Act out your morning routine in 30 seconds"

## User Interface Specifications

### Card Layout
- **Header**: Clear category identifier
- **Question**: Large, centered text with good readability
- **Instructions**: Smaller text with game directions
- **Metadata**: Group size, time estimate, difficulty indicator
- **Navigation**: Intuitive swipe controls

### Visual Design
- **Theme**: Warm, inviting colors (oranges, blues, greens)
- **Typography**: Friendly, approachable fonts
- **Background**: Subtle gradients or patterns
- **Icons**: Simple, universal symbols for categories
- **Spacing**: Plenty of white space for easy reading

### Interaction Features
- **Timer**: Optional discussion timer
- **Favorites**: Save interesting questions
- **Skip**: Skip uncomfortable questions
- **Randomize**: Shuffle question order
- **Filters**: Choose categories and difficulty

## Game Features

### Group Management
- **Player Count**: Optimize for group size
- **Turn Order**: Fair rotation system
- **Participation**: Ensure everyone gets involved
- **Comfort Levels**: Respect personal boundaries

### Customization Options
- **Category Selection**: Choose preferred topics
- **Difficulty Filters**: Set comfort level
- **Time Limits**: Optional discussion timers
- **Skip Rules**: Anonymous skip voting
- **Group Settings**: Adjust for group dynamics

### Social Elements
- **Sharing**: Save and share favorite questions
- **Custom Questions**: Add personal questions
- **Group Memory**: Remember group preferences
- **Feedback**: Rate question effectiveness

## Content Guidelines

### Question Quality
- **Inclusive**: Accessible to all backgrounds
- **Appropriate**: Match content to age rating
- **Engaging**: Spark genuine conversation
- **Respectful**: Avoid sensitive or triggering topics

### Writing Standards
- **Clarity**: Clear, unambiguous wording
- **Brevity**: Concise but complete questions
- **Variety**: Mix different question types
- **Balance**: Equal representation across categories

### Safety Considerations
- **Boundaries**: Respect personal limits
- **Sensitivity**: Avoid potentially harmful topics
- **Inclusivity**: Consider diverse experiences
- **Opt-out**: Always allow question skipping

## Technical Implementation

### Data Storage
- **Local Database**: Offline question bank
- **User Preferences**: Save settings and favorites
- **Custom Content**: User-generated questions
- **Analytics**: Track popular questions

### Performance
- **Fast Loading**: Instant question display
- **Smooth Navigation**: Seamless transitions
- **Memory Efficient**: Optimize for long sessions
- **Responsive**: Adapt to different screen sizes

### Accessibility
- **Screen Readers**: Full compatibility
- **Large Text**: Adjustable font sizes
- **Color Contrast**: High visibility options
- **Voice Commands**: Audio navigation support

## Usage Scenarios

### Party Settings
- **Group Size**: 6-12 people
- **Duration**: 30-60 minutes
- **Intensity**: Light to medium questions
- **Goal**: Fun, laughter, casual bonding

### Team Building
- **Group Size**: 4-8 colleagues
- **Duration**: 15-30 minutes
- **Intensity**: Medium questions
- **Goal**: Professional relationship building

### Date Nights
- **Group Size**: 2 people
- **Duration**: 45-90 minutes
- **Intensity**: Medium to deep questions
- **Goal**: Intimate conversation, connection

### Family Gatherings
- **Group Size**: 3-8 family members
- **Duration**: 20-40 minutes
- **Intensity**: Light to medium questions
- **Goal**: Cross-generational bonding

## Expansion Possibilities

### Themed Packs
- **Holiday**: Christmas, Halloween, Valentine's Day
- **Professional**: Workplace, networking events
- **Educational**: Classroom, student groups
- **Cultural**: Multicultural celebration questions

### Advanced Features
- **Video Responses**: Record and share answers
- **Group Challenges**: Team-based activities
- **Progress Tracking**: Relationship depth metrics
- **AI Suggestions**: Personalized question recommendations