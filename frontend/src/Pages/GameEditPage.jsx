import React, { useEffect, useState } from "react";
import { axiosConfig } from "../config/axiosConfig.js";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import { TiDelete } from "react-icons/ti";
import { toast } from "react-toastify";
import { confirmAlert } from 'react-confirm-alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import { Colors } from '../config/Colors.js'

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

function GameEditPage() {
    const theme = useTheme();
    const [game, setGame] = useState([])
    const [loading, setLoading] = useState()
    const [attachments, setAttachments] = useState()
    const [activeStep, setActiveStep] = useState(0)
    const [maxLength, setMaxLength] = useState()
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

        axiosConfig.get('/api/games/' + gameId)
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

    function confirmDeleteAttachment(id) {
        axiosConfig.delete('/api/attachments/' + id)
            .then(res => {
                if (res.status = 200) {
                    update()
                    return toast.success('Allegato cancellato con successo!')
                }
                return toast.error('Fallita cancellazione allegato!')
            })
    }

    function deleteAttachment(id) {
        confirmAlert({
          title: 'Sei sicuro di voler cancellare l\'allegato?',
          buttons: [
            {
              label: 'Conferma',
              onClick: () => { confirmDeleteAttachment(id) }
            },
            {
              label: 'Indietro'
            }
          ]
        });
    }

    function confirmDeleteGame() {
        axiosConfig.delete('/api/games/' + gameId + "/delete/")
            .then(res => {
                if (res.status == 200)
                    return toast.success('Gioco cancellato con successo!')
                return toast.error('Cancellazione del gioco fallita!')
            })
    }

    function deleteGame() {
        confirmAlert({
          title: 'Sei sicuro di voler cancellare il gioco?',
          buttons: [
            {
              label: 'Conferma',
              onClick: () => { confirmDeleteGame() }
            },
            {
              label: 'Indietro'
            }
          ]
        });
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
                        attachments.map((step, index) => {
                            return Math.abs(activeStep - index) <= 2 ? (
                            <Box key={step.id} className="relative">
                                <TiDelete onClick={() => deleteAttachment(step.id)} color='red' size={30} className="absolute right-2 top-2" />
                                <img className="h-[500px] object-cover m-auto" src={process.env.REACT_APP_BASE_URL + step.image_url} />
                            </Box>
                            ) : null
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
                    <img className="h-[300px] w-[500px] object-cover" src={process.env.REACT_APP_BASE_URL + game.image_url} />
                    <p>Descrizione: {game.description}</p>
                    <p>Prezzo: {game.price}</p>
                    <p>Giorno di pubblicazione: {game.upload_date}</p>
                    
                    { attachments?.length > 0 && <Attachments /> }
            
                    <Button color="success" variant="contained">Salva</Button>
                    <Button onClick={() => deleteGame()} color="error" variant="contained">Cancella</Button>
                </div>
            )}
        </Box>
    )
}

export default GameEditPage;