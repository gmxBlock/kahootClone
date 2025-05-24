import { useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { SocketContext } from '../context/SocketContext';

const useSocket = () => {
  const { socket, setSocket } = useContext(SocketContext);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [setSocket]);

  return socket;
};

export default useSocket;