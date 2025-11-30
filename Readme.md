# GoodsExchange - C2C Raw Material Marketplace

GoodsExchange is a C2C (Customer to Customer) marketplace designed specifically for facilitating the exchange of raw materials within a village community. This platform aims to connect individuals or businesses within a local area, enabling them to trade raw materials efficiently and sustainably.

## Features

### Geolocation Support

The application leverages the browser's Geolocation API to enhance the user experience by:

-   **Local Product Discovery:** Allowing users to find products available in their vicinity.
-   **Easy Product Listing:** Automatically capturing coordinates when listing a product, simplifying the process for sellers.
-   **Promoting Local Trade:** Encouraging trade within the community by making it easier to connect with nearby buyers and sellers.

## Getting Started

To contribute to GoodsExchange, follow the steps below:

### Prerequisites

Ensure you have the following software installed:

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/utkarsh6300/goodsExchange.git
    ```

2. Navigate into the project directory:

    ```bash
    cd goodsExchange
    ```

3. Install backend dependencies:

    ```bash
    cd backend
    yarn install
    ```

4. Install frontend dependencies:

    ```bash
    cd ../frontend
    yarn install
    ```

### Configuration

1. Backend:

    - Create a `.env` file in the `backend` directory.
    - Set up environment variables such as `PORT`, `MONGODB_URI`, etc., in the `.env` file.

2. Frontend:

    - Configure the frontend to communicate with the backend by setting appropriate API URLs.

### Development

1. Start the backend server:

    ```bash
    cd backend
    yarn start
    ```

    This will start the backend server at `http://localhost:5000`.

2. Start the frontend development server:

    ```bash
    cd ../frontend
    yarn start
    ```

    This will start the frontend development server at `http://localhost:3000` and open the application in your default web browser.

### Contributing

Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/new-feature`.
3. Make your changes and commit them: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature/new-feature`.
5. Submit a pull request.

Ensure your pull request adheres to the repository's guidelines and conventions.

### License

GoodsExchange is licensed under the [MIT License](LICENSE).

### Acknowledgements

GoodsExchange acknowledges the following technologies:

- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

---

Feel free to reach out with any questions or concerns. Let's build a vibrant marketplace for our village community! 🛒🌾