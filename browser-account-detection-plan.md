# Browser Account Detection Implementation Plan

## Overview

This document outlines the implementation plan for adding Google/Microsoft account detection to the Training Hub application. The goal is to require users to be signed into either a Google or Microsoft account in their browser before accessing the public Learn and Quiz sections.

**Key Requirement**: This is browser-level account detection, NOT OAuth authentication. Users don't sign into the Training Hub application - we simply detect if they're already signed into Google/Microsoft in their browser.

## Current State

- **Admin Authentication**: Email/password via Supabase for `/admin` routes
- **Public Access**: Unrestricted access to Learn (`/study`) and Quiz (`/quiz`, `/practice-quiz`) routes
- **Framework**: React with React Router
- **Authentication**: Supabase for admin, none for public

## Implementation Plan

### Phase 1: External API Integration

#### 1.1 Google APIs Integration
- Add Google APIs JavaScript library to `index.html`
- Configure Google API key for sign-in status detection
- Set up `gapi.auth2` for checking authentication state
- Required API: `gapi.auth2.getAuthInstance().isSignedIn.get()`

#### 1.2 Microsoft Graph/MSAL Integration
- Add Microsoft Authentication Library (MSAL) JavaScript SDK
- Configure Microsoft app registration for browser detection
- Set up MSAL instance for account detection
- Required API: MSAL account detection methods

#### 1.3 Script Loading
```html
<!-- Google APIs -->
<script src="https://apis.google.com/js/api.js"></script>
<script src="https://accounts.google.com/gsi/client"></script>

<!-- Microsoft MSAL -->
<script src="https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js"></script>
```

### Phase 2: Account Detection Service

#### 2.1 Create Detection Service
**File**: `src/services/accountDetectionService.js`

```javascript
// Service to detect Google and Microsoft account sign-in status
class AccountDetectionService {
  // Initialize Google API
  initializeGoogle()
  
  // Initialize Microsoft MSAL
  initializeMicrosoft()
  
  // Check if user is signed into Google
  isGoogleSignedIn()
  
  // Check if user is signed into Microsoft
  isMicrosoftSignedIn()
  
  // Check if user is signed into either account
  isAnyAccountSignedIn()
  
  // Periodic status checking
  startStatusPolling()
  stopStatusPolling()
}
```

#### 2.2 Error Handling
- Handle API initialization failures
- Manage third-party cookie restrictions
- Fallback for privacy-blocked requests
- Network timeout handling

#### 2.3 Configuration
- Environment variables for API keys
- Development mode bypass options
- Polling interval settings

### Phase 3: Verification Components

#### 3.1 Account Verification Gate
**File**: `src/components/auth/AccountVerificationGate.jsx`

```jsx
// Component that blocks access until account is detected
const AccountVerificationGate = ({ children }) => {
  const [accountStatus, setAccountStatus] = useState('checking')
  // 'checking' | 'signed-in' | 'not-signed-in' | 'error'
  
  // Display appropriate UI based on status
  // Allow children to render only when signed-in
}
```

#### 3.2 Account Status Display
**File**: `src/components/auth/AccountStatusDisplay.jsx`

```jsx
// Shows current detection status and instructions
const AccountStatusDisplay = ({ status, onRetry }) => {
  // Display status messages
  // Show sign-in instructions
  // Provide retry functionality
}
```

#### 3.3 Context Provider
**File**: `src/contexts/PublicAuthContext.jsx`

```jsx
// Context for managing public account detection state
const PublicAuthProvider = ({ children }) => {
  // Account detection state
  // Status polling management
  // API initialization
}
```

### Phase 4: Route Protection Updates

#### 4.1 Update App.jsx Routing
Modify routing structure to protect public routes:

```jsx
// Wrap Learn and Quiz routes with verification
<Route path="/study/*" element={
  <AccountVerificationGate>
    <StudyGuidePage />
  </AccountVerificationGate>
} />

<Route path="/quiz/*" element={
  <AccountVerificationGate>
    <QuizPage />
  </AccountVerificationGate>
} />
```

#### 4.2 Protected Route Component
**File**: `src/components/auth/PublicProtectedRoute.jsx`

```jsx
// Route protection specifically for public sections
const PublicProtectedRoute = ({ children }) => {
  // Use account detection context
  // Show loading during detection
  // Render verification gate or children
}
```

#### 4.3 Navigation Updates
Update navigation components to show account status:
- Header indication of account detection status
- User-friendly messaging about requirements

### Phase 5: User Experience & Polish

#### 5.1 User Interface Elements
- **Loading States**: Show spinner during account detection
- **Error States**: Clear messaging when detection fails
- **Instructions**: Help users understand what accounts to sign into
- **Manual Refresh**: Button to re-check account status

#### 5.2 Status Messages
- "Checking account status..."
- "Please sign into your Google or Microsoft account"
- "Account detected - Access granted"
- "Unable to detect account - Check privacy settings"

#### 5.3 Fallback Strategies
- Manual retry mechanisms
- Browser compatibility warnings
- Alternative access methods (if needed)

#### 5.4 Development Tools
- Bypass mechanism for development
- Debug logging for detection status
- Test mode with simulated account states

### Phase 6: Testing & Validation

#### 6.1 Browser Testing Matrix
- **Chrome**: Standard testing baseline
- **Firefox**: Privacy settings impact
- **Safari**: Third-party cookie restrictions
- **Edge**: Microsoft account integration
- **Mobile browsers**: iOS Safari, Android Chrome

#### 6.2 Account State Testing
- Not signed into any accounts
- Signed into Google only
- Signed into Microsoft only
- Signed into both accounts
- Signed out during session

#### 6.3 Privacy Settings Testing
- Third-party cookies disabled
- Strict privacy settings
- Corporate network restrictions
- Ad blockers enabled

#### 6.4 Error Scenario Testing
- API initialization failures
- Network timeouts
- Invalid API keys
- Rate limiting

## Technical Specifications

### Required Dependencies
```json
{
  "dependencies": {
    "@azure/msal-browser": "^2.38.1",
    "google-auth-library": "^8.9.0"
  }
}
```

### Environment Variables
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
REACT_APP_ACCOUNT_DETECTION_ENABLED=true
REACT_APP_ACCOUNT_DETECTION_BYPASS=false
```

### File Structure
```
src/
├── services/
│   └── accountDetectionService.js
├── contexts/
│   └── PublicAuthContext.jsx
├── components/
│   └── auth/
│       ├── AccountVerificationGate.jsx
│       ├── AccountStatusDisplay.jsx
│       └── PublicProtectedRoute.jsx
└── hooks/
    └── useAccountDetection.js
```

## Limitations & Considerations

### Browser Privacy Restrictions
- **Safari**: Intelligent Tracking Prevention may block detection
- **Firefox**: Enhanced Tracking Protection affects third-party APIs
- **Chrome**: Future third-party cookie deprecation may impact functionality

### Corporate Environments
- Firewalls may block Google/Microsoft API access
- Corporate proxy settings may interfere
- SSO configurations might affect detection

### User Privacy
- Some users disable third-party cookies entirely
- Privacy-conscious users may block external API calls
- GDPR considerations for EU users

### Reliability Concerns
- Not 100% reliable due to privacy restrictions
- May require manual refresh in some scenarios
- Fallback strategies needed for blocked detection

## Success Criteria

1. **Functional**: Successfully detect Google/Microsoft account sign-in status
2. **Compatible**: Works across major browsers (with known limitations)
3. **User-Friendly**: Clear messaging and easy retry mechanisms
4. **Maintainable**: Well-structured code with proper error handling
5. **Secure**: No storage of user account data, detection only

## Alternative Approaches (If Needed)

If browser detection proves too unreliable:

1. **OAuth Authentication**: Full OAuth flow (more complex, requires user action)
2. **Honor System**: Simple checkbox "I am signed into Google/Microsoft"
3. **Hybrid Approach**: Detection + manual confirmation fallback
4. **Institution-Based**: Access control through institutional accounts

## Implementation Timeline

- **Phase 1-2**: 2-3 days (API integration and service creation)
- **Phase 3-4**: 2-3 days (Components and routing)
- **Phase 5**: 1-2 days (UX polish and fallbacks)
- **Phase 6**: 2-3 days (Testing across browsers and scenarios)

**Total Estimated Time**: 7-11 days

## Next Steps

1. Obtain Google API credentials
2. Set up Microsoft app registration
3. Begin Phase 1 implementation
4. Set up testing environment with multiple browsers
5. Create development bypass mechanism for testing