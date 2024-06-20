import React, {useReducer} from "react";
import {Link, useNavigate} from "react-router-dom";
import { getCookie, axiosConfig } from "../config/axiosConfig";
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
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    function handleLogout(e) {
        onSelect()
        axiosConfig.get("/api/logout/", {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            withCredentials: true
        })
        .then(res => {
            logout();
            toast.success("Logout effettuato.", {onClose: () =>{forceUpdate(); navigate("/")}})
        })
    }

    return (
        <Stack class="float-right w-52 h- bg-slate-500 min-h-dvh">
           <h3 class="text-xl m-10">Menu laterale</h3>
           
            <nav class="mx-10">
                <Stack>
                    <Link to="/" onClick={() => onSelect()}>Homepage</Link>
                    {loggedIn?
                    <Link to="/user" onClick={onSelect}>Profilo</Link>: <></>
                    }
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