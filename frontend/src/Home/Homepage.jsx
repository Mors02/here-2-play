import React, { useEffect, useState } from 'react';
import GameList from '../Component/GameList';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { axiosConfig } from '../config/axiosConfig';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';

function Homepage() {
    const [loading, setLoading] = useState()
    const [games, setGames] = useState([])
    const navigate = useNavigate()
    const { state } = useLocation()
    
    useEffect(() => {
        setLoading(true)
        axiosConfig.get('/api/games/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setGames(res.data)
                setLoading(false)
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }, [])

    function handleClick(game) {
        axiosConfig.post('/api/visit/game/', { game: game.id })
            .then(res => {
                return navigate('/games/' + game.id)
            })
    } 

    if (!loading)
    return (
        <Box className='p-10'>
            { 
                games.length > 0 
                ? <GameList games={games} maxCount={30} handleClick={handleClick} tagId={state?.tagId} previewPrices={true} searchSection={true} selection={[]} /> 
                : <Typography>Non sono presenti giochi nello store...</Typography> 
            }
        </Box>
    );
}

export default Homepage;