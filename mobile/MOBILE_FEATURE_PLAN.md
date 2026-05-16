# Mobile Feature Implementation Plan (React Native + Expo)

This document outlines the professional architectural plan for implementing the mobile counterpart to the Goods Exchange web application, utilizing modern Expo best practices.

---

## 🏗️ Architecture & Core Tech Stack

*   **Framework:** React Native with [Expo (Managed Workflow)](https://docs.expo.dev/).
*   **Navigation:** [Expo Router](https://docs.expo.dev/routing/introduction/) (File-based, Type-safe routing).
*   **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest) for server state and caching.
*   **API Communication:** `axios` with interceptors for JWT injection.
*   **Real-time:** `socket.io-client` for persistent chat connections.
*   **Persistence:** `expo-secure-store` (Tokens) and `AsyncStorage` (Preferences).
*   **Performance:** `@shopify/flash-list` for high-performance list rendering.

---

## 📍 1. Geolocation & Map Integration

Instead of the browser's Geolocation API, we leverage native hardware capabilities for a premium experience.

### Technical Implementation

1.  **Dependencies:**
    ```bash
    npx expo install expo-location react-native-maps expo-haptics
    ```

2.  **Location Services (`hooks/useLocation.ts`):**
    *   Create a custom hook to encapsulate `expo-location` logic.
    *   Implement foreground permission checks and graceful degradation if denied.
    *   Provide `reverseGeocodeAsync` to show human-readable addresses in the UI.

3.  **Product Discovery (`app/(tabs)/map.tsx`):**
    *   Use `MapView` from `react-native-maps` with `provider="google"` (recommended for cross-platform consistency).
    *   **UX Enhancement:** Use `expo-haptics` (ImpactFeedbackStyle.Light) when a user taps a map marker.
    *   Implement "Search in this area" logic that triggers a React Query refetch when the map region changes.

---

## 💬 2. Real-Time Chat System

Optimized for mobile-first constraints like keyboard avoiding and background connectivity.

### Technical Implementation

1.  **Dependencies:**
    ```bash
    npx expo install socket.io-client react-native-gifted-chat react-native-get-random-values
    ```

2.  **Optimized Rendering:**
    *   Use `FlashList` for the `ConversationsList` to ensure 60fps scrolling even with hundreds of chats.
    *   Implement **Optimistic Updates** in React Query: when a user sends a message, it appears instantly in the UI while the socket/API call happens in the background.

3.  **Chat UX:**
    *   **Keyboard Management:** Use `KeyboardAvoidingView` or `GiftedChat`'s built-in wrapper to ensure the input isn't covered.
    *   **Persistence:** Store active conversation IDs in `AsyncStorage` to restore state if the app is killed and restarted.

---

## 🚀 3. Performance & Polish (Mobile-Specific)

1.  **Image Optimization:**
    *   Replace standard `Image` with `expo-image` for high-performance caching, blur-up placeholders, and smooth transitions.
    
2.  **Haptic Feedback:**
    *   Trigger `Haptics.notificationAsync` on successful product creation or message delivery.
    *   Use `Haptics.selectionAsync` when scrolling through category filters.

3.  **Offline Support:**
    *   Configure React Query with `persistQueryClient` to allow users to browse previously loaded products while offline.

---

## 🛠️ Phase 4: Project Initialization

To set up the enhanced mobile structure:

```bash
# Initialize Expo with TypeScript and Router
npx create-expo-app@latest mobile --template tabs-navigation-typescript
cd mobile

# Install Enhanced Dependencies
npx expo install @tanstack/react-query @shopify/flash-list expo-secure-store expo-location react-native-maps socket.io-client react-native-gifted-chat expo-image expo-haptics
```

### Recommended Directory Structure
```
mobile/
├── app/                  # Expo Router (Screens)
│   ├── (auth)/          # Login/Signup
│   ├── (tabs)/           # Home, Map, Chat, Profile
│   └── product/[id].tsx  # Dynamic Product Details
├── src/
│   ├── components/       # UI & Feature components
│   ├── hooks/            # useAuth, useLocation, useProducts
│   ├── services/         # api.ts, socketService.ts
│   └── store/            # Local state (Zustand or Context)
└── app.json              # Expo Config
```
