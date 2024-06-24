import { axiosConfig } from '../config/axiosConfig';
import { React, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import { FaPlus } from "react-icons/fa";
import Box from '@mui/material/Box';

function UserGamesPage() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        axiosConfig.get('/api/your-games/')
            .then(
                (res) => {
                    setGames(res.data)
                    setLoading(false)
                }
            )
    }, [])

    return (
        <Box className="bg-slate-500">
            {
                !loading && games.map(game => {
                    console.log(game)
                    return (
                        <div key={game.id} onClick={() => navigate("/games/" + game.id + "/edit")} className='bg-red-500 w-[15%] h-[250px] m-4'>
                            <img src={game.image} />
                        </div>
                    )
                })
            }
            <Button variant='contained'>
                <FaPlus className='mr-2' /><Link to="/publish">Nuovo gioco</Link>
            </Button>
        </Box>
    );
}

export default UserGamesPage;