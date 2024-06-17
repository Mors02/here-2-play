import { useState, useEffect } from 'react';
import { axiosConfig, getCookie } from './axiosConfig';

export default function useCurrentUser() {
  const [auth, setAuth] = useState();
  const [loading, setLoading] = useState(true);
    useEffect(() => {        
        console.log(getCookie('csrftoken'))
        axiosConfig.get("/api/user/", {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            withCredentials: true
        })
        .then(res => {            
            setAuth(res.data);
            setLoading(false)
        })
        .catch(error => {
            setAuth();
            setLoading(false);
        })
    }, []);
    
    return {user: auth, loggedIn: auth != undefined, loading: loading}
}