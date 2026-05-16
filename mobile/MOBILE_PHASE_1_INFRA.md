# Phase 1: Infrastructure & Authentication

## Goal
Establish a modern, type-safe foundation using Expo Router and React Query.

## Tasks
1. **Migration to Expo Router:**
   - Install `expo-router` and its peer dependencies.
   - Refactor file structure to use the `app/` directory (file-based routing).
   - Convert existing screens to the new routing pattern.

2. **TypeScript Integration:**
   - Add `tsconfig.json` and install `@types/react-native`.
   - Rename key files to `.tsx`.

3. **Global Providers Setup:**
   - Setup `QueryClientProvider` (TanStack Query).
   - Setup `AuthProvider` using `expo-secure-store` for token persistence.

4. **API Layer:**
   - Configure `axios` instance with base URL and interceptors for the backend.

## Success Criteria
- App boots with Expo Router.
- User can log in and token is stored securely.
- Basic navigation (Tabs) is functional.
