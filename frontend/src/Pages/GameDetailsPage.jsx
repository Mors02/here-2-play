import React, { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { MdReport } from "react-icons/md";
import ReportGameModal from "../Modals/ReportGameModal";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import { TiDelete } from "react-icons/ti";
import { confirmAlert } from 'react-confirm-alert';
import Box from '@mui/material/Box';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import { Colors } from '../config/Colors.js'
import 'react-toastify/dist/ReactToastify.min.css';
import Rating from '@mui/material/Rating';
import moment from 'moment';
import useCurrentUser from "../config/UseCurrentUser.jsx";
import ReviewSection from "../Component/ReviewSection.jsx";
import { IoArrowBackCircle } from "react-icons/io5";
import GameCard from "../Component/GameCard"

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function GameDetailsPage() {
    const theme = useTheme();
    const [modalIsOpen, setIsOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [attachments, setAttachments] = useState()
    const [activeStep, setActiveStep] = useState(0)
    const [maxLength, setMaxLength] = useState()
    const [discount, setDiscount] = useState()
    const [game, setGame] = useState([])
    const { gameId } = useParams()
    const navigate = useNavigate()
    const { user, loading } = useCurrentUser()

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };

    function updateData() {
        setPageLoading(true)

        return axiosConfig.get('/api/games/' + gameId)
            .then((res) => {
                console.log(res.data)
                
                setGame(res.data)
                setAttachments(res.data.attachments)
                setMaxLength(res.data.attachments.length)
                setDiscount(res.data.discounts[0])

                setPageLoading(false)
            })
    }

    useEffect(() => {
        updateData()
    }, [])

    function openModal() {
        setIsOpen(true);
    }
    
    function closeModal() {
        setIsOpen(false);
    }

    function Attachments() {
        return (
            <Box>
                <AutoPlaySwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={activeStep}
                    onChangeIndex={handleStepChange}
                    enableMouseEvents
                >
                    {
                        attachments.map(game => 
                            <img key={game.id} className="rounded-md overflow-hidden object-cover m-auto aspect-[1920/1080] w-full" src={process.env.REACT_APP_BASE_URL + game.image} />
                        )
                    }
                </AutoPlaySwipeableViews>
                <MobileStepper
                    style={{backgroundColor: Colors.light}}
                    steps={maxLength}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                        <Button size="small" className="!mb-[-2px]" onClick={handleNext} disabled={activeStep === maxLength - 1}>
                            Next
                            {theme.direction === 'rtl' ? (
                            <KeyboardArrowLeft />
                            ) : (
                            <KeyboardArrowRight />
                            )}
                        </Button>
                    }
                    backButton={
                        <Button size="small" className="!mb-[-2px]" onClick={handleBack} disabled={activeStep === 0}>
                            {theme.direction === 'rtl' ? (
                            <KeyboardArrowRight />
                            ) : (
                            <KeyboardArrowLeft />
                            )}
                            Back
                        </Button>
                    }
                />
            </Box>
        )
    }

    function addGame() {
        axiosConfig.post('api/orders/add-game/', {game_id: gameId})
            .then(res => {
                if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                    throw new Error(res["response"]["data"])
                toast.success("Gioco aggiunto al carrello.")
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }

    function Price() {
        if (discount) {
            return (
                <Box className="flex gap-3">
                    <Typography className="line-through">{game.price}</Typography>
                    <Typography>{(game.price - (game.price * discount.percentage / 100)).toFixed(2)}€</Typography>
                    <Typography className="rounded text-[#7CFC00] bg-[#228B22] px-1">-{discount.percentage}%</Typography>
                </Box>
            )
        }
        return game.price
    }

    function handleTagClick(id) {
        navigate('/', { state: { tagId: id } })
    }

    if (!loading && !pageLoading)
    return (
        <Stack spacing={4} className="px-[10%] lg:px-[12%] relative !mb-10">
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate(-1)} />
            <Divider className="text-3xl !mt-8"><b>{game.title}</b></Divider>

            <Box className="bg-gray-100 border-4 border-[#f3f4f6] rounded-md">
                <Attachments />
            </Box>

            <GameCard game={game} />

            <Box className="grid grid-cols-2 gap-4">
                <Button variant="contained" onClick={() => addGame()} color="info">Aggiungi al carrello</Button>
                <Button variant="contained" color="error" onClick={() => openModal()}><MdReport className="mr-2" />Segnala</Button>
                <ReportGameModal 
                    closeModal={closeModal} 
                    modalIsOpen={modalIsOpen} 
                    gameReported={game}
                />
            </Box>

            {   
                game.publisher?.id != user?.id && (
                    <ReviewSection game={game.id}/>
                ) 
            }
        </Stack>
    )
}

export default GameDetailsPage;