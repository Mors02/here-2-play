import { useState, useEffect } from 'react';
import { axiosConfig, getToken } from './axiosConfig';

export default function useCurrentUser() {
  const [user, setUser] = useState();
  const [role, setRole] = useState();
  const [loading, setLoading] = useState(true);
    useEffect(() => {        
        axiosConfig.get("/api/user/")
        .then(res => {        
            //console.log(res.data);    
            setUser(res.data.user);
            setRole(res.data.role);
            setLoading(false);
        })
        .catch(error => {
            setLoading(false);
            setUser();        
            setRole();    
        })
    }, []);
    
    return {user: user, role: role, loggedIn: user != null, loading: loading}
}