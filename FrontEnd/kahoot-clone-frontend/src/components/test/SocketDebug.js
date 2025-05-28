import React, { useState, useEffect } from 'react';
import { connectSocket, disconnectSocket, emitEvent, onEvent, offEvent } from '../../services/socket';
import { SOCKET_URL } from '../../utils/constants';

const SocketDebug = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState('');
  const [logs, setLogs] = useState([]);
  const [testMessage, setTestMessage] = useState('Hello from React!');

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now(),
      timestamp,
      message,
      type
    };
    setLogs(prev => [...prev, logEntry]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog(`Socket URL: ${SOCKET_URL}`);
    addLog('Setting up socket event listeners...');

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      const id = Math.random().toString(36).substr(2, 9); // Fallback ID
      setSocketId(id);
      addLog(`✅ Socket connected! ID: ${id}`, 'success');
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      setSocketId('');
      addLog(`❌ Socket disconnected: ${reason}`, 'error');
    };

    const handleConnectError = (error) => {
      addLog(`🚨 Connection error: ${error.message}`, 'error');
    };

    // Add event listeners
    onEvent('connect', handleConnect);
    onEvent('disconnect', handleDisconnect);
    onEvent('connect_error', handleConnectError);

    // Try to connect
    addLog('Attempting to connect socket...');
    connectSocket();

    // Cleanup
    return () => {
      offEvent('connect', handleConnect);
      offEvent('disconnect', handleDisconnect);
      offEvent('connect_error', handleConnectError);
    };
  }, []);

  const handleConnect = () => {
    addLog('Manual connect attempt...');
    connectSocket();
  };

  const handleDisconnect = () => {
    addLog('Manual disconnect...');
    disconnectSocket();
  };

  const handleTestEmit = () => {
    addLog(`Attempting to emit test event: ${testMessage}`);
    const success = emitEvent('test-event', { message: testMessage, timestamp: new Date().toISOString() });
    if (success) {
      addLog('✅ Test event emitted successfully', 'success');
    } else {
      addLog('❌ Failed to emit test event', 'error');
    }
  };

  const handleTestJoinHost = () => {
    addLog('Testing join-as-host event...');
    const success = emitEvent('join-as-host', { 
      gamePin: 'TEST123', 
      userId: 'debug-user-id',
      timestamp: new Date().toISOString()
    });
    if (success) {
      addLog('✅ join-as-host event emitted successfully', 'success');
    } else {
      addLog('❌ Failed to emit join-as-host event', 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'monospace'
    },
    status: {
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
      color: isConnected ? '#155724' : '#721c24',
      border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`
    },
    controls: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    input: {
      padding: '0.5rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      minWidth: '200px'
    },
    logs: {
      backgroundColor: '#1a1a1a',
      color: '#f0f0f0',
      padding: '1rem',
      borderRadius: '8px',
      maxHeight: '400px',
      overflowY: 'auto',
      fontSize: '0.9rem'
    },
    logEntry: {
      padding: '2px 0',
      borderBottom: '1px solid #333'
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#66c887';
      case 'error': return '#ff6b6b';
      default: return '#ddd';
    }
  };

  return (
    <div style={styles.container}>
      <h1>Socket.IO Debug Panel</h1>
      
      <div style={styles.status}>
        <strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}<br/>
        <strong>Socket ID:</strong> {socketId || 'None'}<br/>
        <strong>Socket URL:</strong> {SOCKET_URL}
      </div>

      <div style={styles.controls}>
        <button style={styles.button} onClick={handleConnect}>
          Connect
        </button>
        <button style={styles.button} onClick={handleDisconnect}>
          Disconnect
        </button>
        <button style={styles.button} onClick={handleTestJoinHost}>
          Test Join Host
        </button>
        <button style={styles.button} onClick={clearLogs}>
          Clear Logs
        </button>
      </div>

      <div style={styles.controls}>
        <input
          style={styles.input}
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message"
        />
        <button style={styles.button} onClick={handleTestEmit}>
          Send Test Event
        </button>
      </div>

      <div style={styles.logs}>
        <h3>Socket Logs:</h3>
        {logs.map(log => (
          <div 
            key={log.id} 
            style={{
              ...styles.logEntry,
              color: getLogColor(log.type)
            }}
          >
            [{log.timestamp}] {log.message}
          </div>
        ))}
        {logs.length === 0 && (
          <div style={{color: '#888'}}>No logs yet...</div>
        )}
      </div>
    </div>
  );
};

export default SocketDebug;
