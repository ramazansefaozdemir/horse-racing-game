# Horse Racing Game

An interactive web application developed using Vue 3, TypeScript, and Vuex. The goal is to provide users with a virtual horse racing experience, allowing them to follow races and see results based on randomly generated horses and a 6-round race program.


## Key Features

*   Generates a unique set of 20 horses with varying conditions.
*   Creates a 6-round race program with different distances.
*   Simulates races round by round.
*   Displays live race progress (basic representation).
*   Shows detailed results for each completed round.
*   Allows users to generate a new program and reset existing results.

## Technologies Used

*   **Vite ([https://vitejs.dev/](https://vitejs.dev/)):** A modern frontend build tool chosen for its speed and efficient development experience.
*   **Vue 3:** A progressive JavaScript framework used for building the user interface.
*   **TypeScript:** Adds static typing to JavaScript, improving code quality and maintainability.

### Libraries

*   **Vuex 4:** For state management, handling the application's data flow centrally.
*   **Element Plus ([https://element-plus.org/](https://element-plus.org/)):** A comprehensive UI component library for Vue 3, selected for its rich set of components and Vue 3 compatibility.
*   **Vue Test Utils & Vitest:** Used for unit testing the Vuex store and potentially components.

## Node.js Version

*   Recommended: **v18+** or **v20+** (Project developed using v20.0.0)
*   You can use `nvm` (Node Version Manager) to switch Node.js versions (e.g., `nvm use 20`).

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ramazansefaozdemir/horse-racing-game.git
    cd horse-racing-game
    ```
2.  **Install dependencies:**
    Ensure you are using a compatible Node.js version (18+).
    ```bash
    npm install
    ```

## Running the Project

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
2.  **Access the application:**
    Open your browser and navigate to `http://localhost:5173`.
    If port 5173 is busy, Vite might automatically choose a different port. Check your terminal output for the correct URL.
