import React from "react";
import { Box, Button } from "@mui/material";
import GameList from "../../Component/GameList";
import { FaPlus } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import BundleList from "../../Component/BundleList";

export default function BundleOfUser({ user, currentUser }) {
    const { id } = useParams()
    const navigate = useNavigate()

    function handleClick(bundle) {
        return navigate('/bundle/' + bundle.id, {state: {backToBundles: true}})
    }

    return (
        <Box className="px-4 py-3">
            <BundleList bundles={user.bundles} handleClick={handleClick}/>
            
            {
                id == currentUser?.id &&
                <Button className='!mt-6' variant='contained'>
                    <FaPlus className='mr-2' /><Link to="/bundle/create">Nuovo Bundle</Link>
                </Button>
            }
        </Box>
    );
}