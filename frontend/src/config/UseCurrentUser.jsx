import { useState, useEffect } from 'react';
import { axiosConfig, getToken } from './axiosConfig';

export default function useCurrentUser() {
    const [user, setUser] = useState();
    const [role, setRole] = useState();
    const [pfp, setPfp] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {        
        axiosConfig.get("/api/authuser/")
            .then(res => {        
                //console.log(res.data);    
                setUser(res.data.user);
                setRole(res.data.role);
                setPfp(res.data.profile_picture);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                setUser();        
                setRole();
                setPfp();  
            })
    }, []);
    
    return { user: user, role: role, loggedIn: user != null, loading: loading, pfp: pfp }
}