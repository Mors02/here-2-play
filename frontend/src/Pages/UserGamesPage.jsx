import { axiosConfig } from '../axiosConfig';
import { React, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from '@mui/material';

function UserGamesPage() {
    const [games, setGames] = useState([])

    useEffect(() => {
        axiosConfig.get('/api/games/')
            .then(
                (res) => {setGames(res.data); console.log(res.data)}
            )
    }, [])

    return (
        <div>
            {
                games.map((val) =>
                    <p>{val.title} - {val.price} €</p>
                )
            }
            <Button variant='contained'>
                <Link to="/publish">Publish new game</Link>
            </Button>
        </div>
    );
}

export default UserGamesPage;