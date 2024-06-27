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
    const location = useLocation()
    
    useEffect(() => {
        setLoading(true)
        axiosConfig.get('/api/games/')
            .then(res => {
                setGames(res.data)
            })
        setLoading(false)
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
                ? <GameList games={games} maxCount={30} handleClick={handleClick} tagId={location?.state?.tagId} previewPrices={true} searchSection={true} selection={[]} /> 
                : <Typography>Non sono presenti giochi nello store...</Typography> 
            }
        </Box>
    );
}

export default Homepage;