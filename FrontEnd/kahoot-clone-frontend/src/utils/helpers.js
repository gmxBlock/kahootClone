export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const calculateScore = (correctAnswers, totalQuestions) => {
  return totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
};

export const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};