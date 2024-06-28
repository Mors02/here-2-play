import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Container, Button, Box, Drawer, CircularProgress, Stack, Avatar } from "@mui/material";
import ReorderIcon from '@mui/icons-material/Reorder';
import useCurrentUser from "../config/UseCurrentUser";
import { FaUserFriends } from "react-icons/fa";
import { shouldShowFriendlistInUrl } from "../Routing/Route";
import FriendListPage from "../Pages/FriendListPage";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { FaShoppingCart } from "react-icons/fa";
import { OrderDropdown } from "../Pages/OrderPage";
import { Link, useNavigate } from "react-router-dom";

function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const { loggedIn, user, loading } = useCurrentUser();
    const [showFriends, setShowFriends] = useState(false);
    const [dropdownVisibile, setDropdownVisibile] = useState(false);
    const navigate = useNavigate()
    const location = window.location.href;

    function toggleFriends(){
        setShowFriends(!showFriends)
    }

    function navigateProfile() {
        navigate('/user/' + user.id)
    }

    if (!loading)
    return (
        <Box>
            <Box className="flex items-center bg-slate-500 px-6 py-3">
                <Link to="/"><b className="text-white tracking-wide">Here2Play</b></Link>

                <Box className="flex items-center grow gap-6 justify-end">
                    <FaUserFriends color="white" size={30} className="cursor-pointer" onClick={() => toggleDrawer(true)}/>
                    {/* <ShoppingCartIcon fontSize="large" className="cursor-pointer" onClick={() => setDropdownVisibile(true)}/> */}
                    <FaShoppingCart color="white" size={30} className="cursor-pointer" onClick={() => setDropdownVisibile(true)} />
                    <Avatar className="cursor-pointer" onClick={() => navigateProfile()} sx={{ width: 40, height: 40 }} src={process.env.REACT_APP_BASE_URL + user.profile_picture} />
                </Box>
            </Box>

            <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                <Sidebar onSelect={() => toggleDrawer(false)} />
            </Drawer>
            <Drawer open={dropdownVisibile} anchor="right" onClose={() => setDropdownVisibile(false)}>
                <OrderDropdown />
            </Drawer>
            { props.children }

            {loggedIn && shouldShowFriendlistInUrl(location)?
                showFriends? 
                    <Box className="bg-slate-400 fixed bottom-12 left-12 h-1/3 w-1/5 rounded-xl z-50">
                        <FriendListPage onClick={() => toggleFriends()}/>
                    </Box> :
                    <Box className="bg-slate-400 fixed bottom-12 left-12 min-h-16 min-w-16 rounded-full grid place-items-center justify-center cursor-pointer z-50" onClick={() => toggleFriends()}>
                        <FaUserFriends className="h-10 w-10" />
                    </Box> 
                : <></>           
            }
        </Box>             
    );
}

export default Layout