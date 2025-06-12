// src/App.js
import React from 'react';
import ContentForm from './components/contentForm';
// You might want to add some basic CSS or a framework like Bootstrap for better styling

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
        <h1>CogniWrite Pro</h1>
        <p>AI-Powered Adaptive Content Optimization</p>
      </header>
      <main>
        <ContentForm />
      </main>
      <footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px', borderTop: '1px solid #ddd', color: '#666' }}>
        <p>&copy; 2025 CogniWrite Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;