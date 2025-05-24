import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <h1>Welcome to Kahoot Clone!</h1>
        <p>Join quizzes, play games, and have fun with friends!</p>
      </main>
      <Footer />
    </div>
  );
};

export default Home;