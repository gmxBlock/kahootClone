import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
  transports: ['websocket'],
  autoConnect: false,
});

export const connectSocket = () => {
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const onEvent = (event, callback) => {
  socket.on(event, callback);
};

export const emitEvent = (event, data) => {
  socket.emit(event, data);
};

export default socket;