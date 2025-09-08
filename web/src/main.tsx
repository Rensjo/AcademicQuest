import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

// Register service worker (custom lightweight) if production build
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = './sw.js';
    navigator.serviceWorker.register(swUrl).catch(err => {
      console.warn('[sw] registration failed', err);
    });
  });
}