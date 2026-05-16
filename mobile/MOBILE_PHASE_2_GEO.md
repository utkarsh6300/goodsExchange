# Phase 2: Geolocation & Discovery

## Goal
Implement native mapping and high-performance product browsing.

## Tasks
1. **Location Services:**
   - Implement `useLocation` hook with foreground permission handling.
   - Add "Current Location" resolution for the user.

2. **Map Integration:**
   - Refactor `MapScreen` using `react-native-maps`.
   - Implement clustering or dynamic fetching based on map region.
   - Add marker callouts to navigate to product details.

3. **Product Listing:**
   - Replace standard `FlatList` with `@shopify/flash-list`.
   - Implement `useProducts` hook with React Query for caching.
   - Add pull-to-refresh and empty states.

## Success Criteria
- User sees their location on the map.
- Products from the backend appear as markers.
- Scrolling through product lists is buttery smooth (60fps).
