import React, { useState, useEffect } from "react";
import { Container, Button, Box, Drawer, CircularProgress, Stack, Avatar } from "@mui/material";
import useCurrentUser from "../config/UseCurrentUser";
import { FaUserFriends } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { OrderDropdown } from "../Pages/OrderPage";
import { Link, useNavigate } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import Friends from './Friends'
import { SlLogin } from "react-icons/sl";

function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const { loggedIn, loading, user } = useCurrentUser();
    const [dropdownVisibile, setDropdownVisibile] = useState(false);
    const navigate = useNavigate()

    function openAdminPanel() {
        return navigate('/admin/');
    }

    function navigateProfile() {
        if (!user)
            return navigate('/login')
        return navigate('/user/' + user.id)
    }

    if (!loading)
    return (
        <Box className="sticky top-0 z-50">
            <Box className="flex items-center bg-slate-500 px-6 py-3">
                <Link to="/"><b className="text-white tracking-wide">Here2Play</b></Link>

                <Box className="flex items-center grow gap-6 justify-end">
                    { user?.is_superuser && <MdAdminPanelSettings color="white" size={30} className="cursor-pointer" onClick={() => openAdminPanel()}/> }
                    { user && <FaUserFriends color="white" size={30} className="cursor-pointer" onClick={() => toggleDrawer(true)}/> }
                    { user && <FaShoppingCart color="white" size={30} className="cursor-pointer" onClick={() => setDropdownVisibile(true)} /> }
                    { user ? <Avatar className="cursor-pointer" onClick={() => navigateProfile()} sx={{ width: 40, height: 40 }} src={process.env.REACT_APP_BASE_URL + user?.profile_picture} />
                    : <SlLogin size={30} onClick={() => navigateProfile()} className="cursor-pointer"/>}
                </Box>
            </Box>

            <Drawer open={open} onClose={() => toggleDrawer(false)} anchor="right">
                <Friends onClick={() => toggleDrawer(false)} />
            </Drawer>

            <Drawer open={dropdownVisibile} anchor="right" onClose={() => setDropdownVisibile(false)}>
                <OrderDropdown />
            </Drawer>

            { props.children }
        </Box>             
    );
}

export default Layout