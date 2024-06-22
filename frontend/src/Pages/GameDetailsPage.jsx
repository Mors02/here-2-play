import React, { useEffect, useState } from "react";
import { axiosConfig } from "../axiosConfig";
import { useParams } from "react-router-dom";

function GameDetailsPage() {
    const { gameId } = useParams()
    const [game, setGame] = useState([])

    useEffect(() => {
        axiosConfig.get('/api/games/' + gameId)
            .then((res) => {
                setGame(res.data)
            })
    }, [])

    return (
        <div>
            <h1>{game.title}</h1>
            <p>{game.description}</p>
            <p>{game.price}</p>
            <p>{game.upload_date}</p>
        </div>
    )
}

export default GameDetailsPage;