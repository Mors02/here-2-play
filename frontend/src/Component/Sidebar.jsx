import React, {useReducer} from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, axiosConfig, getRefreshToken } from "../config/axiosConfig";
import { Box, Stack, Button } from "@mui/material";
import axios from "axios";
import { useAuth } from "../config/AuthContext";
import { toast } from 'react-toastify';
import useCurrentUser from "../config/UseCurrentUser";

function Sidebar(props) {
    const {onSelect} = props;
    const {user, loggedIn} = useCurrentUser();
    const navigate = useNavigate();
    const {logout} = useAuth();

    function handleLogout(e) {
        onSelect()
        axiosConfig.post("/api/logout/", {"refresh_token": getRefreshToken()})
        .then(res => {
            logout();
            localStorage.clear();
            axiosConfig.defaults.headers.common['Authorization'] = null;
            toast.success("Logout effettuato.", {onClose: () =>{window.location.replace("/")}})
        }).catch(err => {
        })
    }

    return (
        <Stack className="float-right w-52 h- bg-slate-500 min-h-dvh">
           <h3 className="text-xl m-10">Menu laterale</h3>

            <nav className="mx-10">
                <Stack>
                    <Link to="/" onClick={() => onSelect()}>Homepage</Link>
                    {loggedIn && <a href={"/user/"+user.id} onClick={onSelect}>Profilo</a>}
                    { 
                        loggedIn
                        ?  <Button onClick={(e) => handleLogout(e)}  variant="text" color="error" >Logout</Button>
                        :  <Link to="/login" onClick={() => onSelect()}>Login</Link>
                    }
                </Stack>
            </nav>
        </Stack>
    )
}

export default Sidebar;