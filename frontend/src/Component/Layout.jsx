import React, { useState, useEffect } from "react";
import { axiosConfig, getCookie } from "../config/axiosConfig";
import Sidebar from "./Sidebar";
import { Container, Button, Box, Drawer, CircularProgress } from "@mui/material";
import ReorderIcon from '@mui/icons-material/Reorder';
import useCurrentUser from "../config/UseCurrentUser";
import { useAuth } from "../config/AuthContext";
import { FaUserFriends } from "react-icons/fa";
import { shouldShowFriendlistInUrl } from "../Routing/Route";
import FriendListPage from "../Pages/FriendListPage";

function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const {loggedIn, loading} = useCurrentUser();
    const [showFriends, setShowFriends] = useState(false);
    const location = window.location.href;

    function toggleFriends(){
        setShowFriends(!showFriends)
    }

    return (
        <Box>
            {!loading? <>
                <Container class="min-h-12 bg-slate-500">
                    <div class="p-5">
                        LOGO HERE
                        <Button class="float-right" onClick={() => toggleDrawer(true)}><ReorderIcon /></Button>
                    </div>
                </Container>
                <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                    <Sidebar onSelect={() => toggleDrawer(false)}/>
                </Drawer>
                { props.children }  </> : <CircularProgress />
            }

            {loggedIn && shouldShowFriendlistInUrl(location)?
                showFriends? 
                    <Box className="bg-slate-400 fixed bottom-12 left-12 h-1/3 w-1/5 rounded-xl">
                        
                        <FriendListPage onClick={() => toggleFriends()}/>
                    </Box> :
                    <Box className="bg-slate-400 fixed bottom-12 left-12 min-h-16 min-w-16 rounded-full grid place-items-center justify-center cursor-pointer" onClick={() => toggleFriends()}>
                        <FaUserFriends className="h-10 w-10" />
                    </Box> 
                : <></>           
            }
        </Box>             
    );
}

export default Layout