import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>React App is Working!</h1>
      <p>This confirms that the React application is loading correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <code>Environment: {import.meta.env.MODE}</code>
      </div>
    </div>
  );
};

export default TestPage;
