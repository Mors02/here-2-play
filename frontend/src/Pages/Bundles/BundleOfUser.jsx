import React from "react";
import { Box, Button } from "@mui/material";
import GameList from "../../Component/GameList";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import BundleList from "../../Component/BundleList";

export default function BundleOfUSer({user}) {
    const navigate = useNavigate()

    function handleClick(bundle) {
        return navigate('/bundle/'+bundle.id)
    }

    return (
        <Box className="px-10 py-8">
            <BundleList bundles={user.bundles} handleClick={handleClick}/>
            
            <Button className='!mt-6' variant='contained'>
                <FaPlus className='mr-2' /><Link to="/bundle/create">Nuovo Bundle</Link>
            </Button>
        </Box>
    );
}