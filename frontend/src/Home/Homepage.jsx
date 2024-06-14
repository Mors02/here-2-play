import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Component/Sidebar';


function Homepage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/hello-world/')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  return (
      <div>
        <h1>Store homepage</h1>
        <p>{message}</p>
      </div>
  );
}

export default Homepage;