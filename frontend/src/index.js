import React from 'react';
import ReactDOM from 'react-dom/client';
import './output.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AuthProvider } from "./config/AuthContext";
import ToastProvider from './config/ToastProvider';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>    
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ToastProvider>
        <BrowserRouter>
          <React.StrictMode>
              <App />
          </React.StrictMode>
        </BrowserRouter>
      </ToastProvider>
    </LocalizationProvider>
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
