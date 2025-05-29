import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ConnectionDebug = () => {
  const [logs, setLogs] = useState([]);
  const [testSocket, setTestSocket] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const testDirectConnection = () => {
    addLog('Starting direct Socket.IO connection test...', 'info');
    
    const socketUrl = 'http://165.22.18.156:3000';
    addLog(`Connecting to: ${socketUrl}`, 'info');

    // Create a test socket with minimal configuration
    const socket = io(socketUrl, {
      transports: ['polling'], // Start with polling only
      autoConnect: false,
      timeout: 10000,
      forceNew: true
    });

    setTestSocket(socket);

    socket.on('connect', () => {
      setConnectionState('connected');
      addLog(`✅ Connected! Socket ID: ${socket.id}`, 'success');
      addLog(`Transport: ${socket.io.engine.transport.name}`, 'info');
    });

    socket.on('disconnect', (reason) => {
      setConnectionState('disconnected');
      addLog(`❌ Disconnected: ${reason}`, 'error');
    });

    socket.on('connect_error', (error) => {
      setConnectionState('error');
      addLog(`🚨 Connection Error: ${error.message}`, 'error');
      addLog(`Error details: ${JSON.stringify(error)}`, 'error');
    });

    // Attempt connection
    addLog('Initiating connection...', 'info');
    setConnectionState('connecting');
    socket.connect();
  };

  const testWithWebSocket = () => {
    addLog('Testing with WebSocket transport...', 'info');
    
    if (testSocket) {
      testSocket.disconnect();
    }

    const socketUrl = 'http://165.22.18.156:3000';
    const socket = io(socketUrl, {
      transports: ['websocket'], // WebSocket only
      autoConnect: false,
      timeout: 10000,
      forceNew: true
    });

    setTestSocket(socket);

    socket.on('connect', () => {
      setConnectionState('connected');
      addLog(`✅ WebSocket Connected! Socket ID: ${socket.id}`, 'success');
    });

    socket.on('connect_error', (error) => {
      setConnectionState('error');
      addLog(`🚨 WebSocket Error: ${error.message}`, 'error');
    });

    setConnectionState('connecting');
    socket.connect();
  };

  const testHttpEndpoint = async () => {
    addLog('Testing HTTP endpoint accessibility...', 'info');
    
    try {
      const response = await fetch('http://165.22.18.156:3000/api/health', {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        addLog('✅ HTTP endpoint is accessible', 'success');
        const data = await response.text();
        addLog(`Response: ${data}`, 'info');
      } else {
        addLog(`❌ HTTP endpoint returned: ${response.status}`, 'error');
      }
    } catch (error) {
      addLog(`❌ HTTP test failed: ${error.message}`, 'error');
    }
  };

  const testSocketIOEndpoint = async () => {
    addLog('Testing Socket.IO endpoint...', 'info');
    
    try {
      const response = await fetch('http://165.22.18.156:3000/socket.io/?EIO=4&transport=polling', {
        method: 'GET',
        mode: 'cors'
      });
      
      if (response.ok) {
        addLog('✅ Socket.IO polling endpoint is accessible', 'success');
        const data = await response.text();
        addLog(`Socket.IO response: ${data.substring(0, 100)}...`, 'info');
      } else {
        addLog(`❌ Socket.IO endpoint returned: ${response.status}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Socket.IO endpoint test failed: ${error.message}`, 'error');
    }
  };

  const disconnect = () => {
    if (testSocket) {
      testSocket.disconnect();
      setTestSocket(null);
      setConnectionState('disconnected');
      addLog('Disconnected manually', 'info');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    return () => {
      if (testSocket) {
        testSocket.disconnect();
      }
    };
  }, [testSocket]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Socket.IO Connection Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Connection State: </strong>
        <span style={{ 
          color: connectionState === 'connected' ? 'green' : 
                 connectionState === 'error' ? 'red' : 
                 connectionState === 'connecting' ? 'orange' : 'gray'
        }}>
          {connectionState.toUpperCase()}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={testHttpEndpoint} style={{ marginRight: '10px' }}>
          Test HTTP Endpoint
        </button>
        <button onClick={testSocketIOEndpoint} style={{ marginRight: '10px' }}>
          Test Socket.IO Endpoint
        </button>
        <button onClick={testDirectConnection} style={{ marginRight: '10px' }}>
          Test Polling Connection
        </button>
        <button onClick={testWithWebSocket} style={{ marginRight: '10px' }}>
          Test WebSocket Connection
        </button>
        <button onClick={disconnect} style={{ marginRight: '10px' }}>
          Disconnect
        </button>
        <button onClick={clearLogs}>
          Clear Logs
        </button>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        height: '400px', 
        overflowY: 'scroll',
        backgroundColor: '#f5f5f5'
      }}>
        {logs.map((log, index) => (
          <div key={index} style={{ 
            color: log.type === 'error' ? 'red' : 
                   log.type === 'success' ? 'green' : 
                   'black',
            marginBottom: '5px'
          }}>
            <span style={{ color: 'gray' }}>[{log.timestamp}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionDebug;
