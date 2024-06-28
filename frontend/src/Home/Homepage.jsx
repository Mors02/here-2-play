import React, { useEffect, useState } from 'react';
import GameList from '../Component/GameList';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { axiosConfig } from '../config/axiosConfig';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ErrorMap } from '../config/enums';

function Homepage() {
    const [loading, setLoading] = useState()
    const [games, setGames] = useState([])
    const [mostSold, setMostSold] = useState([])
    const [bestRated, setBestRated] = useState([])
    const navigate = useNavigate()
    const { state } = useLocation()
    
    useEffect(() => {
        // const gamesSections = async () => {
        //     const promises = [
        //         mostSoldGames(),
        //         allGames(),
        //         bestRatedGames(),
        //     ]

        //     const data = await Promise.allSettled(promises).finally(() => {console.log(mostSold, bestRated, games); setLoading(false)});
        //     //console.log(data)
        // }

        // gamesSections();
        allGames()
    }, [])

    async function allGames() {
        axiosConfig.get('/api/games/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setGames(res.data)
            })
            .then(async (res) => {
                await mostSoldGames()
            })
            .then(async (res)=> {
                await bestRatedGames()
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
            .finally(() => {
                setLoading(false)
            })
    }

    async function mostSoldGames() {
        axiosConfig.get('/api/stats/most-sold/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setMostSold(res.data)
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }

    async function bestRatedGames() {
        axiosConfig.get('/api/stats/best-rated/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setBestRated(res.data)
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }


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
                games.length > 0 ? 
                <Box>
                    <Box className="mb-6">
                        <Typography variant='h4'>Giochi con i voti migliori: </Typography>
                        <GameList games={bestRated} maxCount={5} handleClick={handleClick} previewPrices={true} selection={[]} />
                    </Box>
                    <Box className="mb-6">
                        <Typography variant='h4'>Giochi più venduti: </Typography>
                        <GameList games={mostSold} maxCount={5} handleClick={handleClick} previewPrices={true} selection={[]} />
                    </Box>
                    <Box>
                        <Typography variant='h4'>Tutti i giochi: </Typography>
                        <GameList games={games} maxCount={30} handleClick={handleClick} tagId={state?.tagId} previewPrices={true} searchSection={false} selection={[]} /> 
                    </Box>
                </Box>
                : <Typography>Non sono presenti giochi nello store...</Typography> 
            }
        </Box>
    );
}

export default Homepage;