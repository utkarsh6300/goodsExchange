# Phase 3: Real-Time Chat

## Goal
Build a robust, responsive chat experience with optimistic UI updates.

## Tasks
1. **Socket.io Service:**
   - Create a singleton `socketService.ts`.
   - Implement auto-reconnect and room joining logic.

2. **Chat UI:**
   - Implement `ConversationList` using `FlashList`.
   - Integrate `react-native-gifted-chat` in `ChatScreen`.
   - Handle keyboard avoiding behavior.

3. **Optimistic UI:**
   - Use TanStack Query's `onMutate` to show sent messages immediately.
   - Sync message history with the backend API.

## Success Criteria
- Real-time message exchange between mobile and web.
- Messages appear instantly in the UI.
- Keyboard doesn't cover the input field.
