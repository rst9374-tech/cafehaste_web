/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Auto-reload on dynamic import (Vite Chunk Load) errors
window.addEventListener('error', (e) => {
  const isChunkError = e.message && (
    e.message.includes('Failed to fetch dynamically imported module') ||
    e.message.includes('Expected a JavaScript-or-Wasm module script but the server responded with a MIME type')
  );
  if (isChunkError) {
    console.warn('Chunk load error detected. Reloading page...');
    window.location.reload();
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  const isChunkError = e.reason && e.reason.message && (
    e.reason.message.includes('Failed to fetch dynamically imported module') ||
    e.reason.message.includes('Expected a JavaScript-or-Wasm module script but the server responded with a MIME type')
  );
  if (isChunkError) {
    console.warn('Chunk load rejection detected. Reloading page...');
    window.location.reload();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);