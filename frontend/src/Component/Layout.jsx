import React, {useState, useEffect} from "react";
import axios from 'axios';
import Sidebar from "./Sidebar";
import {Container, Button, Box, Drawer} from "@mui/material";
import ReorderIcon from '@mui/icons-material/Reorder';

function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const [isAuth, setAuth] = useState(false);
    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_URL + '/api/is-authenticated/')
          .then(response => {
            setAuth(response.data.message)
          })
          .catch(error => {
            console.log(error);
          });
      }, []);
    
    return (
        <Box>
            <Container class="min-h-12 bg-slate-500">
                <div class="p-5">
                    LOGO HERE
                    <span class="ml-10">{isAuth? "Loggato" : "Non Loggato"}</span>
                    <Button class="float-right" onClick={() => toggleDrawer(true)}><ReorderIcon /></Button>
                </div>                
            </Container>
            <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                <Sidebar onSelect={() => toggleDrawer(false)}/>
            </Drawer>
            {props.children}  
        </Box>      
    );
}

export default Layout