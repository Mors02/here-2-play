import React, {useState, useEffect} from "react";
import {axiosConfig, getCookie} from "../axiosConfig";
import Sidebar from "./Sidebar";
import {Container, Button, Box, Drawer} from "@mui/material";
import ReorderIcon from '@mui/icons-material/Reorder';


function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const [authUser, setAuth] = useState();

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
      });

    
    return (
        <Box>
            <Container class="min-h-12 bg-slate-500">
                <div class="p-5">
                    LOGO HERE
                    <Button class="float-right" onClick={() => toggleDrawer(true)}><ReorderIcon /></Button>
                </div>
            </Container>
            <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                <Sidebar authUser={authUser} onSelect={() => toggleDrawer(false)}/>
            </Drawer>
            {props.children}  
        </Box>      
    );
}

export default Layout