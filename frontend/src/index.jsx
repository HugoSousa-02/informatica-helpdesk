import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Regista o Service Worker para Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registado:', registration.scope);
      })
      .catch(error => {
        console.log('Falha no registo do Service Worker:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);