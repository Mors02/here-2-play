import React from 'react';
import ReactDOM from 'react-dom/client';
import './output.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./config/AuthContext";
import ToastProvider from './config/ToastProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ToastProvider>
    <AuthProvider>    
        <BrowserRouter>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
