import React, { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { Button, Divider, Stack, Typography, Typography } from "@mui/material";
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

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function GameDetailsPage() {
    const theme = useTheme();
    const [modalIsOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attachments, setAttachments] = useState()
    const [activeStep, setActiveStep] = useState(0)
    const [maxLength, setMaxLength] = useState()
    const [discount, setDiscount] = useState()
    const [game, setGame] = useState([])
    const { gameId } = useParams()
    const navigate = useNavigate()
    const {user} = useCurrentUser()

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
        setLoading(true)

        return axiosConfig.get('/api/games/' + gameId)
            .then((res) => {
                console.log(res.data)
                
                setGame(res.data)
                setAttachments(res.data.attachments)
                setMaxLength(res.data.attachments.length)

                res.data.discounts.some(discount => {
                    let today = moment()
                    if (today.isAfter(moment(discount.start_date)) && today.isBefore(moment(discount.end_date))) {
                        setDiscount(discount)
                        return true
                    }
                })

                setLoading(false)
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
                            <img key={game.id} className="rounded-md overflow-hidden object-cover m-auto aspect-[1920/1080]" src={process.env.REACT_APP_BASE_URL + game.image} />
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

    if (!loading)
    return (
        <Stack spacing={4} className="px-[10%] lg:px-[15%]">
            <Divider className="text-3xl !mt-8"><b>{game.title}</b></Divider>

            <Box className="bg-gray-100 border-4 border-[#f3f4f6] rounded-md">
                <Attachments />
            </Box>
            
            <Box className="bg-gray-100 rounded-md flex !mb-10">
                <img className="aspect-[600/900] w-2/5 object-cover rounded-l" src={process.env.REACT_APP_BASE_URL + game.image} />
                <Box className="p-6 w-full relative">
                    <Stack className="w-full" spacing={1}>
                        <Divider><b>{game.title}</b></Divider>
                        <Typography><b>Descrizione: </b>{game.description}</Typography>
                        <Typography className="flex gap-2">
                            <b>Prezzo: </b>
                            <Price />
                        </Typography>
                        <Typography><b>Data di Pubblicazione: </b>{moment(game.upload_date).format('DD/MM/YYYY')}</Typography>
                        <Typography>
                            <b>Sviluppatore: </b>
                            <a className="text-blue-500" href={"/user/" + game.publisher.id}>{game.publisher.username}</a>
                        </Typography>
                        <Typography>
                            <b>Valutazione Media: </b>
                            {/* <Rating className="" defaultValue={2.5} precision={0.5} readOnly /> */}
                        </Typography>
                    </Stack>

                    <Box className="flex gap-4 absolute right-4 bottom-4">
                        <Button variant="contained" onClick={() => addGame()} color="info">Aggiungi al carrello</Button>
                        <Button variant="contained" color="error" onClick={() => openModal()}><MdReport className="mr-2" />Segnala</Button>
                        <ReportGameModal 
                            closeModal={closeModal} 
                            modalIsOpen={modalIsOpen} 
                            gameReported={game}
                        />
                    </Box>
                </Box>
            </Box>
        </Stack>
    )
}

export default GameDetailsPage;