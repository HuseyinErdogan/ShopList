# Dobydoby Authentication & Premium Features Architecture

## Overview
This document outlines a simple authentication and premium feature management system for Dobydoby Shopping List app using Firebase Authentication and Firestore.

## Technology Stack
- **Firebase Authentication**: For user management (free tier includes 50K monthly active users)
- **Firebase Firestore**: For storing user data and premium status (free tier includes 1GB storage)
- **Firebase Cloud Functions**: For handling subscription verification (free tier includes 125K invocations)
- **RevenueCat**: For handling in-app purchases and subscriptions (free tier available)

## Authentication Flow
1. User opens the app
2. User can use the app without signing in (basic features)
3. To access premium features, user needs to:
   - Sign in with Google or Email
   - Purchase premium subscription

## Data Structure

### Firestore Collections

```javascript
// users collection
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  isPremium: boolean,
  premiumExpiryDate: timestamp,
  createdAt: timestamp,
  lastLoginAt: timestamp
}

// subscriptions collection
{
  uid: string,
  subscriptionId: string,
  status: 'active' | 'expired' | 'cancelled',
  platform: 'ios' | 'android',
  purchaseDate: timestamp,
  expiryDate: timestamp
}
```

## Implementation Steps

### 1. Basic Setup
1. Create a Firebase project
2. Add Firebase to your React Native app
3. Enable Google Authentication
4. Set up Firestore database

### 2. Authentication Implementation
1. Create AuthContext and AuthProvider
2. Implement Google Sign-in
3. Add sign-out functionality
4. Handle authentication state changes

### 3. Premium Features Management
1. Set up RevenueCat for subscription handling
2. Create premium feature flags
3. Implement subscription purchase flow
4. Add premium status verification

## Code Structure

```
src/
├── auth/
│   ├── AuthContext.js
│   ├── AuthProvider.js
│   └── useAuth.js
├── premium/
│   ├── PremiumContext.js
│   ├── PremiumProvider.js
│   └── usePremium.js
└── services/
    ├── firebase.js
    └── revenuecat.js
```

## Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth.uid == resource.data.uid;
      allow write: if false;  // Only backend can write
    }
  }
}
```

## Premium Features Control
```javascript
const premiumFeatures = {
  darkMode: true,
  priceTracking: true,
  receiptScanner: true,
  smartCategories: true,
  analytics: true,
  cloudSync: true,
  collaboration: true,
  budget: true,
  suggestions: true
};

// Usage in components
const isPremiumFeatureEnabled = (featureName) => {
  return !premiumFeatures[featureName] || (user?.isPremium ?? false);
};
```

## Cost Considerations
- Firebase Authentication: Free tier includes 50K monthly active users
- Firestore: Free tier includes 1GB storage and 50K daily reads
- RevenueCat: Free tier available for basic needs
- Total: $0 for basic usage within free tiers

## Next Steps
1. Implement basic authentication
2. Add premium feature flags
3. Set up RevenueCat integration
4. Test purchase flow
5. Implement premium feature access control

## Notes
- This architecture prioritizes simplicity and cost-effectiveness
- Uses reliable and well-documented services
- Minimal server-side logic required
- Easy to scale if needed in future 