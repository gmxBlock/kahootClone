import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import GameRoom from './pages/GameRoom';
import Profile from './pages/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuizList from './components/quiz/QuizList';
import QuizCreator from './components/quiz/QuizCreator';
import GameLobby from './components/game/GameLobby';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/game-room" element={<GameRoom />} />
          <Route path="/game/:gamePin" element={<GameRoom />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/quiz-creator" element={<QuizCreator />} />
          <Route path="/game-lobby" element={<GameLobby />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;