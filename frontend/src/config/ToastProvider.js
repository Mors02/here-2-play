import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastProvider = ({ children }) => {

  return (
    <>
      <ToastContainer 
        autoClose={5000}
        draggable={true}
        /> {/* Container in cui verranno renderizzati i toast */}
      {children}
    </>
  );
};

export default ToastProvider;
