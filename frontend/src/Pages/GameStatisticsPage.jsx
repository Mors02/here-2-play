import { Box, Divider, Stack, Typography, Rating } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { IoArrowBackCircle } from "react-icons/io5";
import { useEffect } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useState } from "react";
import { MdEdit } from "react-icons/md";
import GameCard from "../Component/GameCard";
import axios from "axios";
import useCurrentUser from "../config/UseCurrentUser";

function GameStatisticsPage() {
    const [game, setGame] = useState()
    const [loading, setLoading] = useState(true)
    const { gameId } = useParams()
    const {user} = useCurrentUser()
    const navigate = useNavigate()

    useEffect(() => {
        setLoading(true)

        axiosConfig.get('/api/games/' + gameId)
            .then(res => {
                setGame(res.data)

                axiosConfig.get('/api/games/' + gameId + '/statistics/')
                    .then(res => {
                        console.log(res)
                        // if (res.stat)
                    })
                    .catch(err => {
                        
                    })

                setLoading(false)
            })
    }, [])

    function handleEdit() {
        return navigate('/games/' + game.id + '/edit')
    }

    if (!loading)
    return (
        <Box className="px-[10%] lg:px-[12%] relative py-10 h-[1000px]">
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate("/user/"+user.id+"#games")} />

            <Box className="absolute top-5 right-5 cursor-pointer bg-[#63748B] rounded-full w-[40px] aspect-square align-middle flex">
                <MdEdit onClick={() => handleEdit()} color="white" size={25} className="!m-auto" />
            </Box>

            <Stack spacing={4}>
                <GameCard game={game} />

                <Stack spacing={2} className="bg-gray-100 rounded-md p-6">
                    <Divider>Statistiche (Ultimo Mese)</Divider>

                    <Typography>
                        <b>Totale visite: </b>
                        {/* {} */}
                    </Typography>
                    <Typography>
                        <b>Da utenti registrati: </b>
                        {}
                    </Typography>
                    <Typography>
                        <b>Da utenti anonimi: </b>
                        {}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    )
}

export default GameStatisticsPage;