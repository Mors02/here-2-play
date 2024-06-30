import React, { useEffect, useState } from 'react';
import { axiosConfig } from "../config/axiosConfig"
import { useActionData, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import { TextField, Typography, Button, Divider, Stack, Select, FormControl, InputLabel, MenuItem, Menu } from '@mui/material';
import { IoSearchOutline } from "react-icons/io5";
import Drawer from '@mui/material/Drawer';
import Slider from '@mui/material/Slider';
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums"
import { useForm } from 'react-hook-form';
import moment from 'moment';

function GameList({ selection=[], games, handleClick, maxCount=1000, previewPrices=false }) {
    const [loading, setLoading] = useState(true)
    const [filteredGames, setFilteredGames] = useState([])
    const [selected, setSelected] = useState(selection)
        
    useEffect(() => {
        setSelected(selection)
    }, [selection]);

    const maxHomepageGames = maxCount

    function updateData(games) {
        setLoading(true)

        let data = (games.length > maxHomepageGames) ? games.slice(0, maxHomepageGames) : games

        setFilteredGames(data)
        
        setLoading(false)
    }
    
    useEffect(() => {
        updateData(games)
    }, [games])

    if (!loading) 
    return (
        <Stack spacing={4}>
            <Box className='grid sm:grid-cols-3 md:grid-cols-5 gap-8'>
                {
                    filteredGames?.map(game =>
                        <Game game={game} handleClick={handleClick} selected={selected.length > 0 ? selected.some(id => id == game.id) : false} previewPrices={previewPrices}/>
                    )
                }
            </Box>
        </Stack>
    )
}

function Game({ game, handleClick, selected, previewPrices }) {
    const [entered, setEntered] = useState(false)
    const hoverClass = "bg-opacity-80 shadow-[0_-10px_20px_-15px_rgba(0,0,0)]"
    const normalClass = "bg-opacity-20"
    
    function price(game) {
        if (game?.discounts?.length > 0)
            return (+game.price - (+game.price * game.discounts[0].percentage / 100)).toFixed(2)
        else
            return (+game.price).toFixed(2)
    }

    return (
        <Box className={"relative rounded overflow-hidden hover:scale-105 transition ease-linear shadow-2xl cursor-pointer " + (selected ? "outline outline-4 outline-slate-600 opacity-80" : "")}  
            key={game.id} 
            onClick={() => handleClick(game)} 
            onMouseEnter={() => setEntered(true)} 
            onMouseLeave={() => setEntered(false)}
        >
            <img className='aspect-[600/900] w-full object-cover' src={process.env.REACT_APP_BASE_URL + (game.image ?? game.details.image)} />
            <Box className={"bg-slate-700 absolute bottom-0 w-full py-2 text-center rounded-t-lg transition ease-linear " + (entered ? hoverClass : normalClass)}>
                <Typography className='text-white md:!text-lg'>{game.title ?? game.details.title}</Typography>
            </Box>
            {
                previewPrices && <Box className={"absolute top-0 right-0 bg-opacity-80 px-2 py-1 rounded-bl-md " + (game?.discounts?.length > 0 ? 'bg-[#228B22]' : 'bg-slate-700')}>
                    <Typography className='text-white md:!text-lg'>{price(game)} €</Typography>
                </Box>
            }
        </Box>
    )
}

export default GameList;