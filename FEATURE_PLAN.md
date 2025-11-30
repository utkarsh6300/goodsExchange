# Feature Implementation Plan

This document outlines the plan for implementing two new major features: Location Support and Real-Time Chat.

---

## 1. Geolocation Support

This feature will use the browser's Geolocation API to allow users to associate products with specific coordinates (latitude, longitude) and filter products based on proximity.

### Backend Changes

1.  **Update `Product` Model:**
    *   **File:** `backend/models/Product.js`
    *   **Action:** Modify the `location` field to store GeoJSON data for geospatial queries. This will allow us to find products within a certain radius.
    *   **Example Schema:**
        ```javascript
        location: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
          }
        },
        address: String // For storing a user-friendly address string
        ```

2.  **Update Product API Routes:**
    *   **File:** `backend/routes/api/product.js`
    *   **Actions:**
        *   **Create Product (POST `/`):** Modify the route to accept `coordinates` (lat, lon) and a user-friendly `address` string from the request body.
        *   **Update Product (PUT `/:id`):** Allow the `location` and `address` fields to be updated.
        *   **Get All Products (GET `/`):** Modify the route to accept `lat`, `lon`, and `radius` as query parameters (e.g., `?lat=12.97&lon=77.59&radius=5`). Implement logic to find and return products within the specified radius using a geospatial query.

### Frontend Changes

1.  **Update `ProductForm` Component:**
    *   **File:** `frontend/src/components/ProductForm.jsx`
    *   **Action:**
        *   Replace the text input for location with a "Get My Location" button.
        *   On button click, use the browser's `navigator.geolocation.getCurrentPosition()` to get the user's latitude and longitude.
        *   Implement error handling to gracefully manage scenarios where the user denies permission for geolocation.
        *   Include a text input for a user-friendly `address` (e.g., street, village name) which can be manually entered.
        *   The fetched coordinates and the manual address will be sent to the backend.

2.  **Update Product Filtering:**
    *   **File:** `frontend/src/components/ProductFilterSidebar.jsx` (or `frontend/src/pages/Products.jsx`)
    *   **Action:** 
        *   Add a "Find Nearby Products" button or toggle. When activated, it will get the user's current location and query the backend for products within a selected radius.
        *   Include a slider or dropdown to allow users to select a search radius (e.g., 5km, 10km, 25km).

3.  **Update `productService`:**
    *   **File:** `frontend/src/services/productService.js`
    *   **Action:** Modify the `getAllProducts` function to accept `lat`, `lon`, and `radius` parameters and include them in the API request.

4.  **Display Location on Product Cards:**
    *   **File:** `frontend/src/components/ProductCard.jsx`
    *   **Action:** Display the user-friendly `address` on the product card. Optionally, add a "View on Map" link.

---

## 2. Real-Time Chat (using Socket.IO)

This feature will enable real-time messaging between users, likely for inquiring about products.

### Backend Changes

1.  **Install Dependencies:**
    *   **File:** `backend/package.json`
    *   **Action:** Add `socket.io` to the dependencies.
        ```bash
        npm install socket.io
        ```

2.  **Server Integration:**
    *   **File:** `backend/index.js`
    *   **Action:**
        *   Import `socket.io` and wrap the existing Express HTTP server.
        *   Initialize the main `io.on('connection', ...)` listener to handle new socket connections.
        *   Implement user authentication for sockets (e.g., pass JWT from client on connection).

3.  **Create New Database Models:**
    *   **Directory:** `backend/models/`
    *   **Actions:**
        *   Create `Conversation.js`: Schema should include `participants` (an array of User IDs).
        *   Create `Message.js`: Schema should include `conversationId`, `sender` (User ID), `receiver` (User ID), and `text`.

4.  **Implement Socket Logic:**
    *   **File:** `backend/index.js` or a new dedicated module (e.g., `backend/socket/chatHandler.js`)
    *   **Actions:**
        *   Create event listeners for `'joinRoom'` to have users join a room based on `conversationId`.
        *   Create an event listener for `'sendMessage'`. When a message is received:
            1.  Save the message to the `Message` collection in the database.
            2.  Emit the message (`'newMessage'`) to all users in the specific room.

5.  **Create Chat API Routes:**
    *   **File:** `backend/routes/api/chat.js` (new file)
    *   **Actions:**
        *   **GET `/conversations`:** An endpoint to retrieve all conversations for the currently authenticated user.
        *   **GET `/conversations/:conversationId/messages`:** An endpoint to fetch the message history for a specific conversation.
        *   **POST `/conversations`:** An endpoint to create a new conversation between two users (if one doesn't already exist).

### Frontend Changes

1.  **Install Dependencies:**
    *   **File:** `frontend/package.json`
    *   **Action:** Add `socket.io-client` to the dependencies.
        ```bash
        npm install socket.io-client
        ```

2.  **Create Socket Service:**
    *   **File:** `frontend/src/services/socketService.js` (new file)
    *   **Action:** Create a service to manage the socket connection singleton. It should have methods like `connect()`, `disconnect()`, `sendMessage()`, and `onNewMessage()`.

3.  **Create Chat UI Components:**
    *   **Directory:** `frontend/src/components/`
    *   **Actions:**
        *   **`ConversationList.jsx`:** A component to display a list of the user's active conversations.
        *   **`ChatWindow.jsx`:** The main chat interface, which displays messages and includes a text input for sending new messages.

4.  **Create Chat Page:**
    *   **File:** `frontend/src/pages/Chat.jsx` (new file)
    *   **Action:** A new page that combines the `ConversationList` and `ChatWindow` components. This page will be the main messaging hub for the user.

5.  **Integrate Chat Entry Point:**
    *   **File:** `frontend/src/pages/ProductDetails.jsx`
    *   **Action:** Add a "Contact Seller" button. On click, this button should either start a new conversation with the product owner or navigate to an existing conversation.

6.  **Update Services:**
    *   **File:** `frontend/src/services/`
    *   **Action:** Create a `chatService.js` to handle API calls for fetching conversations and message history.
