import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

console.log('App starting...');
console.log('Firebase config check:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
