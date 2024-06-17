import React from "react";
import {Link, useNavigate} from "react-router-dom";
import { getCookie, axiosConfig } from "../config/axiosConfig";
import { Box, Stack, Button } from "@mui/material";
import axios from "axios";
import { useAuth } from "../config/AuthContext";
import { ToastContainer, toast} from 'react-toastify';

function Sidebar(props) {
    const {onSelect, authUser} = props;
    const navigate = useNavigate();
    const {logout} = useAuth();

    function handleLogout(e) {
        onSelect()
        axiosConfig.get("/api/logout/", {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            withCredentials: true
        })
        .then(res => {
            toast.success("Logout effettuato.")
            logout();
            navigate("/", {replace: true})
        })
    }

    return (
        <Stack class="float-right w-52 h- bg-slate-500 min-h-dvh">
           <h3 class="text-xl m-10">Menu laterale</h3>
           
            <nav class="mx-10">
                <Stack>
                    <Link to="/" onClick={() => onSelect()}>Homepage</Link>
                    { 
                        !authUser
                        ? <Link to="/login" onClick={() => onSelect()}>Login</Link> 
                        : <Button onClick={(e) => logout(e)}  variant="text" color="error" >Logout</Button> 
                    }
                </Stack>
            </nav>
            <ToastContainer 
                position="bottom-left"
                autoClose={5000}
            />
        </Stack>
    )
}

export default Sidebar;