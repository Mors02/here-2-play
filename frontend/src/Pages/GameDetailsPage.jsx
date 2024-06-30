import React, { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { MdReport } from "react-icons/md";
import ReportGameModal from "../Modals/ReportGameModal";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import { TiDelete } from "react-icons/ti";
import { confirmAlert } from 'react-confirm-alert';
import Box from '@mui/material/Box';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import 'react-toastify/dist/ReactToastify.min.css';
import Rating from '@mui/material/Rating';
import moment from 'moment';
import useCurrentUser from "../config/UseCurrentUser.jsx";
import ReviewSection from "../Component/ReviewSection.jsx";
import { IoArrowBackCircle } from "react-icons/io5";
import GameCard from "../Component/GameCard";
import CheckIcon from '@mui/icons-material/Check';
import BundleList from "../Component/BundleList.jsx";
import { IoIosPlay } from "react-icons/io";

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
    const [owned, setOwned] = useState(false)
    const [bundles, setBundles] = useState([])
    const { user, loading, loggedIn } = useCurrentUser()
    const { gameId } = useParams()
    const navigate = useNavigate()

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
                if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                    throw new Error(res["response"]["data"])
                
                setGame(res.data)
                setAttachments(res.data.attachments)
                setMaxLength(res.data.attachments.length)
                setDiscount(res.data.discounts[0])

                setPageLoading(false)
            })
            .catch(err => {
                toast.error(ErrorMap[err.message])
            })
    }

    useEffect(() => {
        userOwns()
        bundlesOfGame()
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
                    style={{backgroundColor: '#f3f4f6'}}
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
        if (!loggedIn)
            return toast.error(ErrorMap("ERR_NOT_LOGGED_IN"))
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

    function userOwns() {
        axiosConfig.get('api/games/' + gameId + '/owned/')
        .then(res => {
            if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                throw new Error(res["response"]["data"])
            setOwned(res.data)
        })
        .catch(err => {
            toast.error(ErrorMap[err.message])
        })
    }

    function handleBundleClick(bundle) {
        return navigate('/bundle/' + bundle.id);
    }

    function bundlesOfGame() {
        axiosConfig.get('api/games/' + gameId + '/bundles/')
        .then(res => {
            if (res.code == "ERR_BAD_RESPONSE" || res.code == "ERR_BAD_REQUEST")
                throw new Error(res["response"]["data"])
            setBundles(res.data)
        })
        .catch(err => {
            console.log(err)
            toast.error(ErrorMap[err.message])
        })
    }

    function downloadGame() {
        const segments = game.uploaded_file.split('/')
        axiosConfig.get(process.env.REACT_APP_BASE_URL + "/" + game.uploaded_file, {
            responseType: 'blob',
        })
        .then(response => {
            if (response.code == "ERR_BAD_REQUEST" || response.code == "ERR_BAD_RESPONSE")
                throw new Error(response["response"]["data"])

            // Create a URL for the blob object
            const url = window.URL.createObjectURL(new Blob([response.data]));
            
            // Create a link element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', segments[segments.length - 1]); // Set the desired file name
            document.body.appendChild(link);
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url); // Free up memory
        })
        .catch(err => {
            toast.error(ErrorMap(err.message))
        })
    }

    function playGame() {
        window.open(
            "/play/" + gameId,
            'targetWindow',
            `toolbar=no,
            location=no,
            menubar=no,
            scrollbars=yes,
            resizable=yes,
            width=350,
            height=350`
        )
    }

    if (!loading && !pageLoading)
    return (
        <Stack spacing={4} className="px-[10%] lg:px-[12%] relative !mb-10">
            <IoArrowBackCircle color="#63748B" size={50} className="absolute top-4 left-4 cursor-pointer" onClick={() => navigate(-1)} />
            <Divider className="text-3xl !mt-8"><b>{game.title}</b></Divider>

            <Box className="bg-gray-100 border-4 border-[#f3f4f6] rounded-md">
                <Attachments />
            </Box>

            <GameCard game={game} owned={owned} />

            <Box className={"grid gap-4 " + (owned ? "grid-cols-3" : "grid-cols-2")}>
                { !owned && <Button variant="contained" onClick={() => addGame()} color="info">Aggiungi al carrello</Button> }
                { owned && <Button variant="contained" color="success" onClick={() => downloadGame()} startIcon={<CheckIcon />}>Download</Button> }
                { owned && <Button variant="contained" color="success" onClick={() => playGame()} startIcon={<IoIosPlay />}>Play</Button> }
                <Button variant="contained" color="error" onClick={() => openModal()} startIcon={<MdReport />}>Segnala</Button>
                <ReportGameModal 
                    closeModal={closeModal} 
                    modalIsOpen={modalIsOpen} 
                    gameReported={game}
                />
            </Box>
            {
                bundles.length > 0 &&
                <Box>
                    <Typography variant="h5">Il gioco compare in:</Typography>
                    <BundleList bundles={bundles} handleClick={handleBundleClick} />
                </Box>
            }
            {   
                (game.publisher?.id != user?.id) && owned && (
                    <ReviewSection game={game.id}/>
                ) 
            }
        </Stack>
    )
}

export default GameDetailsPage;