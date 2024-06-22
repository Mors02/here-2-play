import React, { useEffect, useState } from 'react';
import { axiosConfig } from "../axiosConfig"
import { Grid } from "@mui/material"
import axios from 'axios';
import { useNavigate } from 'react-router';

function GameList() {
    const [games, setGames] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        axiosConfig.get("/api/games")
            .then((res) =>
                setGames(res.data)
            )
    }, [])

    function Games() {
        const maxHomepageGames = process.env.REACT_APP_MAX_HOMEPAGE_GAMES
        let filteredGames = []

        filteredGames = games.length > maxHomepageGames ? games.slice(0, maxHomepageGames) : games

        return filteredGames.map(game => 
            <div key={game.id} onClick={() => navigate("/games/" + game.id)} className='bg-red-500 w-[15%] h-[250px] m-4'>
                { game.title }
            </div>
        )
    }

    return (
        <div className='bg-slate-500 flex flex-wrap m-auto'>
            <Games />
        </div>
    )
}

export default GameList;