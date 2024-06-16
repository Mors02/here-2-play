import React from "react";
import {Link, useNavigate} from "react-router-dom";
import { Box, Stack, Button } from "@mui/material";
import axios from "axios";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

function Sidebar(props) {
    const {onSelect, authUser} = props;
    const navigate = useNavigate();
    function logout(e) {
        axios.post(process.env.REACT_APP_BASE_URL + "/api/logout/", {withCredentials: true})
        .then(res => {
            navigate("/", {replace: true})
        })
    }

    return (
        <>
        <Stack class="float-right w-52 h- bg-slate-500 min-h-dvh">
           <h3 class="text-xl m-10">Menu laterale</h3>
            {/*<p>{authenticated? "Loggato" : "Non loggato"}</p>*/}
           
            <nav class="mx-10">
                <Stack>
                    <Link to="/" onClick={() => onSelect()}>Homepage</Link>
                    {!authUser?<Link to="/login" onClick={() => onSelect()}>Login</Link> : <p></p>}
                    {authUser? <Button onClick={(e) => logout(e)}  variant="text" color="error" >Logout</Button> : <></>}
                </Stack>
            </nav>
        </Stack>
        </>
    )
    
}

export default Sidebar;