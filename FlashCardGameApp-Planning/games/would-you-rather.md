# Would You Rather - Game Specification

## Game Overview
Decision-making game presenting players with two challenging choices, sparking discussion and revealing preferences.

## Core Mechanics

### Gameplay Flow
1. **Card Display**: Full-screen question with two options
2. **Discussion**: Players debate and explain their choice
3. **Selection**: Each player picks Option A or B
4. **Results**: Show group voting results (optional)
5. **Next Card**: Swipe up for next question

### Card Structure
```json
{
  "id": "wyr_001",
  "game": "would_you_rather",
  "difficulty": "easy|medium|hard",
  "category": "funny|philosophical|lifestyle|superpowers|food",
  "question": "Would you rather...",
  "optionA": "Have the ability to fly",
  "optionB": "Be invisible whenever you want",
  "context": "Optional background context",
  "tags": ["superpowers", "abilities", "choice"],
  "ageRating": "everyone|teen|adult"
}
```

### Difficulty Levels

#### Easy (Everyone)
- **Target**: Ages 8+
- **Content**: Simple preferences, fun choices
- **Examples**: "Pizza or ice cream?", "Cat or dog?"
- **Complexity**: Clear, straightforward options

#### Medium (Teen+)
- **Target**: Ages 13+
- **Content**: Social situations, lifestyle choices
- **Examples**: "Fame or fortune?", "Time travel or teleportation?"
- **Complexity**: Requires some life experience

#### Hard (Adult)
- **Target**: Ages 18+
- **Content**: Complex moral dilemmas, philosophical questions
- **Examples**: "Personal happiness or world peace?", "Know all truths or live in blissful ignorance?"
- **Complexity**: Deep thinking required

## Categories

### Funny (40+ cards)
- **Focus**: Humor, silly scenarios, ridiculous choices
- **Examples**: 
  - "Have fingers for toes or toes for fingers?"
  - "Always speak in rhymes or sing everything you say?"
  - "Sneeze glitter or cry rainbow tears?"

### Philosophical (30+ cards)
- **Focus**: Deep thoughts, moral dilemmas, existential questions
- **Examples**:
  - "Live forever with perfect health or live normally but cure one disease?"
  - "Know the date of your death or the cause of your death?"
  - "Be feared or be unknown?"

### Lifestyle (35+ cards)
- **Focus**: Daily life, career, relationships, habits
- **Examples**:
  - "Work your dream job for minimum wage or hate your job for millions?"
  - "Live in the city or the countryside?"
  - "Never use the internet again or never travel again?"

### Superpowers (25+ cards)
- **Focus**: Magical abilities, fantasy scenarios
- **Examples**:
  - "Read minds or predict the future?"
  - "Control time or control the weather?"
  - "Breathe underwater or fly through the air?"

### Food & Drink (20+ cards)
- **Focus**: Culinary preferences, eating scenarios
- **Examples**:
  - "Never eat pizza again or never eat chocolate again?"
  - "Always taste everything as sweet or always taste everything as salty?"
  - "Eat only cold food or only hot food?"

## User Interface Specifications

### Card Layout
- **Header**: "Would You Rather..." in large, bold text
- **Option A**: Left side with distinctive color (blue)
- **Option B**: Right side with distinctive color (red)
- **Divider**: "OR" in center with contrasting background
- **Context**: Small text below options (if applicable)

### Visual Design
- **Background**: Split gradient (blue to red)
- **Typography**: Large, readable fonts with high contrast
- **Layout**: 60/40 split for long/short options
- **Animations**: Subtle pulse on selection areas
- **Icons**: Optional illustrative icons for each option

### Interaction Methods
- **Tap Selection**: Tap left or right side to vote
- **Swipe Navigation**: Swipe up/down for next/previous
- **Long Press**: Hold for additional context
- **Voice**: Optional voice commands for accessibility

## Game Features

### Voting System
- **Individual**: Personal choice tracking
- **Group**: Collective results display
- **Anonymous**: Hide individual votes
- **Statistics**: Track choices over time

### Social Elements
- **Discussion Timer**: Optional 30-60 second debate time
- **Vote Reveal**: Dramatic reveal of group choices
- **Reasoning**: Players explain their choice
- **Favorites**: Save interesting questions

### Customization
- **Difficulty Filter**: Choose complexity level
- **Category Selection**: Pick preferred topics
- **Adult Content**: Toggle mature themes
- **Question Length**: Brief vs detailed options

## Content Guidelines

### Writing Standards
- **Clarity**: Both options should be equally clear
- **Balance**: Options should be reasonably balanced
- **Engagement**: Questions should spark discussion
- **Respect**: Avoid offensive or discriminatory content

### Age Appropriateness
- **Everyone**: Family-friendly, simple concepts
- **Teen**: School-appropriate, relatable scenarios
- **Adult**: Mature themes, complex moral questions
- **Content Warning**: Flag potentially sensitive topics

### Question Quality
- **Uniqueness**: Avoid similar questions
- **Relevance**: Current and relatable scenarios
- **Difficulty**: Genuinely challenging choices
- **Discussion Value**: Promotes group conversation

## Technical Implementation

### Data Structure
- **Local Storage**: Offline question bank
- **User Choices**: Track selections locally
- **Sync**: Optional cloud sync for cross-device
- **Updates**: Regular content additions

### Performance
- **Loading**: Preload next 5 questions
- **Memory**: Efficient text rendering
- **Responsive**: Adapt to screen sizes
- **Accessibility**: Screen reader support

### Analytics
- **Popular Questions**: Most engaging content
- **Choice Distribution**: A vs B selection rates
- **Category Preferences**: Most played categories
- **Skip Rates**: Questions that are skipped

## Expansion Possibilities

### Future Features
- **Custom Questions**: User-generated content
- **Themed Packs**: Holiday, movie, or brand-specific
- **Multiplayer**: Real-time voting with friends
- **Tournament Mode**: Bracket-style competitions
- **AI Questions**: Dynamically generated content