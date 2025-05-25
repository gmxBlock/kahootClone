import { io } from 'socket.io-client';

// Use relative path since we have setupProxy.js configured for socket.io
const socket = io('/', {
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