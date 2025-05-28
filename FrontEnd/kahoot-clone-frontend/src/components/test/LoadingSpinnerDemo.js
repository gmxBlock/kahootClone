import React, { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const LoadingSpinnerDemo = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  const demoStyles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    section: {
      marginBottom: '3rem',
      padding: '2rem',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      backgroundColor: '#f8fafc'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '1rem'
    },
    demoBox: {
      padding: '2rem',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      textAlign: 'center',
      minHeight: '200px'
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500'
    }
  };

  return (
    <div style={demoStyles.container}>
      <h1>Loading Spinner Demo</h1>
      <p>Testing the revamped loading spinner component with various sizes, colors, and configurations.</p>

      {/* Size Variants */}
      <div style={demoStyles.section}>
        <h2>Size Variants</h2>
        <div style={demoStyles.grid}>
          <div style={demoStyles.demoBox}>
            <h3>Small</h3>
            <LoadingSpinner 
              size="small" 
              message="Small spinner..." 
              color="primary"
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Medium (Default)</h3>
            <LoadingSpinner 
              size="medium" 
              message="Medium spinner..." 
              color="primary"
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Large</h3>
            <LoadingSpinner 
              size="large" 
              message="Large spinner..." 
              color="primary"
            />
          </div>
        </div>
      </div>

      {/* Color Themes */}
      <div style={demoStyles.section}>
        <h2>Color Themes</h2>
        <div style={demoStyles.grid}>
          <div style={demoStyles.demoBox}>
            <h3>Primary</h3>
            <LoadingSpinner 
              color="primary" 
              message="Primary theme..." 
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Secondary</h3>
            <LoadingSpinner 
              color="secondary" 
              message="Secondary theme..." 
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Success</h3>
            <LoadingSpinner 
              color="success" 
              message="Success theme..." 
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Warning</h3>
            <LoadingSpinner 
              color="warning" 
              message="Warning theme..." 
            />
          </div>
        </div>
      </div>

      {/* Different Messages */}
      <div style={demoStyles.section}>
        <h2>Custom Messages</h2>
        <div style={demoStyles.grid}>
          <div style={demoStyles.demoBox}>
            <h3>Game Loading</h3>
            <LoadingSpinner 
              message="Starting your game..." 
              color="secondary"
              size="medium"
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Quiz Loading</h3>
            <LoadingSpinner 
              message="Loading quiz questions..." 
              color="primary"
              size="medium"
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>Saving Progress</h3>
            <LoadingSpinner 
              message="Saving your progress..." 
              color="success"
              size="small"
            />
          </div>
          <div style={demoStyles.demoBox}>
            <h3>No Message</h3>
            <LoadingSpinner 
              message="" 
              color="warning"
              size="large"
            />
          </div>
        </div>
      </div>

      {/* Overlay Test */}
      <div style={demoStyles.section}>
        <h2>Overlay Mode</h2>
        <p>Test the fullscreen overlay spinner that can be used for blocking operations.</p>
        <button 
          style={demoStyles.button}
          onClick={() => setShowOverlay(true)}
        >
          Show Overlay Spinner
        </button>
        
        {showOverlay && (
          <LoadingSpinner 
            overlay={true}
            message="Processing your request..."
            color="primary"
            size="large"
          />
        )}
        
        {showOverlay && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <button 
              style={{...demoStyles.button, backgroundColor: '#e74c3c'}}
              onClick={() => setShowOverlay(false)}
            >
              Close Overlay
            </button>
          </div>
        )}
      </div>

      {/* Usage Examples */}
      <div style={demoStyles.section}>
        <h2>Usage Examples</h2>
        <div style={{backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '6px', marginTop: '1rem'}}>
          <h4>Basic Usage:</h4>
          <pre style={{fontSize: '0.9rem', color: '#334155'}}>
{`<LoadingSpinner />

<LoadingSpinner 
  message="Loading quiz..." 
  size="large" 
  color="primary" 
/>

<LoadingSpinner 
  overlay={true}
  message="Saving progress..."
  color="success"
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinnerDemo;
