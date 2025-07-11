# Social Login & Authentication Specification

## Authentication Strategy

### Login Options
1. **Google Sign-In** (Primary)
   - OAuth 2.0 flow via Firebase Auth
   - Scopes: email, profile, openid
   - Auto-populate: name, email, profile picture

2. **Facebook Login**
   - Facebook SDK integration
   - Permissions: email, public_profile
   - Handle edge cases: email not provided

3. **Apple Sign-In** (iOS Required)
   - Sign in with Apple ID
   - Privacy-focused option
   - Handle anonymous email relay

4. **Guest Mode**
   - No registration required
   - Generate temporary user ID
   - Limited features (no cloud sync, sharing)
   - Prompt for account creation after engagement

### User Profile Structure
```json
{
  "uid": "firebase_user_id",
  "email": "user@example.com",
  "displayName": "User Name",
  "photoURL": "https://profile-pic-url",
  "provider": "google|facebook|apple",
  "isGuest": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-01T00:00:00Z",
  "gameStats": {
    "totalGamesPlayed": 0,
    "totalCardsViewed": 0,
    "favoriteGames": [],
    "achievements": []
  },
  "preferences": {
    "theme": "dark|light|auto",
    "soundEnabled": true,
    "defaultTimer": 60,
    "preferredDifficulty": "medium"
  }
}
```

## Authentication Flow

### Initial App Launch
1. Check for existing auth token
2. If authenticated → Navigate to Home
3. If not authenticated → Show Welcome Screen
4. Welcome Screen options:
   - Social login buttons
   - "Continue as Guest" option
   - Terms of Service acceptance

### Social Login Process
1. User selects social provider
2. Redirect to provider's OAuth flow
3. Handle authorization response
4. Create/update user profile in Firebase
5. Store auth token securely
6. Navigate to Home screen

### Guest Mode Flow
1. Generate temporary UUID
2. Create minimal user profile
3. Store locally (AsyncStorage)
4. Show "Sign up to save progress" banner
5. Periodic prompts to create account

## Security Considerations

### Data Protection
- Store auth tokens in secure storage (Keychain/Keystore)
- Encrypt sensitive user data
- Implement proper session management
- Auto-logout after extended inactivity

### Privacy Compliance
- GDPR compliance for EU users
- Clear privacy policy
- Data deletion on account termination
- Minimal data collection principle

### Error Handling
- Network connectivity issues
- Provider service outages
- Invalid credentials
- Permission denials
- Account linking conflicts

## Implementation Requirements

### Dependencies
```json
{
  "firebase": "^9.0.0",
  "expo-auth-session": "^4.0.0",
  "@react-native-google-signin/google-signin": "^10.0.0",
  "react-native-fbsdk-next": "^12.0.0",
  "expo-apple-authentication": "^6.0.0",
  "@react-native-async-storage/async-storage": "^1.19.0"
}
```

### Configuration Files
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)
- Firebase project configuration
- Facebook App ID configuration
- Apple Developer Team ID

### Testing Strategy
- Unit tests for authentication logic
- Integration tests for each provider
- E2E tests for complete flows
- Manual testing on physical devices
- Edge case testing (network failures, etc.)

## User Experience Guidelines

### Login Screen Design
- Clear provider branding
- Loading states for each option
- Error message display
- Accessibility considerations
- Skip option visibility

### Onboarding Flow
1. Welcome message
2. App features overview
3. Login benefits explanation
4. Privacy assurance
5. Quick start guide

### Account Management
- Profile editing capability
- Account deletion option
- Data export functionality
- Login provider management
- Account linking features