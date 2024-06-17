import { useState, useEffect } from 'react';
import { axiosConfig, getCookie } from '../axiosConfig';

export default function useCurrentUser() {
  const [auth, setAuth] = useState();
    useEffect(() => {        
        console.log(getCookie('csrftoken'))
        axiosConfig.get("/api/user/", {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            withCredentials: true
        })
        .then(res => {
            setAuth(res);
        })
        .catch(error => {
            setAuth();
        })
        }, []);

  return {user: auth, loggedIn: auth != null}
}