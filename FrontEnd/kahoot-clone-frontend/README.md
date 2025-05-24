# Kahoot Clone Frontend

This project is a frontend application for the Kahoot Clone, designed to work seamlessly with the backend server. It is built using React and provides a user-friendly interface for authentication, quiz management, and gameplay.

## Features

- **User Authentication**: Users can register and log in to their accounts.
- **Quiz Management**: Users can create, edit, and view quizzes.
- **Real-time Gameplay**: Players can join games and compete in real-time using Socket.io.
- **Responsive Design**: The application is designed to be responsive and user-friendly across devices.

## Project Structure

```
kahoot-clone-frontend
├── public
│   ├── index.html          # Main HTML file
│   └── manifest.json       # PWA metadata
├── src
│   ├── components          # Reusable components
│   ├── pages               # Application pages
│   ├── services            # API and socket services
│   ├── hooks               # Custom hooks
│   ├── context             # Context providers
│   ├── utils               # Utility functions
│   ├── styles              # CSS styles
│   ├── App.js              # Main application component
│   ├── App.css             # Styles for the App component
│   └── index.js            # Entry point for the React application
├── package.json            # npm configuration
└── README.md               # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd kahoot-clone-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

- Navigate to `http://localhost:3000` to access the application.
- Use the provided authentication forms to log in or register.
- Explore the quiz management features and join games.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.