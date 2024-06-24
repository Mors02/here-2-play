import React, { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig";
import { Button } from "@mui/material";
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

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function GameDetailsPage() {
    const theme = useTheme();
    const [modalIsOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [attachments, setAttachments] = useState()
    const [activeStep, setActiveStep] = useState(0)
    const [maxLength, setMaxLength] = useState()
    const [game, setGame] = useState([])
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

    function update() {
        setLoading(true)

        return axiosConfig.get('/api/games/' + gameId)
            .then((res) => {
                setGame(res.data)

                axiosConfig.get('api/games/' + res.data.id + '/attachments')
                    .then(res => {
                        setAttachments(res.data)
                        setMaxLength(res.data.length)
                        setLoading(false)
                    })
            })
            .catch(err => {
                navigate('/your-games')
            })
    }

    useEffect(() => {
        update()
    }, [])

    function openModal() {
        setIsOpen(true);
    }
    
    function closeModal() {
        setIsOpen(false);
    }

    function Attachments() {
        return (
            <Box className="border-4 rounded-md">
                <AutoPlaySwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={activeStep}
                    onChangeIndex={handleStepChange}
                    enableMouseEvents
                >
                    {
                        attachments.map(game => {
                            return (
                                <Box key={game.id}>
                                    <img className="h-[500px] object-cover m-auto" src={process.env.REACT_APP_BASE_URL + game.image} />
                                </Box>
                            )
                        })
                    }
                </AutoPlaySwipeableViews>
                <MobileStepper
                    style={{backgroundColor: Colors.light}}
                    steps={maxLength}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                        <Button size="small" className="!mb-[-4px]" onClick={handleNext} disabled={activeStep === maxLength - 1}>
                            Next
                            {theme.direction === 'rtl' ? (
                            <KeyboardArrowLeft />
                            ) : (
                            <KeyboardArrowRight />
                            )}
                        </Button>
                    }
                    backButton={
                        <Button size="small" className="!mb-[-4px]" onClick={handleBack} disabled={activeStep === 0}>
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

    return (
        <Box>
            {
                !loading && (
                <div className="p-10 flex flex-col gap-4">
                    <h1 className="font-bold">{game.title}</h1>
                    <img className="h-[300px] w-[500px] object-cover" src={process.env.REACT_APP_BASE_URL + game.image} />
                    <p>Descrizione: {game.description}</p>
                    <p>Prezzo: {game.price}</p>
                    <p>Giorno di pubblicazione: {game.upload_date}</p>
                    
                    { attachments?.length > 0 && <Attachments /> }
            
                    <Button variant="contained" color="error" onClick={() => openModal()}><MdReport className="mr-2" />Segnala</Button>
                    <ReportGameModal 
                        closeModal={closeModal} 
                        modalIsOpen={modalIsOpen} 
                        gameReported={game}
                    />
                </div>
            )}
        </Box>
    )
}

export default GameDetailsPage;