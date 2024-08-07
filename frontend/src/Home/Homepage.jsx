import React, { useEffect, useState } from 'react';
import GameList from '../Component/GameList';
import Box from '@mui/material/Box';
import { Typography, Divider, TextField, Button, Stack, Slider, Select, FormControl, MenuItem, InputLabel } from '@mui/material';
import { IoSearchOutline } from "react-icons/io5";
import { axiosConfig } from '../config/axiosConfig';
import { useLocation, useNavigate } from 'react-router';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ErrorMap } from '../config/enums';
import { useForm } from 'react-hook-form';
import Search from '../Component/Search';

function Homepage() {
    const [loading, setLoading] = useState()
    const [games, setGames] = useState([])
    const [mostSold, setMostSold] = useState([])
    const [bestRated, setBestRated] = useState([])
    const [bestByCategory, setBestByCategory] = useState([])
    const [fromFriends, setFromFriends] = useState([])
    const [fromMostSimilar, setFromMostSimilar] = useState([])
    const [similarFriend, setSimilarFriend] = useState([])
    const [showRecommendations, setShowRecommendations] = useState(true)
    const { state } = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        mostSoldGames()
        bestRatedGames()
        recommendedFromFriends()
        recommendationsFromMostSimilarGames()
        bestGamesByCategory()

        if (!state?.tagId)
            allGames()
    }, [])

    function updateData(games) {
        setLoading(true)

        setGames(games)

        setLoading(false)
    }

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
            
    function recommendedFromFriends() {
        axiosConfig.get('/api/stats/recommended-from-friends/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setFromFriends(res.data)
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

    function recommendationsFromMostSimilarGames() {
         axiosConfig.get('/api/stats/recommendations-from-most-similar-friend/')
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setFromMostSimilar(res.data.games)
                setSimilarFriend(res.data.friend.username)
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

    function RecommendedGames({ games, title }) {
        if (games?.length > 0)
        return (
            <Box className="mb-6">
                <Divider className="text-3xl !my-6"><b>{title}</b></Divider>
                <GameList games={games} maxCount={5} handleClick={handleClick} previewPrices={true} selection={[]} />
            </Box>
        )
    }

    if (!loading)
    return (
        <Box className='p-10'>
            <Search tagId={ state?.tagId } updateData={updateData} setShowRecommendations={setShowRecommendations} />

            <Box>
                {
                    showRecommendations && (
                        <Box>
                            <RecommendedGames games={bestRated} title={"Ultime Uscite Migliori"} />
                            <RecommendedGames games={mostSold} title={"Giochi di Tendenza"} />
                            <RecommendedGames games={fromFriends} title={"Più Acquistati dagli Amici"} />
                            { similarFriend && <RecommendedGames games={fromMostSimilar} title={`Come a "${similarFriend}", Può Interessarti`} /> }
                            {
                                Object.keys(bestByCategory).map(category => 
                                    <RecommendedGames games={bestByCategory[category]} title={"Se Ti Piace " + category + ", Non Perderti"} />
                                )
                            }
                        </Box>
                    )
                }
                <Box>
                    <Divider className="text-3xl !my-6"><b>Tutti i Giochi</b></Divider>
                    { 
                        games.length > 0 
                        ? <GameList games={games} maxCount={30} handleClick={handleClick} previewPrices={true} selection={[]} />
                        : <Typography className='text-center'>Non ci sono giochi presenti secondo tali filtri</Typography>
                    }
                </Box>
            </Box>
        </Box>
    );
}

export default Homepage;