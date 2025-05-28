import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GameProvider from './context/GameContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GameRoom from './pages/GameRoom';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import QuizList from './components/quiz/QuizList';
import QuizCreator from './components/quiz/QuizCreator';
import MyQuizzes from './pages/MyQuizzes';
import GameLobby from './components/game/GameLobby';
import LoadingSpinnerDemo from './components/test/LoadingSpinnerDemo';
import { testServerConnection } from './utils/connectionTest';
import { connectSocket } from './services/socket';
import './App.css';

// Test server connection on app start (development only)
if (process.env.NODE_ENV === 'development') {
  testServerConnection().catch(console.error);
  // Initialize socket connection for testing
  setTimeout(() => {
    console.log('🔌 Initializing socket connection...');
    connectSocket();
  }, 1000);
}

const App = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <Header />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/game-room" element={<GameRoom />} />
          <Route path="/game/:gamePin" element={<GameRoom />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/quizzes" element={
            <ProtectedRoute>
              <QuizList />
            </ProtectedRoute>
          } />
          <Route path="/quiz-creator" element={
            <ProtectedRoute>
              <QuizCreator />
            </ProtectedRoute>
          } />
          <Route path="/quiz-creator/:id" element={
            <ProtectedRoute>
              <QuizCreator />
            </ProtectedRoute>
          } />
          <Route path="/my-quizzes" element={
            <ProtectedRoute>
              <MyQuizzes />
            </ProtectedRoute>
          } />
          <Route path="/game-lobby" element={<GameLobby />} />
          <Route path="/spinner-demo" element={<LoadingSpinnerDemo />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Routes>
        <Footer />
      </Router>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;