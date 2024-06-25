import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Container, Button, Box, Drawer, CircularProgress, Stack } from "@mui/material";
import ReorderIcon from '@mui/icons-material/Reorder';
import useCurrentUser from "../config/UseCurrentUser";
import { FaUserFriends } from "react-icons/fa";
import { shouldShowFriendlistInUrl } from "../Routing/Route";
import FriendListPage from "../Pages/FriendListPage";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { OrderDropdown } from "../Pages/OrderPage";
import { Link } from "react-router-dom";

function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const {loggedIn, loading} = useCurrentUser();
    const [showFriends, setShowFriends] = useState(false);
    const [dropdownVisibile, setDropdownVisibile] = useState(false);
    const location = window.location.href;

    function toggleFriends(){
        setShowFriends(!showFriends)
    }

    return (
        <Box>
            {!loading? <>
                <Box className="min-h-12 bg-slate-500 ">
                    <Box className="p-5">
                        <Link to="/">LOGO HERE</Link>
                        <Stack direction={"row"} className="float-right w-60 flex justify-end">
                            <ShoppingCartIcon fontSize="large" className="cursor-pointer" onClick={() => setDropdownVisibile(true)}/>
                            <ReorderIcon fontSize="large" className="cursor-pointer ml-20" onClick={() => toggleDrawer(true)}/>
                        </Stack>
                    </Box>
                </Box>
                <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                    <Sidebar onSelect={() => toggleDrawer(false)}/>
                </Drawer>
                <Drawer open={dropdownVisibile} anchor="right" onClose={() => setDropdownVisibile(false)}>
                    <OrderDropdown />
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