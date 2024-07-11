import { axiosConfig } from '../config/axiosConfig';
import { React, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from '@mui/material';
import { FaPlus } from "react-icons/fa";
import Box from '@mui/material/Box';
import GameList from './GameList';
import useCurrentUser from '../config/UseCurrentUser';
import { toast } from 'react-toastify';
import { ErrorMap } from '../config/enums';

function UserGamesPage() {
    const [games, setGames] = useState([])
    const [pageLoading, setPageLoading] = useState()
    const { user, userLoading } = useCurrentUser()
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        setPageLoading(true)
        axiosConfig.get('/api/user/' + id)
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                setGames(res.data.published_games)
                setPageLoading(false)
            }
        )
        .catch(err => {
            toast.error(ErrorMap[err.message])
        })
    }, [])
    
    function handleClick(game) {
        if (game.publisher.id == user.id)
            return navigate('/games/' + game.id + '/statistics')
        return navigate('/games/' + game.id)
    }
    
    if (!userLoading && !pageLoading)
    return (
        <Box className='px-4 py-3'>
            <GameList games={games} handleClick={handleClick} selection={[]} />

            {
                id == user?.id &&
                <Button className='!mt-6' variant='contained'>
                    <FaPlus className='mr-2' /><Link to="/publish">Nuovo Gioco</Link>
                </Button>
            }

        </Box>
    );
}

export default UserGamesPage;