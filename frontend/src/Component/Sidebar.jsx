import React from "react";
import {Link} from "react-router-dom";
import { Box, Stack } from "@mui/material";


function Sidebar(props) {
    const {onSelect} = props;
    return (
        <>
        <Stack class="float-right w-52 h- bg-slate-500 min-h-dvh">
           <h3 class="text-xl m-10">Menu laterale</h3>
            {/*<p>{authenticated? "Loggato" : "Non loggato"}</p>*/}
           
            <nav class="mx-10">
                <Stack>
                    <Link to="/" onClick={() => onSelect()}>Homepage</Link>
                    <Link to="/login" onClick={() => onSelect()}>Login</Link>               
                </Stack>
            </nav>
        </Stack>
        </>
    )
    
}

export default Sidebar;