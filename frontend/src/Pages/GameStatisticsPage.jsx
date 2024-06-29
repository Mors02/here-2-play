import { Box, Divider, Stack, Typography, Rating, FormControlLabel, Switch, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { IoArrowBackCircle } from "react-icons/io5";
import { useEffect } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { useState } from "react";
import { MdEdit } from "react-icons/md";
import GameCard from "../Component/GameCard";
import Tooltip from '@mui/material/Tooltip';
import { toast } from "react-toastify";
import moment from 'moment';
import { ErrorMap } from "../config/enums";
import useCurrentUser from "../config/UseCurrentUser";

function GameStatisticsPage() {
    const [loading, setLoading] = useState(true)
    const [game, setGame] = useState()
    const [reviews, setReviews] = useState([])
    const [registeredVisits, setRegisteredVisits] = useState()
    const [anonymousVisits, setAnonymousVisits] = useState()
    const [purchases, setPurchases] = useState()
    const [amountGain, setAmountGain] = useState()
    const [lastMonth, setLastMonth] = useState(true)
    const { gameId } = useParams()
    const { user, loggedIn } = useCurrentUser()
    const navigate = useNavigate()

    useEffect(() => {
        setLoading(true)

        axiosConfig.get('/api/games/' + gameId)
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res['response']['data'])
            
            setGame(res.data)
            
            axiosConfig.get('/api/games/' + gameId + '/statistics/' + (setLastMonth ? 'last-30-days/' : 'all-time'))
            .then(res => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res['response']['data'])
                
                setRegisteredVisits(res.data.registered_visits ?? 0)
                setAnonymousVisits(res.data.anonymous_visits ?? 0)
                setPurchases(res.data.purchases ?? 0)
                setAmountGain(res.data.amount_gain.price__sum ?? 0)
                setReviews(res.data.reviews)
                
                    setLoading(false)
                })
                .catch(err => {
                    return toast.error(ErrorMap[err.message])
            })
        })
        .catch(err => {
            return toast.error(ErrorMap[err.message])
        })
    }, [lastMonth])

    function handleEdit() {
        return navigate('/games/' + game.id + '/edit')
    }

    function VisitsProportion() {
        let totalVisits = (registeredVisits + anonymousVisits) ?? 0
        let registeredPercentage = registeredVisits != 0 ? (registeredVisits / totalVisits * 100).toFixed(0) : 0
        let anonymousPercentage = anonymousVisits != 0 ? (anonymousVisits / totalVisits * 100).toFixed(0) : 0

        return (
            <Stack spacing={2}>
                <Divider><b>Visite ({lastMonth ? "Ultimo Mese" : "Sempre"})</b></Divider>
                <Stack spacing={2} className="bg-gray-100 rounded-md p-6">
                    <Box className="flex rounded overflow-hidden justify-center">
                        <Tooltip title={"Utenti Registrati " + registeredPercentage + "%"} placement="bottom" arrow>
                            <Box className="h-[50px] bg-blue-500 flex justify-center" style={{ width: `${registeredPercentage}%` }}>
                                { registeredVisits > 0 && <Typography className="!my-auto text-white font-bold">{registeredVisits}</Typography> }
                            </Box>
                        </Tooltip>

                        <Tooltip title={"Utenti Anonimi " + anonymousPercentage + "%"} placement="bottom" arrow>
                            <Box className="h-[50px] bg-orange-400 flex justify-center" style={{ width: `${anonymousPercentage}%` }}>
                                { anonymousVisits > 0 && <Typography className="!my-auto text-white font-bold">{anonymousVisits}</Typography> }
                            </Box>
                        </Tooltip>
                    </Box>
                    <Box className="text-center">
                        <b>( {registeredVisits + anonymousVisits} )</b>
                    </Box>
                </Stack>
            </Stack>
        )
    }

    function Purchases() {
        let cut = parseFloat(process.env.REACT_APP_H2P_CUT)
        
        return (
            <Stack spacing={2}>
                <Divider><b>Acquisti ({lastMonth ? "Ultimo Mese" : "Sempre"})</b></Divider>
                <Stack spacing={2} className="bg-gray-100 rounded-md p-6">
                    <Typography><b>Acquisiti: </b>{purchases}</Typography>
                    <Typography><b>Ricavi: </b>{(amountGain - (amountGain * cut)).toFixed(2)}</Typography>
                </Stack>
            </Stack>
        )
    }

    function SingleReview({ review }) {
        return (
            <Stack spacing={2} className="bg-gray-100 rounded-md p-6">
                <Box className="flex">
                    <Box className="flex gap-2">
                        <b>{review.user.username}</b>
                        <Rating defaultValue={review.rating} precision={0.5} readOnly/>
                    </Box>
                    <Box className="grow justify-end flex">
                        {moment(review.created_at).format('DD/MM/YYYY')}
                    </Box>
                </Box>
                <Typography>
                    {review.body}
                </Typography>
            </Stack>
        )
    }

    function Reviews() {
        return (
            <Stack spacing={2}>
                <Divider><b>Recensioni ({lastMonth ? "Ultimo Mese" : "Sempre"})</b></Divider>

                {
                    reviews?.map(review =>
                        <SingleReview review={review} />
                    )
                }
            </Stack>
        )
    }

    if (!loading)
    return (
        <Box className="px-[10%] lg:px-[12%] relative py-10">
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate("/user/" + user.id + "#games")} />

            <Box className="absolute top-5 right-5 cursor-pointer bg-[#63748B] rounded-full w-[40px] aspect-square align-middle flex">
                <MdEdit onClick={() => handleEdit()} color="white" size={25} className="!m-auto" />
            </Box>

            <Stack spacing={2}>
                <GameCard game={game} />

                <Box className="flex justify-end">
                    <Typography className="!my-auto">Sempre</Typography>
                    <Switch checked={lastMonth} onChange={() => setLastMonth(!lastMonth)} />
                    <Typography className="!my-auto">Ultimo Mese</Typography>
                </Box>

                <VisitsProportion />

                <Purchases />

                { reviews.length > 0 && <Reviews /> }
            </Stack>
        </Box>
    )
}

export default GameStatisticsPage;