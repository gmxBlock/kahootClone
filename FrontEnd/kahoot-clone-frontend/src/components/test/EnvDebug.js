import React from 'react';
import { API_BASE_URL, SOCKET_URL } from '../../utils/constants';

const EnvDebug = () => {
  return (
    <div style={{ 
      background: '#f0f0f0', 
      padding: '20px', 
      margin: '20px', 
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h3>🔍 Environment Variables Debug</h3>
      <div style={{ marginBottom: '10px' }}>
        <strong>Raw process.env values:</strong>
        <br />
        <code>REACT_APP_API_BASE_URL: {process.env.REACT_APP_API_BASE_URL || 'undefined'}</code>
        <br />
        <code>REACT_APP_SOCKET_URL: {process.env.REACT_APP_SOCKET_URL || 'undefined'}</code>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Constants values:</strong>
        <br />
        <code>API_BASE_URL: {API_BASE_URL}</code>
        <br />
        <code>SOCKET_URL: {SOCKET_URL}</code>
      </div>

      <div>
        <strong>All REACT_APP_ env vars:</strong>
        <br />
        <pre style={{ fontSize: '12px', background: 'white', padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(
            Object.keys(process.env)
              .filter(key => key.startsWith('REACT_APP_'))
              .reduce((obj, key) => {
                obj[key] = process.env[key];
                return obj;
              }, {}),
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
};

export default EnvDebug;
