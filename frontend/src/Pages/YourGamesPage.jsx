import { axiosConfig } from '../config/axiosConfig';
import { React, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from '@mui/material';

function UserGamesPage() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axiosConfig.get('/api/your-games/')
            .then(
                (res) => {
                    setGames(res.data); console.log(res.data)
                    setLoading(false)
                }
            )
    }, [])

    return (
        <div>
            {
                !loading && games.map((val) =>
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