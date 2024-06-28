import React, { useEffect, useState } from 'react';
import GameList from '../Component/GameList';
import Box from '@mui/material/Box';
import { Typography, Divider } from '@mui/material';
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
    const [bestByCategory, setBestByCategory] = useState([])
    const navigate = useNavigate()
    const { state } = useLocation()
    
    useEffect(() => {
        const gamesSections = async () => {
            const promises = [
                mostSoldGames(),
                allGames(),
                bestRatedGames(),
                bestGamesByCategory(),
            ]

            const data = await Promise.allSettled(promises).finally(() => {console.log(mostSold, bestRated, games); setLoading(false)});
            //console.log(data)
        }
        gamesSections();
        //allGames()
    }, [])

    async function allGames() {
        axiosConfig.get('/api/games/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setGames(res.data)
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
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

    async function bestGamesByCategory() {
        axiosConfig.get('api/stats/by-category')
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
                setBestByCategory(res.data)
                console.log(res.data)
        }).catch(err => {
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
                    {bestRated.length > 0 && <Box className="mb-6">
                        <Divider className="text-3xl !my-6"><b>Ultime uscite migliori</b></Divider>
                        <GameList games={bestRated} maxCount={5} handleClick={handleClick} previewPrices={true} selection={[]} />
                    </Box>}
                    {mostSold.length > 0 && <Box className="mb-6">
                        <Divider className="text-3xl !my-6"><b>Giochi di tendenza</b></Divider>
                        <GameList games={mostSold} maxCount={5} handleClick={handleClick} previewPrices={true} selection={[]} />
                    </Box>}
                    <Box>
                        <Divider className="text-3xl !my-6"><b>Tutti i giochi</b></Divider>
                        <GameList games={games} maxCount={30} handleClick={handleClick} tagId={state?.tagId} previewPrices={true} searchSection={false} selection={[]} /> 
                    </Box>
                </Box>
                : <Typography>Non sono presenti giochi nello store...</Typography> 
            }
        </Box>
    );
}

export default Homepage;