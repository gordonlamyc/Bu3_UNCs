# Voting System

This project consists of a Node.js/Express backend and an Angular frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1.  **Install Backend Dependencies:**
    Open a terminal in the root directory and run:
    ```bash
    npm install
    ```

2.  **Install Frontend Dependencies:**
    Navigate to the frontend directory and install dependencies:
    ```bash
    cd frontend
    npm install
    ```

## Running the Application

To start the application, run the following command from the **root** directory:

```bash
npm start
```

This command starts the Node.js server (`server.js`). The server is configured to:
1.  Check if the Angular frontend is built.
2.  If not built, it will attempt to run `npm run build` in the `frontend` directory automatically.
3.  Serve the built frontend files and the API.

Access the application at: [http://localhost:3000](http://localhost:3000)

## Project Structure

-   **`server.js`**: The main entry point for the backend. Handles API requests and serves the frontend.
-   **`frontend/`**: Contains the Angular application source code.
