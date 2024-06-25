import React, { useEffect, useState } from 'react';
import { axiosConfig } from "../config/axiosConfig"
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { MdSentimentVerySatisfied } from 'react-icons/md';

function GameList({ games, handleClick, maxCount=1000 }) {
    function Games() {
        const maxHomepageGames = maxCount
        let filteredGames = []
        
        
        filteredGames = games.length > maxHomepageGames ? games.slice(0, maxHomepageGames) : games
        
        return filteredGames.map(game => {
                return (
                    <Game game={game} handleClick={handleClick} />
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

function Game({game, handleClick}) {
    const [entered, setEntered] = useState(false)
    const hoverClass = "bg-slate-700 absolute bottom-0 w-full py-2 text-center bg-opacity-80 rounded-t-lg transition ease-linear"
    const normalClass = "bg-slate-700 absolute bottom-0 w-full py-2 text-center bg-opacity-20 rounded-t-lg transition ease-linear"
    return (
            <Box className="relative" key={game.id} onClick={() => handleClick(game)} onMouseEnter={() => setEntered(true)} onMouseLeave={() => setEntered(false)}>
                <img className='aspect-[600/900] object-cover' src={process.env.REACT_APP_BASE_URL + (game.image ?? game.details.image)} />
                <Box className={entered ? hoverClass : normalClass}>
                    <Typography variant="h4" className='text-white cursor-default'>{game.title}</Typography>
                </Box>
            </Box>
    )}

export default GameList;