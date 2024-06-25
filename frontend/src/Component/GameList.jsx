import React, { useEffect, useState } from 'react';
import { axiosConfig } from "../config/axiosConfig"
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';

function GameList({ games, handleClick, maxCount=1000 }) {
    function Games() {
        const maxHomepageGames = maxCount
        let filteredGames = []
        
        filteredGames = games.length > maxHomepageGames ? games.slice(0, maxHomepageGames) : games

        return filteredGames.map(game => {
                return (
                    <Box key={game.id} onClick={() => handleClick(game)}>
                        <img className='aspect-[600/900] object-cover' src={process.env.REACT_APP_BASE_URL + (game.image ?? game.details.image)} />
                    </Box>
                )
            }
        )
    }

    return (
        <Box className='grid sm:grid-cols-3 md:grid-cols-5 gap-4'>
            <Games />
        </Box>
    )
}

export default GameList;